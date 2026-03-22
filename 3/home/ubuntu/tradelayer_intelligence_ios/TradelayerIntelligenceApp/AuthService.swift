import Foundation

class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published var isAuthenticated: Bool = false
    @Published var authToken: String? {
        didSet {
            if let token = authToken {
                KeychainManager.save(key: "authToken", value: token)
                isAuthenticated = true
            } else {
                KeychainManager.delete(key: "authToken")
                isAuthenticated = false
            }
        }
    }

    private init() {
        // Check for existing token on app launch
        if let token = KeychainManager.get(key: "authToken") {
            self.authToken = token
        }
    }

    func register(username: String, email: String, password: String, firstName: String, lastName: String, completion: @escaping (Result<String, APIError>) -> Void) {
        guard let url = URL(string: APIClient.shared.baseURL + "auth/register/") else {
            completion(.failure(.invalidURL))
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "username": username,
            "email": email,
            "password": password,
            "password2": password,
            "first_name": firstName,
            "last_name": lastName
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        } catch {
            completion(.failure(.decodingError(error)))
            return
        }

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(.invalidResponse))
                return
            }

            guard (200...299).contains(httpResponse.statusCode) else {
                let message = String(data: data ?? Data(), encoding: .utf8)
                completion(.failure(.serverError(statusCode: httpResponse.statusCode, message: message)))
                return
            }

            completion(.success("Registration successful"))

        }.resume()
    }

    func login(username: String, password: String, completion: @escaping (Result<String, APIError>) -> Void) {
        guard let url = URL(string: APIClient.shared.baseURL + "auth/token/") else {
            completion(.failure(.invalidURL))
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "username": username,
            "password": password
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        } catch {
            completion(.failure(.decodingError(error)))
            return
        }

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(.invalidResponse))
                return
            }

            guard (200...299).contains(httpResponse.statusCode) else {
                let message = String(data: data ?? Data(), encoding: .utf8)
                completion(.failure(.serverError(statusCode: httpResponse.statusCode, message: message)))
                return
            }

            guard let data = data else {
                completion(.failure(.invalidResponse))
                return
            }

            do {
                let tokenResponse = try JSONDecoder().decode(TokenResponse.self, from: data)
                DispatchQueue.main.async {
                    self.authToken = tokenResponse.access
                    KeychainManager.save(key: "refresh_token", value: tokenResponse.refresh)
                    completion(.success("Login successful"))
                }
            } catch {
                completion(.failure(.decodingError(error)))
            }
        }.resume()
    }

    func logout() {
        authToken = nil
        KeychainManager.delete(key: "refresh_token")
    }
}

struct TokenResponse: Codable {
    let refresh: String
    let access: String
}
