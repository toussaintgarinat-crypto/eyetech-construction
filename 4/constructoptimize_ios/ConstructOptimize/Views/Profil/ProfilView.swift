import SwiftUI
import Combine

struct ProfilView: View {
    @StateObject private var viewModel = ProfilViewModel()
    @EnvironmentObject var authViewModel: AuthenticationViewModel
    @State private var showingLogoutConfirmation = false
    @State private var showTutorial = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Avatar et infos utilisateur
                VStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(Color.constructOptimizeBlue.opacity(0.15))
                            .frame(width: 90, height: 90)
                        Image(systemName: "person.fill")
                            .font(.system(size: 44))
                            .foregroundColor(.constructOptimizeBlue)
                    }

                    if let config = viewModel.configuration {
                        Text("Mon compte")
                            .font(.title2)
                            .fontWeight(.bold)
                        if let adresse = config.preferencesRecherche.adresseDefaut {
                            Label(adresse, systemImage: "location.fill")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    } else {
                        Text("Mon compte")
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                }
                .padding(.top, 20)

                // Statistiques d'utilisation
                HStack(spacing: 0) {
                    StatProfilCard(value: "\(viewModel.nombreRecherches)", label: "Recherches", icon: "magnifyingglass", color: .constructOptimizeBlue)
                    Divider().frame(height: 60)
                    StatProfilCard(value: "\(viewModel.nombreComparaisons)", label: "Comparaisons", icon: "chart.bar.xaxis", color: .constructOptimizeGreen)
                    Divider().frame(height: 60)
                    StatProfilCard(value: "\(viewModel.economiesTotales, specifier: "%.0f") €", label: "Économisés", icon: "eurosign.circle", color: .constructOptimizeOrange)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)

                // Section Préférences
                VStack(alignment: .leading, spacing: 0) {
                    Text("Préférences")
                        .font(.headline)
                        .padding(.horizontal)
                        .padding(.bottom, 8)

                    VStack(spacing: 0) {
                        PreferenceRow(icon: "ruler", label: "Rayon de recherche", value: "\(viewModel.configuration?.preferencesRecherche.rayonRechercheDefaut ?? 50) km", color: .constructOptimizeBlue)
                        Divider().padding(.leading, 52)
                        PreferenceRow(icon: "arrow.up.arrow.down", label: "Tri par défaut", value: viewModel.configuration?.preferencesTri.triDefaut.displayName ?? "Prix croissant", color: .constructOptimizeBlue)
                        Divider().padding(.leading, 52)
                        PreferenceRow(icon: "bell.fill", label: "Notifications email", value: viewModel.configuration?.seuilsAlertes.notificationsEmail == true ? "Activées" : "Désactivées", color: .constructOptimizeOrange)
                        Divider().padding(.leading, 52)
                        PreferenceRow(icon: "iphone.radiowaves.left.and.right", label: "Notifications push", value: viewModel.configuration?.seuilsAlertes.notificationsPush == true ? "Activées" : "Désactivées", color: .constructOptimizeOrange)
                    }
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }

                // Section Affichage
                VStack(alignment: .leading, spacing: 0) {
                    Text("Affichage")
                        .font(.headline)
                        .padding(.horizontal)
                        .padding(.bottom, 8)

                    VStack(spacing: 0) {
                        PreferenceRow(icon: "list.number", label: "Résultats par page", value: "\(viewModel.configuration?.preferencesAffichage.nombreResultatsParPage ?? 20)", color: .constructOptimizeBlue)
                        Divider().padding(.leading, 52)
                        PreferenceRow(icon: "truck.box", label: "Afficher frais de livraison", value: viewModel.configuration?.preferencesAffichage.afficherFraisLivraison == true ? "Oui" : "Non", color: .constructOptimizeGreen)
                        Divider().padding(.leading, 52)
                        PreferenceRow(icon: "chart.line.uptrend.xyaxis", label: "Historique des prix", value: viewModel.configuration?.preferencesAffichage.afficherHistoriquePrix == true ? "Oui" : "Non", color: .constructOptimizeGreen)
                    }
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }

                // Section Aide
                VStack(alignment: .leading, spacing: 0) {
                    Text("Aide")
                        .font(.headline)
                        .padding(.horizontal)
                        .padding(.bottom, 8)

                    Button(action: { showTutorial = true }) {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color.constructOptimizeBlue.opacity(0.15))
                                    .frame(width: 32, height: 32)
                                Image(systemName: "book.fill")
                                    .font(.system(size: 14))
                                    .foregroundColor(.constructOptimizeBlue)
                            }
                            Text("Guide d'utilisation")
                                .font(.subheadline)
                                .foregroundColor(.primary)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 10)
                    }
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }

                // Section Application
                VStack(alignment: .leading, spacing: 0) {
                    Text("Application")
                        .font(.headline)
                        .padding(.horizontal)
                        .padding(.bottom, 8)

                    VStack(spacing: 0) {
                        PreferenceRow(icon: "info.circle", label: "Version", value: AppConstants.version, color: .secondary)
                        Divider().padding(.leading, 52)
                        PreferenceRow(icon: "server.rack", label: "Serveur", value: "localhost:8004", color: .secondary)
                    }
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }

                // Bouton de déconnexion
                Button(action: { showingLogoutConfirmation = true }) {
                    HStack {
                        Image(systemName: "arrow.right.square.fill")
                        Text("Se déconnecter")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .foregroundColor(.white)
                    .background(Color.red)
                    .cornerRadius(12)
                }
                .padding(.horizontal)
                .padding(.bottom, 30)
            }
        }
        .navigationTitle("Profil")
        .onAppear {
            viewModel.chargerConfiguration()
            viewModel.chargerStatistiques()
        }
        .alert("Déconnexion", isPresented: $showingLogoutConfirmation) {
            Button("Annuler", role: .cancel) { }
            Button("Se déconnecter", role: .destructive) {
                authViewModel.logout()
            }
        } message: {
            Text("Êtes-vous sûr de vouloir vous déconnecter ?")
        }
        .sheet(isPresented: $showTutorial) {
            COTutorialView(isPresented: $showTutorial)
        }
    }
}

// MARK: - Carte statistique profil
struct StatProfilCard: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
            Text(value)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Row préférence
struct PreferenceRow: View {
    let icon: String
    let label: String
    let value: String
    let color: Color

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 6)
                    .fill(color.opacity(0.15))
                    .frame(width: 32, height: 32)
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundColor(color)
            }
            Text(label)
                .font(.subheadline)
                .foregroundColor(.primary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
    }
}

// MARK: - ViewModel profil
class ProfilViewModel: ObservableObject {
    @Published var configuration: ConfigurationUtilisateur?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var nombreRecherches: Int = 0
    @Published var nombreComparaisons: Int = 0
    @Published var economiesTotales: Double = 0.0

    private var cancellables = Set<AnyCancellable>()

    func chargerConfiguration() {
        isLoading = true
        APIClient.shared.obtenirConfigurationUtilisateur()
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            } receiveValue: { [weak self] config in
                self?.configuration = config
            }
            .store(in: &cancellables)
    }

    func chargerStatistiques() {
        APIClient.shared.obtenirRecherchesUtilisateur()
            .receive(on: DispatchQueue.main)
            .sink { _ in } receiveValue: { [weak self] paginated in
                self?.nombreRecherches = paginated.count
                self?.nombreComparaisons = paginated.results.filter { $0.statut == .terminee }.count
            }
            .store(in: &cancellables)
    }
}

#Preview {
    NavigationView {
        ProfilView()
            .environmentObject(AuthenticationViewModel())
    }
}
