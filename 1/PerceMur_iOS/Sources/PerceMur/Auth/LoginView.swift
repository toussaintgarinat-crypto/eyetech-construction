import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @FocusState private var focusedField: Field?

    enum Field { case email, password }

    var body: some View {
        ZStack {
            // Fond sombre
            LinearGradient(
                colors: [Color(hex: "0F172A"), Color(hex: "1E3A5F")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 32) {
                // Logo
                VStack(spacing: 12) {
                    Image(systemName: "scope")
                        .font(.system(size: 64))
                        .foregroundStyle(.cyan)
                    Text("Perce-Mur")
                        .font(.largeTitle.bold())
                        .foregroundStyle(.white)
                    Text("Perçage assisté par réalité augmentée")
                        .font(.subheadline)
                        .foregroundStyle(.gray)
                        .multilineTextAlignment(.center)
                }

                // Formulaire
                VStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Email").font(.caption).foregroundStyle(.gray)
                        TextField("admin@eyetech.fr", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .focused($focusedField, equals: .email)
                            .padding()
                            .background(Color.white.opacity(0.08))
                            .cornerRadius(12)
                            .foregroundStyle(.white)
                            .tint(.cyan)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Mot de passe").font(.caption).foregroundStyle(.gray)
                        SecureField("••••••••", text: $password)
                            .textContentType(.password)
                            .focused($focusedField, equals: .password)
                            .padding()
                            .background(Color.white.opacity(0.08))
                            .cornerRadius(12)
                            .foregroundStyle(.white)
                            .tint(.cyan)
                    }

                    if let error = authViewModel.errorMessage {
                        Text(error)
                            .foregroundStyle(.red)
                            .font(.caption)
                    }

                    Button(action: {
                        focusedField = nil
                        Task { await authViewModel.login(email: email, password: password) }
                    }) {
                        HStack {
                            if authViewModel.isLoading {
                                ProgressView().tint(.white)
                            } else {
                                Text("Se connecter")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                colors: [.cyan, Color(hex: "0EA5E9")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                        .foregroundStyle(.white)
                    }
                    .disabled(authViewModel.isLoading || email.isEmpty || password.isEmpty)
                }
                .padding(.horizontal, 8)
            }
            .padding(32)
        }
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: UInt64
        (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        self.init(red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255)
    }
}
