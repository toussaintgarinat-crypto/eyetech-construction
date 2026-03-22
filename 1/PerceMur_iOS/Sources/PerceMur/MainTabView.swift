import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        TabView {
            ProjectsView()
                .tabItem {
                    Label("Projets", systemImage: "folder.fill")
                }

            DashboardView()
                .tabItem {
                    Label("Tableau de bord", systemImage: "chart.bar.fill")
                }

            SettingsView()
                .tabItem {
                    Label("Réglages", systemImage: "gear")
                }
        }
        .tint(.cyan)
    }
}

// MARK: - Dashboard
struct DashboardView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    HStack(spacing: 16) {
                        StatCard(title: "Projets", value: "—", icon: "folder", color: .cyan)
                        StatCard(title: "Points AR", value: "—", icon: "scope", color: .green)
                    }
                    HStack(spacing: 16) {
                        StatCard(title: "Obstacles", value: "—", icon: "exclamationmark.triangle", color: .orange)
                        StatCard(title: "Sessions", value: "—", icon: "arkit", color: .purple)
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Fonctionnalités")
                            .font(.headline)
                            .padding(.horizontal)

                        FeatureRow(icon: "sensor.tag.radiowaves.forward", color: .cyan,
                                   title: "LiDAR actif",
                                   desc: "Détection des obstacles en temps réel")
                        FeatureRow(icon: "line.diagonal", color: .green,
                                   title: "Guides spatiaux",
                                   desc: "Lignes verticales et horizontales ancrées")
                        FeatureRow(icon: "icloud.and.arrow.up", color: .blue,
                                   title: "Sync cloud",
                                   desc: "Points de perçage sauvegardés sur le serveur")
                        FeatureRow(icon: "exclamationmark.shield", color: .orange,
                                   title: "Normes DTU/NF",
                                   desc: "Vérification des normes de sécurité")
                    }
                    .padding(.vertical)
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(16)
                    .padding(.horizontal)
                }
                .padding(.top)
            }
            .navigationTitle("Perce-Mur")
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.title.bold())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(16)
    }
}

struct FeatureRow: View {
    let icon: String
    let color: Color
    let title: String
    let desc: String

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
                .frame(width: 36)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.subheadline.bold())
                Text(desc).font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(.horizontal)
    }
}

// MARK: - Settings
struct SettingsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showTutorial = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Aide") {
                    Button(action: { showTutorial = true }) {
                        Label("Guide d'utilisation", systemImage: "book.fill")
                            .foregroundStyle(.blue)
                    }
                }

                Section("Serveur") {
                    HStack {
                        Text("API")
                        Spacer()
                        Text("localhost:8001")
                            .foregroundStyle(.secondary)
                            .font(.caption.monospaced())
                    }
                }

                Section("Session") {
                    Button(role: .destructive, action: { authViewModel.logout() }) {
                        Label("Se déconnecter", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }

                Section("À propos") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0").foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Développé par")
                        Spacer()
                        Text("Eyetech").foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Réglages")
            .sheet(isPresented: $showTutorial) {
                TutorialView(isPresented: $showTutorial)
            }
        }
    }
}
