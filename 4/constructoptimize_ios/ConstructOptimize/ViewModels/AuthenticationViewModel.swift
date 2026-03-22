import Foundation
import Combine

class AuthenticationViewModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private var cancellables = Set<AnyCancellable>()

    // MARK: - Login
    func login(email: String, password: String, completion: @escaping (Bool, String?) -> Void) {
        isLoading = true
        errorMessage = nil

        APIClient.shared.login(email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completionResult in
                self?.isLoading = false
                if case .failure(let error) = completionResult {
                    self?.errorMessage = error.localizedDescription
                    completion(false, error.localizedDescription)
                }
            } receiveValue: { [weak self] response in
                UserDefaults.standard.set(response.access, forKey: "auth_token")
                self?.isAuthenticated = true
                completion(true, nil)
            }
            .store(in: &cancellables)
    }

    // MARK: - Register
    func register(email: String, password: String, completion: @escaping (Bool, String?) -> Void) {
        isLoading = true
        errorMessage = nil

        APIClient.shared.register(email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completionResult in
                self?.isLoading = false
                if case .failure(let error) = completionResult {
                    self?.errorMessage = error.localizedDescription
                    completion(false, error.localizedDescription)
                }
            } receiveValue: { _ in
                completion(true, nil)
            }
            .store(in: &cancellables)
    }

    // MARK: - Logout
    func logout() {
        UserDefaults.standard.removeObject(forKey: "auth_token")
        APIClient.shared.logout()
        isAuthenticated = false
    }

    // MARK: - Check authentication status
    func checkAuthenticationStatus() {
        let token = UserDefaults.standard.string(forKey: "auth_token")
        isAuthenticated = token != nil && !token!.isEmpty
    }
}
