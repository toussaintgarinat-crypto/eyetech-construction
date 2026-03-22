import SwiftUI

struct ARSessionView: View {
    let project: Project
    @StateObject private var viewModel = ARViewModel()
    @State private var showSettings = false
    @State private var showPointsList = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            // Vue AR plein écran
            ARViewContainer(viewModel: viewModel, project: project)
                .ignoresSafeArea()

            // HUD
            VStack {
                topBar
                Spacer()
                if viewModel.isLiDARAvailable {
                    lidarIndicator
                }
                bottomControls
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showSettings) {
            ARSettingsView(viewModel: viewModel)
        }
        .sheet(isPresented: $showPointsList) {
            DrillingPointsListView(points: viewModel.drillingPoints)
        }
    }

    // MARK: - Top Bar
    private var topBar: some View {
        HStack {
            Button(action: { dismiss() }) {
                Image(systemName: "xmark.circle.fill")
                    .font(.title2)
                    .foregroundStyle(.white)
                    .shadow(radius: 4)
            }

            Spacer()

            VStack(spacing: 2) {
                Text(project.name)
                    .font(.headline)
                    .foregroundStyle(.white)
                Text(viewModel.statusMessage)
                    .font(.caption)
                    .foregroundStyle(statusColor)
            }

            Spacer()

            HStack(spacing: 16) {
                Button(action: { showPointsList = true }) {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: "list.bullet.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.white)
                        if !viewModel.drillingPoints.isEmpty {
                            Text("\(viewModel.drillingPoints.count)")
                                .font(.system(size: 9, weight: .bold))
                                .padding(3)
                                .background(.red)
                                .clipShape(Circle())
                                .foregroundStyle(.white)
                                .offset(x: 6, y: -6)
                        }
                    }
                }

                Button(action: { showSettings = true }) {
                    Image(systemName: "slider.horizontal.3")
                        .font(.title2)
                        .foregroundStyle(.white)
                }
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.black.opacity(0.7), .clear],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }

    // MARK: - LiDAR Indicator
    private var lidarIndicator: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(.cyan)
                .frame(width: 8, height: 8)
                .opacity(viewModel.scanQuality > 0.5 ? 1 : 0.3)

            Text("LiDAR")
                .font(.caption.bold())
                .foregroundStyle(.cyan)

            ProgressView(value: Double(viewModel.scanQuality))
                .progressViewStyle(.linear)
                .tint(.cyan)
                .frame(width: 80)

            Text("\(Int(viewModel.scanQuality * 100))%")
                .font(.caption2)
                .foregroundStyle(.white)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(.black.opacity(0.6))
        .cornerRadius(20)
        .padding(.bottom, 8)
    }

    // MARK: - Bottom Controls
    private var bottomControls: some View {
        VStack(spacing: 16) {
            // Sélecteur orientation
            HStack(spacing: 12) {
                ForEach([
                    (GuideLine.GuideOrientation.vertical, "arrow.up.and.down", "Vertical"),
                    (.horizontal, "arrow.left.and.right", "Horizontal"),
                    (.both, "plus", "Les deux")
                ], id: \.0.hashValue) { orientation, icon, label in
                    Button(action: { viewModel.guideOrientation = orientation }) {
                        VStack(spacing: 4) {
                            Image(systemName: icon)
                            Text(label).font(.system(size: 10))
                        }
                        .frame(width: 70, height: 50)
                        .background(viewModel.guideOrientation == orientation ? .cyan : .white.opacity(0.15))
                        .cornerRadius(12)
                        .foregroundStyle(.white)
                    }
                }
            }

            // Boutons d'action
            HStack(spacing: 20) {
                // Annuler dernier
                Button(action: { viewModel.removeLastGuide() }) {
                    Image(systemName: "arrow.uturn.backward")
                        .font(.title2)
                        .frame(width: 56, height: 56)
                        .background(.white.opacity(0.2))
                        .clipShape(Circle())
                        .foregroundStyle(.white)
                }
                .disabled(viewModel.guideLines.isEmpty)

                // Instruction centrale
                Text("Touchez le mur\npour placer un guide")
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.white.opacity(0.8))
                    .frame(width: 120)

                // Tout effacer
                Button(action: { viewModel.clearAllGuides() }) {
                    Image(systemName: "trash")
                        .font(.title2)
                        .frame(width: 56, height: 56)
                        .background(.red.opacity(0.7))
                        .clipShape(Circle())
                        .foregroundStyle(.white)
                }
                .disabled(viewModel.guideLines.isEmpty)
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.clear, .black.opacity(0.8)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }

    private var statusColor: Color {
        if viewModel.statusMessage.contains("DANGER") { return .red }
        if viewModel.statusMessage.contains("validée") { return .green }
        return .white.opacity(0.8)
    }
}

// MARK: - Settings Sheet
struct ARSettingsView: View {
    @ObservedObject var viewModel: ARViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Appareil") {
                    HStack {
                        Label("LiDAR", systemImage: "sensor.tag.radiowaves.forward")
                        Spacer()
                        Text(viewModel.isLiDARAvailable ? "Disponible" : "Non disponible")
                            .foregroundStyle(viewModel.isLiDARAvailable ? .green : .orange)
                    }
                    HStack {
                        Label("Points de perçage", systemImage: "scope")
                        Spacer()
                        Text("\(viewModel.drillingPoints.count)")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Label("Guides actifs", systemImage: "line.diagonal")
                        Spacer()
                        Text("\(viewModel.guideLines.count)")
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Statistiques") {
                    HStack {
                        Text("Obstacles détectés")
                        Spacer()
                        Text("\(viewModel.obstacles.count)")
                    }
                    HStack {
                        Text("Qualité du scan")
                        Spacer()
                        Text("\(Int(viewModel.scanQuality * 100))%")
                    }
                }
            }
            .navigationTitle("Informations")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Fermer") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Drilling Points List
struct DrillingPointsListView: View {
    let points: [DrillingPoint]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List(points) { point in
                VStack(alignment: .leading, spacing: 4) {
                    Text(point.description ?? "Point #\(point.id)")
                        .font(.headline)
                    Text("X: \(String(format: "%.3f", point.x))  Y: \(String(format: "%.3f", point.y))  Z: \(String(format: "%.3f", point.z))")
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Points de perçage")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Fermer") { dismiss() }
                }
            }
        }
    }
}

extension GuideLine.GuideOrientation: Hashable {
    public func hash(into hasher: inout Hasher) {
        switch self {
        case .vertical:   hasher.combine(0)
        case .horizontal: hasher.combine(1)
        case .both:       hasher.combine(2)
        }
    }
}
