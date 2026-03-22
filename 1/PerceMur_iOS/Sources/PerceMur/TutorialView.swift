import SwiftUI

struct TutorialStep {
    let numero: Int
    let titre: String
    let description: String
    let astuce: String
    let iconeName: String
}

struct TutorialView: View {
    @Binding var isPresented: Bool
    @State private var etapeActuelle = 0

    let etapes: [TutorialStep] = [
        TutorialStep(
            numero: 1,
            titre: "Connexion",
            description: "Connectez-vous avec vos identifiants Eyetech (email + mot de passe). Votre compte est cree par votre chef de projet.",
            astuce: "Identifiants oublies ? Contactez votre responsable Eyetech.",
            iconeName: "person.circle.fill"
        ),
        TutorialStep(
            numero: 2,
            titre: "Choisir un projet",
            description: "Selectionnez le chantier dans la liste des projets. Chaque projet contient les points de percage definis par le bureau.",
            astuce: "Les projets sont synchronises en temps reel avec le bureau.",
            iconeName: "folder.fill"
        ),
        TutorialStep(
            numero: 3,
            titre: "Lancer la camera AR",
            description: "Dans le detail du projet, appuyez sur 'Lancer AR'. Pointez votre iPhone Pro vers le mur. Les lignes de guidage apparaissent en superposition sur la realite.",
            astuce: "Tenez l'iPhone stable quelques secondes pour que le LiDAR calibre la scene.",
            iconeName: "camera.fill"
        ),
        TutorialStep(
            numero: 4,
            titre: "Suivre les guides de percage",
            description: "Les traits bleus indiquent les lignes de percage. Les points rouges sont les emplacements exacts. Alignez votre perceuse avec le guide AR avant de commencer.",
            astuce: "Zoomez en pinchant l'ecran pour voir les details des coordonnees.",
            iconeName: "scope"
        ),
        TutorialStep(
            numero: 5,
            titre: "Detection des obstacles",
            description: "L'app detecte automatiquement les obstacles caches (tuyaux, cables electriques) grace au LiDAR. Une zone ROUGE signifie DANGER - ne percez pas.",
            astuce: "Activez le mode 'Scan complet' pour une detection plus precise avant de percer.",
            iconeName: "exclamationmark.triangle.fill"
        ),
    ]

    var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.09, blue: 0.15)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Guide d'utilisation")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Spacer()
                    Button(action: { isPresented = false }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(Color(white: 0.4))
                    }
                }
                .padding()

                // Barre de progression
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color(white: 0.15))
                            .frame(height: 6)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color.blue)
                            .frame(width: geo.size.width * CGFloat(etapeActuelle + 1) / CGFloat(etapes.count), height: 6)
                            .animation(.easeInOut, value: etapeActuelle)
                    }
                }
                .frame(height: 6)
                .padding(.horizontal)

                Text("Etape \(etapeActuelle + 1) sur \(etapes.count)")
                    .font(.caption)
                    .foregroundColor(Color(white: 0.5))
                    .padding(.top, 8)

                // Contenu
                ScrollView {
                    VStack(spacing: 20) {
                        let etape = etapes[etapeActuelle]

                        // Icone
                        Image(systemName: etape.iconeName)
                            .font(.system(size: 60))
                            .foregroundColor(.blue)
                            .padding(.top, 20)

                        // Numero + Titre
                        VStack(spacing: 4) {
                            Text("ETAPE \(etape.numero)")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.blue)
                                .tracking(2)

                            Text(etape.titre)
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                        }

                        // Description
                        Text(etape.description)
                            .font(.body)
                            .foregroundColor(Color(white: 0.7))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)

                        // Astuce
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: "lightbulb.fill")
                                .foregroundColor(Color(red: 0.1, green: 0.8, blue: 0.5))
                                .font(.subheadline)
                            Text(etape.astuce)
                                .font(.subheadline)
                                .foregroundColor(Color(red: 0.1, green: 0.8, blue: 0.5))
                        }
                        .padding()
                        .background(Color(red: 0.05, green: 0.35, blue: 0.25).opacity(0.3))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color(red: 0.1, green: 0.8, blue: 0.5).opacity(0.4), lineWidth: 1)
                        )
                        .cornerRadius(10)
                        .padding(.horizontal)
                    }
                    .padding(.bottom, 100)
                }

                // Navigation
                HStack(spacing: 16) {
                    if etapeActuelle > 0 {
                        Button(action: { etapeActuelle -= 1 }) {
                            HStack {
                                Image(systemName: "chevron.left")
                                Text("Precedent")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(white: 0.12))
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                    }

                    if etapeActuelle < etapes.count - 1 {
                        Button(action: { etapeActuelle += 1 }) {
                            HStack {
                                Text("Suivant")
                                Image(systemName: "chevron.right")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                    } else {
                        Button(action: { isPresented = false }) {
                            Text("Commencer")
                                .fontWeight(.bold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color(red: 0.1, green: 0.75, blue: 0.4))
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
        }
    }
}
