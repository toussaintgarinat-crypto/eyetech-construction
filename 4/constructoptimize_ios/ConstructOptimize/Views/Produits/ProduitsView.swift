import SwiftUI
import Combine

struct ProduitsView: View {
    @StateObject private var viewModel = ProduitsViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.produits.isEmpty {
                ProgressView("Chargement des produits...")
                    .progressViewStyle(CircularProgressViewStyle(tint: .constructOptimizeBlue))
            } else if let erreur = viewModel.errorMessage, viewModel.produits.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.constructOptimizeOrange)
                    Text(erreur)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    Button("Réessayer") { viewModel.chargerProduits() }
                        .buttonStyle(.borderedProminent)
                        .tint(.constructOptimizeBlue)
                }
            } else {
                List {
                    ForEach(viewModel.categories, id: \.id) { categorie in
                        Section(categorie.nom) {
                            ForEach(viewModel.produitsPourCategorie(categorie)) { produit in
                                NavigationLink(destination: ProduitDetailView(produit: produit)) {
                                    ProduitListRow(produit: produit)
                                }
                            }
                        }
                    }
                }
                .listStyle(.insetGrouped)
                .refreshable {
                    viewModel.chargerProduits()
                }
            }
        }
        .navigationTitle("Produits")
        .onAppear {
            if viewModel.produits.isEmpty {
                viewModel.chargerProduits()
            }
        }
    }
}

// MARK: - Row produit dans la liste
struct ProduitListRow: View {
    let produit: Produit

    var body: some View {
        HStack(spacing: 12) {
            // Icône catégorie
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.constructOptimizeBlue.opacity(0.1))
                    .frame(width: 44, height: 44)
                Image(systemName: "cube.box.fill")
                    .foregroundColor(.constructOptimizeBlue)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(produit.nom)
                    .font(.headline)
                    .foregroundColor(.primary)
                    .lineLimit(1)

                if let marque = produit.marque {
                    Text(marque.nom)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                HStack(spacing: 8) {
                    if let prixMin = produit.prixMin {
                        Text(String(format: "dès %.2f €/%@", prixMin, produit.uniteMesure.symbol))
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.constructOptimizeGreen)
                    }
                    Text("\(produit.nombreFournisseurs) fournisseurs")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            if produit.noteMoyenne > 0 {
                VStack(alignment: .trailing, spacing: 2) {
                    HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundColor(.yellow)
                        Text(String(format: "%.1f", produit.noteMoyenne))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Text("\(produit.nombreAvis) avis")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Détail produit
struct ProduitDetailView: View {
    let produit: Produit

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Infos principales
                VStack(alignment: .leading, spacing: 8) {
                    Text(produit.nom)
                        .font(.title2)
                        .fontWeight(.bold)

                    if let marque = produit.marque {
                        Text(marque.nom)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }

                    HStack {
                        Text(produit.categorie.nom)
                            .font(.caption)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color.constructOptimizeBlue.opacity(0.1))
                            .foregroundColor(.constructOptimizeBlue)
                            .cornerRadius(8)
                        Spacer()
                        if produit.noteMoyenne > 0 {
                            HStack(spacing: 4) {
                                ForEach(1...5, id: \.self) { i in
                                    Image(systemName: Double(i) <= produit.noteMoyenne ? "star.fill" : "star")
                                        .font(.caption)
                                        .foregroundColor(.yellow)
                                }
                                Text("(\(produit.nombreAvis))")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
                .padding(.horizontal)

                Divider()

                // Prix comparatif
                VStack(alignment: .leading, spacing: 12) {
                    Text("Comparaison des prix")
                        .font(.headline)
                        .padding(.horizontal)

                    ForEach(produit.prixFournisseurs.filter { $0.disponible }.sorted(by: { $0.prix < $1.prix })) { prixProduit in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(prixProduit.fournisseur.nomCommercial ?? prixProduit.fournisseur.nom)
                                    .font(.subheadline)
                                Text("Délai : \(prixProduit.delaiLivraison)j")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 2) {
                                Text(String(format: "%.2f €", prixProduit.prix))
                                    .font(.headline)
                                    .fontWeight(.bold)
                                    .foregroundColor(.constructOptimizeGreen)
                                Text("/ \(produit.uniteMesure.symbol)")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                        .padding(.horizontal)
                    }
                }

                Divider()

                // Description
                if !produit.description.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Description")
                            .font(.headline)
                        Text(produit.description)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal)
                }

                // Caractéristiques
                if !produit.caracteristiques.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Caractéristiques")
                            .font(.headline)
                            .padding(.horizontal)
                        ForEach(produit.caracteristiques.sorted(by: { $0.ordre < $1.ordre })) { carac in
                            HStack {
                                Text(carac.nom)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text("\(carac.valeur)\(carac.unite != nil ? " \(carac.unite!)" : "")")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                            }
                            .padding(.horizontal)
                        }
                    }
                }
            }
            .padding(.vertical)
        }
        .navigationTitle(produit.nom)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - ViewModel produits
class ProduitsViewModel: ObservableObject {
    @Published var produits: [Produit] = []
    @Published var categories: [Categorie] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private var cancellables = Set<AnyCancellable>()

    func chargerProduits() {
        isLoading = true
        errorMessage = nil

        APIClient.shared.rechercherProduits(terme: "")
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            } receiveValue: { [weak self] paginated in
                self?.produits = paginated.results
                // Extraire les catégories uniques
                var categoriesVues = Set<UUID>()
                self?.categories = paginated.results.compactMap { produit in
                    if !categoriesVues.contains(produit.categorie.id) {
                        categoriesVues.insert(produit.categorie.id)
                        return produit.categorie
                    }
                    return nil
                }.sorted(by: { $0.ordreAffichage < $1.ordreAffichage })
            }
            .store(in: &cancellables)
    }

    func produitsPourCategorie(_ categorie: Categorie) -> [Produit] {
        return produits.filter { $0.categorie.id == categorie.id }
    }
}

#Preview {
    NavigationView {
        ProduitsView()
    }
}
