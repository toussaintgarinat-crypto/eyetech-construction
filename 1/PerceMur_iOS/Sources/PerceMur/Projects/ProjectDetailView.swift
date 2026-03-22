import SwiftUI

struct ProjectDetailView: View {
    let project: Project
    @State private var showARSession = false
    @State private var drillingPoints: [DrillingPoint] = []
    @State private var isLoadingPoints = false

    var body: some View {
        List {
            // Infos projet
            Section("Informations") {
                if let desc = project.description, !desc.isEmpty {
                    Label(desc, systemImage: "text.alignleft")
                }
                if let loc = project.location, !loc.isEmpty {
                    Label(loc, systemImage: "mappin.circle")
                }
            }

            // Bouton AR
            Section {
                Button(action: { showARSession = true }) {
                    HStack {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "arkit")
                                .font(.system(size: 40))
                                .foregroundStyle(.cyan)
                            Text("Lancer la session AR")
                                .font(.headline)
                                .foregroundStyle(.primary)
                            Text("Placez des guides de perçage en réalité augmentée")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        Spacer()
                    }
                    .padding()
                }
            }

            // Points de perçage
            Section("Points de perçage (\(drillingPoints.count))") {
                if isLoadingPoints {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                } else if drillingPoints.isEmpty {
                    Text("Aucun point enregistré")
                        .foregroundStyle(.secondary)
                        .italic()
                } else {
                    ForEach(drillingPoints) { point in
                        VStack(alignment: .leading, spacing: 2) {
                            Text(point.description ?? "Point #\(point.id)")
                                .font(.subheadline)
                            Text("X:\(String(format: "%.2f", point.x)) Y:\(String(format: "%.2f", point.y)) Z:\(String(format: "%.2f", point.z))")
                                .font(.caption.monospaced())
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
        .navigationTitle(project.name)
        .navigationBarTitleDisplayMode(.large)
        .fullScreenCover(isPresented: $showARSession) {
            ARSessionView(project: project)
        }
        .task { await loadPoints() }
        .refreshable { await loadPoints() }
    }

    private func loadPoints() async {
        isLoadingPoints = true
        do {
            drillingPoints = try await APIClient.shared.getDrillingPoints(projectId: project.id)
        } catch {}
        isLoadingPoints = false
    }
}
