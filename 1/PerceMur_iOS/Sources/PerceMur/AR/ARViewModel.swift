import SwiftUI
import ARKit
import RealityKit
import Combine

@MainActor
class ARViewModel: ObservableObject {
    @Published var guideLines: [GuideLine] = []
    @Published var obstacles: [Obstacle] = []
    @Published var drillingPoints: [DrillingPoint] = []
    @Published var isLiDARAvailable = false
    @Published var scanQuality: Float = 0
    @Published var statusMessage = "Pointez vers une surface..."
    @Published var showObstacleAlert = false
    @Published var detectedObstacleType = ""
    @Published var guideOrientation: GuideLine.GuideOrientation = .both
    @Published var guideColor: GuideLine.GuideColor = .green

    var arView: ARView?
    private var project: Project?
    private var anchors: [UUID: AnchorEntity] = [:]

    // MARK: - Setup
    func setup(arView: ARView, project: Project) {
        self.arView = arView
        self.project = project
        isLiDARAvailable = ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh)
        configureARSession()
        loadDrillingPoints()
    }

    private func configureARSession() {
        guard let arView else { return }
        let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.vertical, .horizontal]
        config.environmentTexturing = .automatic

        if isLiDARAvailable {
            config.sceneReconstruction = .meshWithClassification
            statusMessage = "LiDAR actif — scan en cours..."
        } else {
            statusMessage = "Mode caméra — pointez vers un mur..."
        }

        arView.session.run(config)
        arView.debugOptions = []
    }

    // MARK: - Tap Handler
    func handleTap(at location: CGPoint) {
        guard let arView else { return }

        let results = arView.raycast(
            from: location,
            allowing: .estimatedPlane,
            alignment: .vertical
        )

        guard let result = results.first else {
            statusMessage = "Aucune surface détectée — réessayez"
            return
        }

        let position = SIMD3<Float>(
            result.worldTransform.columns.3.x,
            result.worldTransform.columns.3.y,
            result.worldTransform.columns.3.z
        )

        // Vérifier obstacles LiDAR
        if isObstacleNear(position: position) {
            guideColor = .red
            statusMessage = "DANGER — Obstacle détecté !"
        } else {
            guideColor = .green
            statusMessage = "Position validée — perçage possible"
        }

        addGuideLines(at: position, in: arView)
        saveDrillingPoint(position: position)
    }

    // MARK: - Guide Lines AR
    private func addGuideLines(at position: SIMD3<Float>, in arView: ARView) {
        let anchor = AnchorEntity(world: position)

        // Ligne verticale
        if guideOrientation == .vertical || guideOrientation == .both {
            let verticalLine = makeLineMesh(
                start: SIMD3<Float>(0, -1.5, 0),
                end: SIMD3<Float>(0, 1.5, 0),
                color: guideColor
            )
            anchor.addChild(verticalLine)
        }

        // Ligne horizontale
        if guideOrientation == .horizontal || guideOrientation == .both {
            let horizontalLine = makeLineMesh(
                start: SIMD3<Float>(-1.5, 0, 0),
                end: SIMD3<Float>(1.5, 0, 0),
                color: guideColor
            )
            anchor.addChild(horizontalLine)
        }

        // Point central
        let sphere = ModelEntity(
            mesh: .generateSphere(radius: 0.015),
            materials: [SimpleMaterial(color: .white, isMetallic: true)]
        )
        anchor.addChild(sphere)

        // Label de distance
        let distanceMesh = MeshResource.generateText(
            "Perçage #\(drillingPoints.count + 1)",
            extrusionDepth: 0.001,
            font: .systemFont(ofSize: 0.04)
        )
        let label = ModelEntity(
            mesh: distanceMesh,
            materials: [SimpleMaterial(color: .white, isMetallic: false)]
        )
        label.position = SIMD3<Float>(-0.08, 0.06, 0)
        anchor.addChild(label)

        arView.scene.addAnchor(anchor)

        let guide = GuideLine(
            anchorPosition: position,
            orientation: guideOrientation,
            color: guideColor
        )
        guideLines.append(guide)
        anchors[guide.id] = anchor
    }

    private func makeLineMesh(
        start: SIMD3<Float>,
        end: SIMD3<Float>,
        color: GuideLine.GuideColor
    ) -> ModelEntity {
        let length = distance(start, end)
        let midPoint = (start + end) / 2
        let direction = normalize(end - start)

        let mesh = MeshResource.generateBox(
            width: 0.003,
            height: length,
            depth: 0.003
        )

        let rgba = color.rgba
        let uiColor = UIColor(
            red: CGFloat(rgba.x),
            green: CGFloat(rgba.y),
            blue: CGFloat(rgba.z),
            alpha: CGFloat(rgba.w)
        )
        var material = SimpleMaterial()
        material.color = .init(tint: uiColor)
        material.metallic = 0.3
        material.roughness = 0.4

        let entity = ModelEntity(mesh: mesh, materials: [material])
        entity.position = midPoint
        entity.orientation = simd_quatf(from: SIMD3<Float>(0, 1, 0), to: direction)
        return entity
    }

    // MARK: - LiDAR Obstacle Detection
    func processLiDARFrame(_ frame: ARFrame) {
        guard isLiDARAvailable else { return }

        scanQuality = Float(frame.worldMappingStatus.rawValue) / 3.0

        // Détecter les obstacles via la classification de maillage
        if let meshAnchors = frame.anchors.compactMap({ $0 as? ARMeshAnchor }) as? [ARMeshAnchor] {
            var detectedObstacles: [Obstacle] = []

            for anchor in meshAnchors {
                let mesh = anchor.geometry
                for i in 0..<mesh.faces.count {
                    let classification = mesh.classificationOf(faceWithIndex: i)
                    let obstacleType: Obstacle.ObstacleType

                    switch classification {
                    case .wall:          obstacleType = .wall
                    case .seat, .table:  obstacleType = .beam
                    default:             continue
                    }

                    // Position approximative de la face
                    let faceCenter = mesh.faceCenter(at: i, transform: anchor.transform)
                    let obstacle = Obstacle(
                        position: faceCenter,
                        type: obstacleType,
                        confidence: 0.8
                    )
                    detectedObstacles.append(obstacle)
                }
            }

            if !detectedObstacles.isEmpty {
                obstacles = Array(detectedObstacles.prefix(20))
                statusMessage = "\(detectedObstacles.count) surfaces détectées"
            }
        }
    }

    private func isObstacleNear(position: SIMD3<Float>) -> Bool {
        obstacles.contains { obs in
            distance(obs.position, position) < 0.1
        }
    }

    // MARK: - Drilling Points
    private func loadDrillingPoints() {
        guard let project else { return }
        Task {
            do {
                drillingPoints = try await APIClient.shared.getDrillingPoints(projectId: project.id)
                statusMessage = "\(drillingPoints.count) points chargés"
            } catch {}
        }
    }

    private func saveDrillingPoint(position: SIMD3<Float>) {
        guard let project else { return }
        Task {
            let payload = CreateDrillingPointPayload(
                project: project.id,
                x: Double(position.x),
                y: Double(position.y),
                z: Double(position.z),
                description: "Point de perçage #\(drillingPoints.count + 1)"
            )
            do {
                let point = try await APIClient.shared.createDrillingPoint(payload)
                drillingPoints.append(point)
            } catch {}
        }
    }

    // MARK: - Actions
    func clearAllGuides() {
        guard let arView else { return }
        for (_, anchor) in anchors {
            arView.scene.removeAnchor(anchor)
        }
        anchors.removeAll()
        guideLines.removeAll()
        statusMessage = "Guides effacés — pointez vers une surface"
    }

    func removeLastGuide() {
        guard let lastGuide = guideLines.last,
              let anchor = anchors[lastGuide.id],
              let arView else { return }
        arView.scene.removeAnchor(anchor)
        anchors.removeValue(forKey: lastGuide.id)
        guideLines.removeLast()
    }
}

// MARK: - ARKit Extensions
extension ARMeshGeometry {
    func faceCenter(at index: Int, transform: simd_float4x4) -> SIMD3<Float> {
        let indices = faces.buffer.contents().advanced(by: index * faces.bytesPerIndex * 3)
            .bindMemory(to: UInt32.self, capacity: 3)

        var center = SIMD3<Float>.zero
        for i in 0..<3 {
            let vertexIndex = Int(indices[i])
            let vertex = vertices.buffer.contents()
                .advanced(by: vertexIndex * vertices.stride)
                .bindMemory(to: Float.self, capacity: 3)
            center += SIMD3<Float>(vertex[0], vertex[1], vertex[2])
        }
        center /= 3
        let worldPos = transform * SIMD4<Float>(center.x, center.y, center.z, 1)
        return SIMD3<Float>(worldPos.x, worldPos.y, worldPos.z)
    }
}
