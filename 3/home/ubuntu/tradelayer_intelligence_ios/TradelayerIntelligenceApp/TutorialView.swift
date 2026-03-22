import SwiftUI

struct TLTutorialStep {
    let numero: Int
    let titre: String
    let description: String
    let astuce: String
    let iconeName: String
    let couleur: Color
}

struct TLTutorialView: View {
    @Binding var isPresented: Bool
    @State private var etapeActuelle = 0

    let etapes: [TLTutorialStep] = [
        TLTutorialStep(
            numero: 1,
            titre: "Comprendre les calques",
            description: "Le bureau cree des calques numeriques par corps de metier (plomberie, electricite, placo...). Chaque calque contient les elements a poser sur le chantier.",
            astuce: "Un calque = un corps de metier. Vous ne voyez que les calques de votre metier.",
            iconeName: "square.3.layers.3d.fill",
            couleur: .blue
        ),
        TLTutorialStep(
            numero: 2,
            titre: "Ouvrir la vue AR",
            description: "Lancez l'application et autorisez l'acces a la camera. Le LiDAR scanne automatiquement l'espace. Les elements du calque apparaissent en superposition sur la realite.",
            astuce: "Attendez que le point 'Calibration OK' apparaisse avant de commencer a travailler.",
            iconeName: "camera.viewfinder",
            couleur: .purple
        ),
        TLTutorialStep(
            numero: 3,
            titre: "Lire les elements AR",
            description: "Chaque element a une couleur selon son type :\n• Bleu = a installer\n• Vert = valide\n• Rouge = conflit/probleme\nSuivez les elements bleus pour savoir ou poser chaque piece.",
            astuce: "Tournez-vous lentement pour voir tous les elements autour de vous.",
            iconeName: "eye.fill",
            couleur: .green
        ),
        TLTutorialStep(
            numero: 4,
            titre: "Commandes vocales",
            description: "Appuyez sur le bouton microphone et parlez :\n• 'Suivant element' — passe a l'element suivant\n• 'Valider' — marque l'element comme pose\n• 'Aide plomberie' — appelle le specialiste IA",
            astuce: "Parlez clairement. Les commandes fonctionnent meme avec un casque de chantier.",
            iconeName: "mic.fill",
            couleur: .orange
        ),
        TLTutorialStep(
            numero: 5,
            titre: "Consulter le specialiste IA",
            description: "En cas de doute sur une norme ou une technique, dites 'Aide [votre metier]'. L'assistant specialise repond en s'appuyant sur les DTU et normes NF officielles.",
            astuce: "L'IA connait les normes DTU, NF EN, ISO specifiques a votre corps de metier.",
            iconeName: "brain.head.profile",
            couleur: Color(red: 0.1, green: 0.8, blue: 0.5)
        ),
    ]

    var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.09, blue: 0.15).ignoresSafeArea()

            VStack(spacing: 0) {
                HStack {
                    Text("Guide TradeLayer AR")
                        .font(.title2).fontWeight(.bold).foregroundColor(.white)
                    Spacer()
                    Button(action: { isPresented = false }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2).foregroundColor(Color(white: 0.4))
                    }
                }
                .padding()

                // Progress
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3).fill(Color(white: 0.15)).frame(height: 6)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(etapes[etapeActuelle].couleur)
                            .frame(width: geo.size.width * CGFloat(etapeActuelle + 1) / CGFloat(etapes.count), height: 6)
                            .animation(.easeInOut, value: etapeActuelle)
                    }
                }
                .frame(height: 6).padding(.horizontal)

                Text("Etape \(etapeActuelle + 1) / \(etapes.count)")
                    .font(.caption).foregroundColor(Color(white: 0.5)).padding(.top, 8)

                ScrollView {
                    VStack(spacing: 20) {
                        let etape = etapes[etapeActuelle]

                        Image(systemName: etape.iconeName)
                            .font(.system(size: 64))
                            .foregroundColor(etape.couleur)
                            .padding(.top, 24)

                        VStack(spacing: 6) {
                            Text("ETAPE \(etape.numero)")
                                .font(.caption).fontWeight(.bold)
                                .foregroundColor(etape.couleur).tracking(2)
                            Text(etape.titre)
                                .font(.title).fontWeight(.bold)
                                .foregroundColor(.white).multilineTextAlignment(.center)
                        }

                        Text(etape.description)
                            .font(.body).foregroundColor(Color(white: 0.72))
                            .multilineTextAlignment(.center).padding(.horizontal)

                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "lightbulb.fill")
                                .foregroundColor(Color(red: 0.1, green: 0.8, blue: 0.5))
                            Text(etape.astuce)
                                .font(.subheadline)
                                .foregroundColor(Color(red: 0.1, green: 0.8, blue: 0.5))
                        }
                        .padding()
                        .background(Color(red: 0.04, green: 0.28, blue: 0.2))
                        .overlay(RoundedRectangle(cornerRadius: 10)
                            .stroke(Color(red: 0.1, green: 0.8, blue: 0.5).opacity(0.35), lineWidth: 1))
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
                                .background(etapes[etapeActuelle].couleur)
                                .foregroundColor(.white).cornerRadius(12)
                        }
                    } else {
                        Button(action: { isPresented = false }) {
                            Text("Commencer le travail")
                                .fontWeight(.bold).frame(maxWidth: .infinity).padding()
                                .background(Color(red: 0.1, green: 0.75, blue: 0.4))
                                .foregroundColor(.white).cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
        }
    }
}
