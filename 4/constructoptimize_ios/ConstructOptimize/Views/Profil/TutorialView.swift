import SwiftUI

struct COTutorialStep {
    let numero: Int
    let titre: String
    let description: String
    let astuce: String
    let iconeName: String
}

struct COTutorialView: View {
    @Binding var isPresented: Bool
    @State private var etapeActuelle = 0

    let etapes: [COTutorialStep] = [
        COTutorialStep(
            numero: 1,
            titre: "Connexion",
            description: "Connectez-vous avec vos identifiants Eyetech. Votre compte vous donne acces aux prix negocies par votre entreprise.",
            astuce: "Votre role (conducteur, acheteur, chef de projet) determine vos droits.",
            iconeName: "person.badge.key.fill"
        ),
        COTutorialStep(
            numero: 2,
            titre: "Rechercher un materiau",
            description: "Dans l'onglet Recherche, tapez le materiau souhaite (ex: 'placo BA13', 'cable 2.5mm²', 'beton BPS250'). Entrez l'adresse du chantier et le rayon de livraison acceptable.",
            astuce: "Plus le rayon est petit, plus les resultats privilegient la proximite sur le prix.",
            iconeName: "magnifyingglass.circle.fill"
        ),
        COTutorialStep(
            numero: 3,
            titre: "Comprendre le score",
            description: "Le score composite combine :\n• 60% le prix (le moins cher = meilleur)\n• 40% la distance (le plus proche = meilleur)\n\nUn fournisseur a 5km peut valoir mieux qu'un moins cher a 80km si les frais de port sont eleves.",
            astuce: "Cliquez sur un resultat pour voir le detail du calcul de score.",
            iconeName: "chart.bar.fill"
        ),
        COTutorialStep(
            numero: 4,
            titre: "Activer la geolocalisation",
            description: "Dans l'onglet Fournisseurs, appuyez sur 'Ma position'. Autorisez la geolocalisation pour voir les fournisseurs proches de votre chantier, tries par distance reelle.",
            astuce: "La distance est calculee a vol d'oiseau. Prevoyez +20% pour les trajets routiers.",
            iconeName: "location.fill"
        ),
        COTutorialStep(
            numero: 5,
            titre: "Comparer et commander",
            description: "Selectionnez le meilleur fournisseur selon votre critere prioritaire. Les coordonnees et conditions de livraison sont disponibles dans la fiche fournisseur. Contactez directement ou transmettez a votre acheteur.",
            astuce: "Sauvegardez vos recherches pour retrouver facilement les prix compares.",
            iconeName: "cart.fill"
        ),
    ]

    var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.09, blue: 0.15).ignoresSafeArea()

            VStack(spacing: 0) {
                HStack {
                    Text("Guide ConstructOptimize")
                        .font(.title2).fontWeight(.bold).foregroundColor(.white)
                    Spacer()
                    Button(action: { isPresented = false }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2).foregroundColor(Color(white: 0.4))
                    }
                }
                .padding()

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3).fill(Color(white: 0.15)).frame(height: 6)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color(red: 0.1, green: 0.73, blue: 0.51))
                            .frame(width: geo.size.width * CGFloat(etapeActuelle + 1) / CGFloat(etapes.count), height: 6)
                            .animation(.easeInOut, value: etapeActuelle)
                    }
                }
                .frame(height: 6).padding(.horizontal)

                Text("\(etapeActuelle + 1) / \(etapes.count)")
                    .font(.caption).foregroundColor(Color(white: 0.5)).padding(.top, 8)

                ScrollView {
                    VStack(spacing: 20) {
                        let etape = etapes[etapeActuelle]

                        Image(systemName: etape.iconeName)
                            .font(.system(size: 64))
                            .foregroundColor(Color(red: 0.1, green: 0.73, blue: 0.51))
                            .padding(.top, 24)

                        VStack(spacing: 6) {
                            Text("ETAPE \(etape.numero)")
                                .font(.caption).fontWeight(.bold)
                                .foregroundColor(Color(red: 0.1, green: 0.73, blue: 0.51)).tracking(2)
                            Text(etape.titre)
                                .font(.title).fontWeight(.bold)
                                .foregroundColor(.white).multilineTextAlignment(.center)
                        }

                        Text(etape.description)
                            .font(.body).foregroundColor(Color(white: 0.72))
                            .multilineTextAlignment(.center).padding(.horizontal)

                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "lightbulb.fill")
                                .foregroundColor(Color(red: 0.1, green: 0.73, blue: 0.51))
                            Text(etape.astuce)
                                .font(.subheadline)
                                .foregroundColor(Color(red: 0.1, green: 0.73, blue: 0.51))
                        }
                        .padding()
                        .background(Color(red: 0.04, green: 0.28, blue: 0.2))
                        .overlay(RoundedRectangle(cornerRadius: 10)
                            .stroke(Color(red: 0.1, green: 0.73, blue: 0.51).opacity(0.35), lineWidth: 1))
                        .cornerRadius(10).padding(.horizontal)
                    }
                    .padding(.bottom, 100)
                }

                HStack(spacing: 14) {
                    if etapeActuelle > 0 {
                        Button(action: { etapeActuelle -= 1 }) {
                            HStack { Image(systemName: "chevron.left"); Text("Precedent") }
                                .frame(maxWidth: .infinity).padding()
                                .background(Color(white: 0.12)).foregroundColor(.white).cornerRadius(12)
                        }
                    }
                    if etapeActuelle < etapes.count - 1 {
                        Button(action: { etapeActuelle += 1 }) {
                            HStack { Text("Suivant"); Image(systemName: "chevron.right") }
                                .frame(maxWidth: .infinity).padding()
                                .background(Color(red: 0.1, green: 0.73, blue: 0.51))
                                .foregroundColor(.white).cornerRadius(12)
                        }
                    } else {
                        Button(action: { isPresented = false }) {
                            Text("Commencer")
                                .fontWeight(.bold).frame(maxWidth: .infinity).padding()
                                .background(Color(red: 0.1, green: 0.73, blue: 0.51))
                                .foregroundColor(.white).cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
        }
    }
}
