import SwiftUI

struct ComparaisonView: View {
    @EnvironmentObject var rechercheViewModel: RechercheViewModel

    var body: some View {
        Group {
            if rechercheViewModel.isLoading {
                VStack(spacing: 16) {
                    ProgressView("Comparaison en cours...")
                        .progressViewStyle(CircularProgressViewStyle(tint: .constructOptimizeBlue))
                    Text("Consultation de \(rechercheViewModel.resultats.isEmpty ? "tous les" : "\(rechercheViewModel.resultats.count)") fournisseurs...")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            } else if rechercheViewModel.resultats.isEmpty {
                VStack(spacing: 20) {
                    Image(systemName: "chart.bar.xaxis")
                        .font(.system(size: 64))
                        .foregroundColor(.constructOptimizeBlue.opacity(0.4))
                    Text("Aucune comparaison")
                        .font(.headline)
                    Text("Lancez une recherche de produit depuis l'onglet Recherche pour comparer les prix")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }
            } else {
                ScrollView {
                    VStack(spacing: 0) {
                        // En-tête résumé
                        if let meilleur = rechercheViewModel.resultats.min(by: { $0.prixTotalTTC < $1.prixTotalTTC }) {
                            ResumePrixView(meilleurResultat: meilleur, nbResultats: rechercheViewModel.resultats.count)
                                .padding()
                        }

                        Divider()

                        // Tableau des résultats
                        ForEach(Array(rechercheViewModel.resultats.sorted(by: { $0.prixTotalTTC < $1.prixTotalTTC }).enumerated()), id: \.element.id) { index, resultat in
                            ResultatComparaisonRow(resultat: resultat, rang: index + 1)
                            Divider()
                        }
                    }
                }
            }
        }
        .navigationTitle("Comparaison")
        .toolbar {
            if !rechercheViewModel.resultats.isEmpty {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { rechercheViewModel.reinitialiser() }) {
                        Image(systemName: "arrow.counterclockwise")
                            .foregroundColor(.constructOptimizeBlue)
                    }
                }
            }
        }
    }
}

// MARK: - Résumé prix
struct ResumePrixView: View {
    let meilleurResultat: ResultatComparaison
    let nbResultats: Int

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Meilleur prix")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(String(format: "%.2f € TTC", meilleurResultat.prixTotalTTC))
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.constructOptimizeGreen)
                    Text(meilleurResultat.prixProduit.fournisseur.nomCommercial ?? meilleurResultat.prixProduit.fournisseur.nom)
                        .font(.subheadline)
                        .foregroundColor(.primary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(nbResultats)")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.constructOptimizeBlue)
                    Text("fournisseurs")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("comparés")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            if meilleurResultat.fraisLivraison == 0 {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.constructOptimizeGreen)
                    Text("Livraison gratuite disponible")
                        .font(.caption)
                        .foregroundColor(.constructOptimizeGreen)
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Row résultat de comparaison
struct ResultatComparaisonRow: View {
    let resultat: ResultatComparaison
    let rang: Int

    var body: some View {
        HStack(spacing: 12) {
            // Rang
            ZStack {
                Circle()
                    .fill(rang == 1 ? Color.constructOptimizeGreen : rang == 2 ? Color.constructOptimizeBlue : Color.secondary.opacity(0.3))
                    .frame(width: 32, height: 32)
                Text("\(rang)")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }

            // Infos fournisseur
            VStack(alignment: .leading, spacing: 4) {
                Text(resultat.prixProduit.fournisseur.nomCommercial ?? resultat.prixProduit.fournisseur.nom)
                    .font(.headline)
                    .foregroundColor(.primary)

                HStack(spacing: 8) {
                    if resultat.prixProduit.fournisseur.verifie {
                        Label("Vérifié", systemImage: "checkmark.seal.fill")
                            .font(.caption)
                            .foregroundColor(.constructOptimizeBlue)
                    }

                    if resultat.delaiLivraisonEstime <= 1 {
                        Label("24h", systemImage: "clock.fill")
                            .font(.caption)
                            .foregroundColor(.constructOptimizeOrange)
                    } else {
                        Label("\(resultat.delaiLivraisonEstime)j", systemImage: "clock")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    if let distance = resultat.distanceFournisseur {
                        Label(String(format: "%.0f km", distance), systemImage: "location")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()

            // Prix
            VStack(alignment: .trailing, spacing: 2) {
                Text(String(format: "%.2f €", resultat.prixTotalTTC))
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(rang == 1 ? .constructOptimizeGreen : .primary)
                Text("TTC")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                if resultat.fraisLivraison > 0 {
                    Text(String(format: "+%.2f € livr.", resultat.fraisLivraison))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                } else {
                    Text("Livraison offerte")
                        .font(.caption2)
                        .foregroundColor(.constructOptimizeGreen)
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(rang == 1 ? Color.constructOptimizeGreen.opacity(0.05) : Color.clear)
    }
}

#Preview {
    NavigationView {
        ComparaisonView()
            .environmentObject(RechercheViewModel())
    }
}
