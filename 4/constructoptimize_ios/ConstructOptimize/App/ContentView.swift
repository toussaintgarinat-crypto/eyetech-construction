import SwiftUI

struct ContentView: View {
    @StateObject private var authViewModel = AuthenticationViewModel()
    @StateObject private var rechercheViewModel = RechercheViewModel()
    @State private var selectedTab = 0
    
    var body: some View {
        Group {
            if authViewModel.isAuthenticated {
                MainTabView(selectedTab: $selectedTab)
                    .environmentObject(rechercheViewModel)
            } else {
                AuthenticationView()
                    .environmentObject(authViewModel)
            }
        }
        .onAppear {
            authViewModel.checkAuthenticationStatus()
        }
    }
}

struct MainTabView: View {
    @Binding var selectedTab: Int
    @EnvironmentObject var rechercheViewModel: RechercheViewModel
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Onglet Recherche
            NavigationView {
                RechercheView()
                    .environmentObject(rechercheViewModel)
            }
            .tabItem {
                Image(systemName: "magnifyingglass")
                Text("Recherche")
            }
            .tag(0)
            
            // Onglet Comparaison
            NavigationView {
                ComparaisonView()
                    .environmentObject(rechercheViewModel)
            }
            .tabItem {
                Image(systemName: "chart.bar.xaxis")
                Text("Comparaison")
            }
            .tag(1)
            
            // Onglet Produits
            NavigationView {
                ProduitsView()
            }
            .tabItem {
                Image(systemName: "cube.box")
                Text("Produits")
            }
            .tag(2)
            
            // Onglet Fournisseurs
            NavigationView {
                FournisseursView()
            }
            .tabItem {
                Image(systemName: "building.2")
                Text("Fournisseurs")
            }
            .tag(3)
            
            // Onglet Profil
            NavigationView {
                ProfilView()
            }
            .tabItem {
                Image(systemName: "person.circle")
                Text("Profil")
            }
            .tag(4)
        }
        .accentColor(.constructOptimizeBlue)
    }
}

struct AuthenticationView: View {
    @EnvironmentObject var authViewModel: AuthenticationViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var isLoginMode = true
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                // Logo et titre
                VStack(spacing: 16) {
                    Image(systemName: "hammer.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.constructOptimizeBlue)
                    
                    Text("ConstructOptimize")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text("Comparateur de prix BTP")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 50)
                
                // Formulaire de connexion
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Email")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        TextField("votre.email@exemple.com", text: $email)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Mot de passe")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        SecureField("Mot de passe", text: $password)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    // Bouton principal
                    Button(action: {
                        if isLoginMode {
                            authViewModel.login(email: email, password: password) { success, message in
                                if !success {
                                    alertMessage = message ?? "Erreur de connexion"
                                    showingAlert = true
                                }
                            }
                        } else {
                            authViewModel.register(email: email, password: password) { success, message in
                                if !success {
                                    alertMessage = message ?? "Erreur d'inscription"
                                    showingAlert = true
                                } else {
                                    isLoginMode = true
                                    alertMessage = "Compte créé avec succès. Vous pouvez maintenant vous connecter."
                                    showingAlert = true
                                }
                            }
                        }
                    }) {
                        Text(isLoginMode ? "Se connecter" : "S'inscrire")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.constructOptimizeBlue)
                            .cornerRadius(10)
                    }
                    .disabled(email.isEmpty || password.isEmpty || authViewModel.isLoading)
                    
                    // Bouton de basculement
                    Button(action: {
                        isLoginMode.toggle()
                        email = ""
                        password = ""
                    }) {
                        Text(isLoginMode ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter")
                            .font(.subheadline)
                            .foregroundColor(.constructOptimizeBlue)
                    }
                }
                .padding(.horizontal, 30)
                
                Spacer()
                
                // Informations sur l'écosystème
                VStack(spacing: 8) {
                    Text("Partie de l'écosystème BTP SmartView+")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 20) {
                        Text("AR Perce-Mur")
                        Text("•")
                        Text("BuildingScan")
                        Text("•")
                        Text("TradeLayer")
                    }
                    .font(.caption2)
                    .foregroundColor(.secondary)
                }
                .padding(.bottom, 30)
            }
            .navigationBarHidden(true)
        }
        .alert("Information", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
        .overlay(
            Group {
                if authViewModel.isLoading {
                    Color.black.opacity(0.3)
                        .ignoresSafeArea()
                    
                    ProgressView("Connexion en cours...")
                        .padding()
                        .background(Color.white)
                        .cornerRadius(10)
                        .shadow(radius: 5)
                }
            }
        )
    }
}

#Preview {
    ContentView()
}
