import SwiftUI

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    init() {
        isAuthenticated = APIClient.shared.isAuthenticated
    }

    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let tokens = try await APIClient.shared.login(email: email, password: password)
            APIClient.shared.setTokens(access: tokens.access, refresh: tokens.refresh)
            isAuthenticated = true
        } catch {
            errorMessage = "Email ou mot de passe incorrect."
        }
        isLoading = false
    }

    func logout() {
        APIClient.shared.clearTokens()
        isAuthenticated = false
    }
}
