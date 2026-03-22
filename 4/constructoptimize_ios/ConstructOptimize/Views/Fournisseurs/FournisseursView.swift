import SwiftUI
import Combine
import CoreLocation

struct FournisseursView: View {
    @StateObject private var viewModel = FournisseursViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.fournisseurs.isEmpty {
                ProgressView("Chargement des fournisseurs...")
                    .progressViewStyle(CircularProgressViewStyle(tint: .constructOptimizeBlue))
            } else if let erreur = viewModel.errorMessage, viewModel.fournisseurs.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.constructOptimizeOrange)
                    Text(erreur)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    Button("Réessayer") { viewModel.chargerFournisseurs() }
                        .buttonStyle(.borderedProminent)
                        .tint(.constructOptimizeBlue)
                }
            } else {
                List(viewModel.fournisseurs) { fournisseur in
                    NavigationLink(destination: FournisseurDetailView(fournisseur: fournisseur)) {
                        FournisseurListRow(fournisseur: fournisseur)
                    }
                }
                .listStyle(.plain)
                .refreshable {
                    viewModel.chargerFournisseurs()
                }
            }
        }
        .navigationTitle("Fournisseurs")
        .onAppear {
            if viewModel.fournisseurs.isEmpty {
                viewModel.chargerFournisseurs()
            }
        }
    }
}

// MARK: - Row fournisseur
struct FournisseurListRow: View {
    let fournisseur: Fournisseur

    var body: some View {
        HStack(spacing: 12) {
            // Icône type fournisseur
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.constructOptimizeBlue.opacity(0.1))
                    .frame(width: 50, height: 50)
                Image(systemName: fournisseur.typeFournisseur.icon)
                    .font(.title3)
                    .foregroundColor(.constructOptimizeBlue)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(fournisseur.nomCommercial ?? fournisseur.nom)
                        .font(.headline)
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    if fournisseur.verifie {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.caption)
                            .foregroundColor(.constructOptimizeBlue)
                    }
                }

                Text(fournisseur.typeFournisseur.displayName)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Color.constructOptimizeBlue.opacity(0.1))
                    .foregroundColor(.constructOptimizeBlue)
                    .cornerRadius(4)

                HStack(spacing: 12) {
                    if let adresse = fournisseur.adresse, let ville = adresse.ville {
                        Label(ville, systemImage: "location")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundColor(.yellow)
                        Text(String(format: "%.1f", fournisseur.noteQualite))
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("(\(fournisseur.nombreEvaluations))")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("\(fournisseur.delaiLivraisonMoyen)j")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.constructOptimizeOrange)
                Text("délai moy.")
                    .font(.caption2)
                    .foregroundColor(.secondary)

                if fournisseur.accepteCommandesEnLigne {
                    Image(systemName: "cart.fill")
                        .font(.caption)
                        .foregroundColor(.constructOptimizeGreen)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Détail fournisseur
struct FournisseurDetailView: View {
    let fournisseur: Fournisseur

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(fournisseur.nomCommercial ?? fournisseur.nom)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                if fournisseur.verifie {
                                    Image(systemName: "checkmark.seal.fill")
                                        .foregroundColor(.constructOptimizeBlue)
                                }
                            }
                            Text(fournisseur.typeFournisseur.displayName)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        VStack(spacing: 4) {
                            HStack(spacing: 2) {
                                Image(systemName: "star.fill")
                                    .foregroundColor(.yellow)
                                Text(String(format: "%.1f", fournisseur.noteQualite))
                                    .fontWeight(.bold)
                            }
                            Text("\(fournisseur.nombreEvaluations) avis")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding()

                Divider()

                // Informations de contact
                VStack(alignment: .leading, spacing: 12) {
                    Text("Contact")
                        .font(.headline)
                        .padding(.horizontal)

                    if let adresse = fournisseur.adresse {
                        InfoRow(icon: "location.fill", label: "Adresse", value: adresse.adresseComplete, color: .constructOptimizeBlue)
                    }
                    if let telephone = fournisseur.telephone {
                        InfoRow(icon: "phone.fill", label: "Téléphone", value: telephone, color: .constructOptimizeGreen)
                    }
                    if let email = fournisseur.email {
                        InfoRow(icon: "envelope.fill", label: "Email", value: email, color: .constructOptimizeBlue)
                    }
                    if let siteWeb = fournisseur.siteWeb {
                        InfoRow(icon: "globe", label: "Site web", value: siteWeb, color: .constructOptimizeOrange)
                    }
                }

                Divider()

                // Livraison et commandes
                VStack(alignment: .leading, spacing: 12) {
                    Text("Livraison")
                        .font(.headline)
                        .padding(.horizontal)

                    HStack {
                        StatCard(value: "\(fournisseur.delaiLivraisonMoyen)j", label: "Délai moyen", color: .constructOptimizeOrange)
                        if let seuilGratuite = fournisseur.fraisLivraisonGratuite {
                            StatCard(value: String(format: "%.0f €", seuilGratuite), label: "Livraison gratuite dès", color: .constructOptimizeGreen)
                        }
                        StatCard(
                            value: fournisseur.accepteCommandesEnLigne ? "Oui" : "Non",
                            label: "Commande en ligne",
                            color: fournisseur.accepteCommandesEnLigne ? .constructOptimizeGreen : .secondary
                        )
                    }
                    .padding(.horizontal)
                }

                // Description
                if let description = fournisseur.description, !description.isEmpty {
                    Divider()
                    VStack(alignment: .leading, spacing: 8) {
                        Text("À propos")
                            .font(.headline)
                        Text(description)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                }
            }
            .padding(.vertical)
        }
        .navigationTitle(fournisseur.nomCommercial ?? fournisseur.nom)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Sous-vues utilitaires
struct InfoRow: View {
    let icon: String
    let label: String
    let value: String
    let color: Color

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 20)
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.subheadline)
            }
        }
        .padding(.horizontal)
    }
}

struct StatCard: View {
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(color)
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(10)
        .background(color.opacity(0.08))
        .cornerRadius(10)
    }
}

// MARK: - ViewModel fournisseurs
class FournisseursViewModel: ObservableObject {
    @Published var fournisseurs: [Fournisseur] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private var cancellables = Set<AnyCancellable>()

    func chargerFournisseurs() {
        isLoading = true
        errorMessage = nil

        APIClient.shared.obtenirFournisseurs()
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            } receiveValue: { [weak self] paginated in
                self?.fournisseurs = paginated.results
            }
            .store(in: &cancellables)
    }
}

#Preview {
    NavigationView {
        FournisseursView()
    }
}
