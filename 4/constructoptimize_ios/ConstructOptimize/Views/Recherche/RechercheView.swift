import SwiftUI

struct RechercheView: View {
    @EnvironmentObject var rechercheViewModel: RechercheViewModel
    @State private var showingFilters = false

    var body: some View {
        VStack(spacing: 0) {
            // Barre de recherche
            SearchBarView(text: $rechercheViewModel.searchText, onCommit: {
                rechercheViewModel.rechercherProduits()
            })
            .padding(.horizontal)
            .padding(.vertical, 8)

            // Contenu principal
            if rechercheViewModel.isLoading {
                Spacer()
                ProgressView("Recherche en cours...")
                    .progressViewStyle(CircularProgressViewStyle(tint: .constructOptimizeBlue))
                Spacer()
            } else if let erreur = rechercheViewModel.errorMessage {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.constructOptimizeOrange)
                    Text(erreur)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    Button("Réessayer") {
                        rechercheViewModel.rechercherProduits()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.constructOptimizeBlue)
                }
                Spacer()
            } else if rechercheViewModel.produits.isEmpty && !rechercheViewModel.searchText.isEmpty {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("Aucun produit trouvé")
                        .font(.headline)
                    Text("Essayez d'autres termes de recherche")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                Spacer()
            } else if rechercheViewModel.produits.isEmpty {
                Spacer()
                VStack(spacing: 16) {
                    Image(systemName: "cube.box.fill")
                        .font(.system(size: 64))
                        .foregroundColor(.constructOptimizeBlue.opacity(0.4))
                    Text("Recherchez des matériaux BTP")
                        .font(.headline)
                    Text("Comparez les prix de vos fournisseurs en temps réel")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }
                Spacer()
            } else {
                List(rechercheViewModel.produits) { produit in
                    ProduitRechercheRow(produit: produit) {
                        rechercheViewModel.lancerComparaison(produitId: produit.id)
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Recherche")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showingFilters.toggle() }) {
                    Image(systemName: "slider.horizontal.3")
                        .foregroundColor(.constructOptimizeBlue)
                }
            }
        }
        .sheet(isPresented: $showingFilters) {
            FiltresView(filtres: $rechercheViewModel.filtres, tri: $rechercheViewModel.tri)
        }
    }
}

// MARK: - Barre de recherche
struct SearchBarView: View {
    @Binding var text: String
    var onCommit: () -> Void

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)

            TextField("Ciment, acier, parpaing...", text: $text, onCommit: onCommit)
                .autocapitalization(.none)
                .disableAutocorrection(true)

            if !text.isEmpty {
                Button(action: { text = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(10)
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

// MARK: - Row produit dans les résultats
struct ProduitRechercheRow: View {
    let produit: Produit
    let onComparer: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(produit.nom)
                        .font(.headline)
                        .foregroundColor(.primary)
                    Text(produit.categorie.nom)
                        .font(.caption)
                        .foregroundColor(.constructOptimizeBlue)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.constructOptimizeBlue.opacity(0.1))
                        .cornerRadius(4)
                }
                Spacer()
                if let prixMin = produit.prixMin {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("dès")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Text(String(format: "%.2f €", prixMin))
                            .font(.headline)
                            .foregroundColor(.constructOptimizeGreen)
                        Text("/ \(produit.uniteMesure.symbol)")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }

            HStack(spacing: 12) {
                Label("\(produit.nombreFournisseurs) fournisseurs", systemImage: "building.2")
                    .font(.caption)
                    .foregroundColor(.secondary)

                if produit.noteMoyenne > 0 {
                    Label(String(format: "%.1f", produit.noteMoyenne), systemImage: "star.fill")
                        .font(.caption)
                        .foregroundColor(.yellow)
                }

                Spacer()

                Button("Comparer", action: onComparer)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.constructOptimizeBlue)
                    .cornerRadius(8)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Filtres
struct FiltresView: View {
    @Binding var filtres: FiltresRecherche
    @Binding var tri: TriRecherche
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            Form {
                Section("Tri") {
                    Picker("Trier par", selection: $tri) {
                        ForEach(TriRecherche.allCases, id: \.self) { t in
                            Label(t.displayName, systemImage: t.icon).tag(t)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Disponibilité") {
                    Toggle("Disponible uniquement", isOn: Binding(
                        get: { filtres.disponibleUniquement },
                        set: { newVal in
                            filtres = FiltresRecherche(
                                prixMin: filtres.prixMin,
                                prixMax: filtres.prixMax,
                                fournisseursInclus: filtres.fournisseursInclus,
                                rayonRecherche: filtres.rayonRecherche,
                                localisation: filtres.localisation,
                                categoriesIncluses: filtres.categoriesIncluses,
                                marquesIncluses: filtres.marquesIncluses,
                                disponibleUniquement: newVal,
                                livraison24h: filtres.livraison24h,
                                fournisseursVerifies: filtres.fournisseursVerifies
                            )
                        }
                    ))
                    Toggle("Livraison 24h", isOn: Binding(
                        get: { filtres.livraison24h },
                        set: { newVal in
                            filtres = FiltresRecherche(
                                prixMin: filtres.prixMin,
                                prixMax: filtres.prixMax,
                                fournisseursInclus: filtres.fournisseursInclus,
                                rayonRecherche: filtres.rayonRecherche,
                                localisation: filtres.localisation,
                                categoriesIncluses: filtres.categoriesIncluses,
                                marquesIncluses: filtres.marquesIncluses,
                                disponibleUniquement: filtres.disponibleUniquement,
                                livraison24h: newVal,
                                fournisseursVerifies: filtres.fournisseursVerifies
                            )
                        }
                    ))
                    Toggle("Fournisseurs vérifiés", isOn: Binding(
                        get: { filtres.fournisseursVerifies },
                        set: { newVal in
                            filtres = FiltresRecherche(
                                prixMin: filtres.prixMin,
                                prixMax: filtres.prixMax,
                                fournisseursInclus: filtres.fournisseursInclus,
                                rayonRecherche: filtres.rayonRecherche,
                                localisation: filtres.localisation,
                                categoriesIncluses: filtres.categoriesIncluses,
                                marquesIncluses: filtres.marquesIncluses,
                                disponibleUniquement: filtres.disponibleUniquement,
                                livraison24h: filtres.livraison24h,
                                fournisseursVerifies: newVal
                            )
                        }
                    ))
                }

                Section {
                    Button("Réinitialiser les filtres") {
                        filtres = .defaut
                        tri = .prix
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("Filtres")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Appliquer") { dismiss() }
                        .fontWeight(.semibold)
                        .foregroundColor(.constructOptimizeBlue)
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        RechercheView()
            .environmentObject(RechercheViewModel())
    }
}
