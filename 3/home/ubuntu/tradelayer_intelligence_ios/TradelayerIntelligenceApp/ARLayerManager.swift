import Foundation
import RealityKit
import ARKit
import SwiftUI

class ARLayerManager: ObservableObject {
    @Published var arView: ARView?
    
    func setupARView(arView: ARView) {
        self.arView = arView
        arView.session.delegate = self
        
        let configuration = ARWorldTrackingConfiguration()
        configuration.planeDetection = [.horizontal, .vertical]
        arView.session.run(configuration)
        
        arView.debugOptions = [.showFeaturePoints, .showWorldOrigin]
        arView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleTap)))
    }
    
    @objc func handleTap(recognizer: UITapGestureRecognizer) {
        guard let arView = arView else { return }
        let location = recognizer.location(in: arView)
        let results = arView.raycast(from: location, allowing: .estimatedPlane, alignment: .any)
        
        if let firstResult = results.first {
            let anchor = ARAnchor(name: "placed_object", transform: firstResult.worldTransform)
            arView.session.add(anchor)
        }
    }
    
    func loadAndDisplayLayers(forProject projectId: UUID) {
        APIClient.shared.fetchCalquesMetiers(forProject: projectId) { result in
            switch result {
            case .success(let calques):
                DispatchQueue.main.async {
                    print("Successfully fetched \(calques.count) calques.")
                    self.displayCalques(calques)
                }
            case .failure(let error):
                print("Error fetching calques: \(error.localizedDescription)")
            }
        }
        
        // Fetch and display spatial analysis data
        fetchAndDisplaySpatialAnalysisData(forProject: projectId)
    }
    
    private func displayCalques(_ calques: [CalqueMetier]) {
        guard let arView = arView else { return }
        
        for calque in calques {
            APIClient.shared.fetchElementCalques(forCalque: calque.id) { result in
                switch result {
                case .success(let elements):
                    DispatchQueue.main.async {
                        print("Successfully fetched \(elements.count) elements for calque \(calque.nom).")
                        for element in elements {
                            if let entity = self.createEntity(fromElementCalque: element, calqueColor: calque.couleur) {
                                let anchor = AnchorEntity()
                                anchor.addChild(entity)
                                arView.scene.addAnchor(anchor)
                            }
                        }
                    }
                case .failure(let error):
                    print("Error fetching elements for calque \(calque.nom): \(error.localizedDescription)")
                }
            }
        }
    }
    
    private func fetchAndDisplaySpatialAnalysisData(forProject projectId: UUID) {
        // Fetch ZonesAnalyse
        APIClient.shared.fetchZonesAnalyse(forProject: projectId) { result in
            switch result {
            case .success(let zones):
                DispatchQueue.main.async {
                    print("Successfully fetched \(zones.count) analysis zones.")
                    self.displayZonesAnalyse(zones)
                }
            case .failure(let error):
                print("Error fetching analysis zones: \(error.localizedDescription)")
            }
        }
        
        // Fetch PointInteret
        APIClient.shared.fetchPointsInteret(forProject: projectId) { result in
            switch result {
            case .success(let points):
                DispatchQueue.main.async {
                    print("Successfully fetched \(points.count) points of interest.")
                    self.displayPointsInteret(points)
                }
            case .failure(let error):
                print("Error fetching points of interest: \(error.localizedDescription)")
            }
        }
        
        // Fetch MesureSpatiale
        APIClient.shared.fetchMesuresSpatiales(forProject: projectId) { result in
            switch result {
            case .success(let mesures):
                DispatchQueue.main.async {
                    print("Successfully fetched \(mesures.count) spatial measurements.")
                    self.displayMesuresSpatiales(mesures)
                }
            case .failure(let error):
                print("Error fetching spatial measurements: \(error.localizedDescription)")
            }
        }
    }
    
    private func createEntity(fromElementCalque element: ElementCalque, calqueColor: String) -> ModelEntity? {
        let materialColor = Color(hex: element.couleur.isEmpty ? calqueColor : element.couleur)
        let material = SimpleMaterial(color: UIColor(materialColor), isMetallic: false)
        
        var mesh: MeshResource?
        var modelEntity: ModelEntity?
        
        // Extract position from geometry
        var position: SIMD3<Float> = .zero
        if let positionDict = element.geometrie["position"]?.value as? [String: Double], 
           let x = positionDict["x"], let y = positionDict["y"], let z = positionDict["z"] {
            position = SIMD3<Float>(Float(x), Float(y), Float(z))
        }
        
        switch element.type_element {
        case "point":
            mesh = MeshResource.generateSphere(radius: Float(element.taille / 2))
            modelEntity = ModelEntity(mesh: mesh!, materials: [material])
            modelEntity?.position = position
        case "ligne":
            // Assuming 'points' in geometry for a line: [[x1,y1,z1], [x2,y2,z2]]
            if let pointsArray = element.geometrie["points"]?.value as? [[String: Double]], pointsArray.count >= 2 {
                if let p1 = pointsArray.first, let p2 = pointsArray.last,
                   let x1 = p1["x"], let y1 = p1["y"], let z1 = p1["z"],
                   let x2 = p2["x"], let y2 = p2["y"], let z2 = p2["z"] {
                    
                    let startPoint = SIMD3<Float>(Float(x1), Float(y1), Float(z1))
                    let endPoint = SIMD3<Float>(Float(x2), Float(y2), Float(z2))
                    
                    let length = distance(startPoint, endPoint)
                    let midPoint = (startPoint + endPoint) / 2
                    
                    mesh = MeshResource.generateBox(width: Float(element.epaisseur_ligne / 100), height: Float(element.epaisseur_ligne / 100), depth: length)
                    modelEntity = ModelEntity(mesh: mesh!, materials: [material])
                    modelEntity?.position = midPoint
                    
                    // Orient the box to align with the line segment
                    let direction = normalize(endPoint - startPoint)
                    modelEntity?.orientation = simd_quatf(from: [0, 0, 1], to: direction)
                }
            }
        case "polygone", "rectangle":
            // Assuming 'vertices' in geometry for a polygon: [[x1,y1,z1], [x2,y2,z2], ...]
            if let verticesArray = element.geometrie["vertices"]?.value as? [[String: Double]], verticesArray.count >= 3 {
                // For simplicity, create a flat plane at the average Z position
                let xCoords = verticesArray.compactMap { $0["x"] }
                let yCoords = verticesArray.compactMap { $0["y"] }
                let zCoords = verticesArray.compactMap { $0["z"] }
                
                if let minX = xCoords.min(), let maxX = xCoords.max(),
                   let minY = yCoords.min(), let maxY = yCoords.max(),
                   let avgZ = zCoords.reduce(0.0, +) / Double(zCoords.count) {
                    
                    let width = Float(maxX - minX)
                    let depth = Float(maxY - minY)
                    
                    mesh = MeshResource.generatePlane(width: width, depth: depth)
                    modelEntity = ModelEntity(mesh: mesh!, materials: [material])
                    modelEntity?.position = SIMD3<Float>(Float(minX + width/2), Float(minY + depth/2), Float(avgZ))
                }
            }
        case "cercle":
            // Assuming 'radius' and 'center' in geometry
            if let radius = element.geometrie["radius"]?.value as? Double {
                mesh = MeshResource.generateSphere(radius: Float(radius))
                modelEntity = ModelEntity(mesh: mesh!, materials: [material])
                modelEntity?.position = position
            }
        case "texte":
            // RealityKit doesn't directly support 3D text generation from MeshResource easily.
            // This would typically involve SceneKit or custom model loading.
            // For now, represent as a small box at the text location.
            mesh = MeshResource.generateBox(size: 0.05)
            modelEntity = ModelEntity(mesh: mesh!, materials: [material])
            modelEntity?.position = position
            // TODO: Add actual 3D text rendering or billboard text
        case "symbole":
            // Placeholder for loading specific symbol models
            mesh = MeshResource.generateBox(size: 0.03)
            modelEntity = ModelEntity(mesh: mesh!, materials: [material])
            modelEntity?.position = position
            // TODO: Load actual symbol 3D models (e.g., USDZ)
        case "modele_3d":
            // Assuming 'model_url' in geometry pointing to a USDZ file
            if let modelURLString = element.geometrie["model_url"]?.value as? String, let url = URL(string: modelURLString) {
                // Asynchronously load 3D model
                _ = ModelEntity.loadModelAsync(contentsOf: url)
                    .sink(receiveCompletion: { completion in
                        if case let .failure(error) = completion {
                            print("Error loading 3D model from \(url): \(error.localizedDescription)")
                        }
                    }, receiveValue: { loadedModelEntity in
                        DispatchQueue.main.async {
                            loadedModelEntity.position = position
                            loadedModelEntity.orientation = simd_quatf(angle: .degrees(element.rotation), axis: [0, 1, 0])
                            loadedModelEntity.scale = SIMD3<Float>(repeating: element.taille)
                            
                            let anchor = AnchorEntity()
                            anchor.addChild(loadedModelEntity)
                            arView.scene.addAnchor(anchor)
                            print("Loaded and displayed 3D model from \(url).")
                        }
                    })
                return nil // Return nil for now as model loading is async
            }
            fallthrough // If model_url not found or invalid, fall back to default box
        default:
            mesh = MeshResource.generateBox(size: 0.02)
            modelEntity = ModelEntity(mesh: mesh!, materials: [material])
            modelEntity?.position = position
        }
        
        // Apply common transformations if modelEntity was created synchronously
        if let entity = modelEntity {
            entity.orientation = simd_quatf(angle: .degrees(element.rotation), axis: [0, 1, 0])
            entity.scale = SIMD3<Float>(repeating: element.taille)
        }
        
        return modelEntity
    }
    
    private func displayZonesAnalyse(_ zones: [ZoneAnalyse]) {
        guard let arView = arView else { return }
        for zone in zones {
            // Assuming geometrie_zone contains GeoJSON-like polygon data
            if let coordinates = zone.geometrie_zone["coordinates"]?.value as? [[[Double]]] {
                // For simplicity, represent the zone as a translucent box or plane
                // This needs more sophisticated parsing for actual GeoJSON polygons
                let material = SimpleMaterial(color: UIColor(Color.yellow.opacity(0.5)), isMetallic: false)
                let boxMesh = MeshResource.generateBox(width: 1.0, height: 0.1, depth: 1.0)
                let zoneEntity = ModelEntity(mesh: boxMesh, materials: [material])
                
                // Placeholder position, ideally derived from GeoJSON centroid
                zoneEntity.position = SIMD3<Float>(0, -0.5, -1)
                
                let anchor = AnchorEntity()
                anchor.addChild(zoneEntity)
                arView.scene.addAnchor(anchor)
                print("Displayed analysis zone: \(zone.nom)")
            }
        }
    }
    
    private func displayPointsInteret(_ points: [PointInteret]) {
        guard let arView = arView else { return }
        for point in points {
            let material = SimpleMaterial(color: UIColor(Color.purple), isMetallic: false)
            let sphereMesh = MeshResource.generateSphere(radius: 0.03)
            let pointEntity = ModelEntity(mesh: sphereMesh, materials: [material])
            
            pointEntity.position = SIMD3<Float>(point.position_x, point.position_y, point.position_z)
            
            let anchor = AnchorEntity()
            anchor.addChild(pointEntity)
            arView.scene.addAnchor(anchor)
            print("Displayed point of interest: \(point.nom)")
        }
    }
    
    private func displayMesuresSpatiales(_ mesures: [MesureSpatiale]) {
        guard let arView = arView else { return }
        for mesure in mesures {
            // For simplicity, represent measurements as lines or text labels
            let material = SimpleMaterial(color: UIColor(Color.orange), isMetallic: false)
            
            // Placeholder: create a simple line for any measurement type
            let boxMesh = MeshResource.generateBox(width: 0.01, height: 0.01, depth: 0.5)
            let mesureEntity = ModelEntity(mesh: boxMesh, materials: [material])
            
            // Placeholder position
            mesureEntity.position = SIMD3<Float>(0.2, 0.2, -0.8)
            
            let anchor = AnchorEntity()
            anchor.addChild(mesureEntity)
            arView.scene.addAnchor(anchor)
            print("Displayed spatial measurement: \(mesure.type_mesure) - \(mesure.valeur) \(mesure.unite)")
        }
    }
}

extension ARLayerManager: ARSessionDelegate {
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        for anchor in anchors {
            if let name = anchor.name, name == "placed_object" {
                let sphereMesh = MeshResource.generateSphere(radius: 0.05)
                let sphereMaterial = SimpleMaterial(color: .green, isMetallic: true)
                let sphereEntity = ModelEntity(mesh: sphereMesh, materials: [sphereMaterial])
                
                let anchorEntity = AnchorEntity(anchor: anchor)
                anchorEntity.addChild(sphereEntity)
                arView?.scene.addAnchor(anchorEntity)
                print("Placed a sphere at detected anchor.")
            }
        }
    }
    
    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {}
    
    func session(_ session: ARSession, didRemove anchors: [ARAnchor]) {}
    
    func session(_ session: ARSession, didFailWithError error: Error) {
        print("AR Session Failed: \(error.localizedDescription)")
    }
}

