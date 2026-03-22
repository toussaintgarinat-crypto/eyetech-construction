import Foundation

class APIClient {
    static let shared = APIClient()
    private let baseURL = "http://localhost:8001/api/"
    private var accessToken: String?

    private init() {
        accessToken = KeychainManager.get(key: "access_token")
    }

    func setTokens(access: String, refresh: String) {
        self.accessToken = access
        KeychainManager.save(key: "access_token", value: access)
        KeychainManager.save(key: "refresh_token", value: refresh)
    }

    func clearTokens() {
        accessToken = nil
        KeychainManager.delete(key: "access_token")
        KeychainManager.delete(key: "refresh_token")
    }

    var isAuthenticated: Bool { accessToken != nil }

    private func makeRequest(path: String, method: String = "GET", body: Data? = nil) async throws -> Data {
        guard let url = URL(string: baseURL + path) else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = body
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError((response as? HTTPURLResponse)?.statusCode ?? 0)
        }
        return data
    }

    // MARK: - Token Refresh
    func refreshAccessToken(completion: @escaping (Bool) -> Void) {
        guard let refreshToken = KeychainManager.get(key: "refresh_token"),
              let url = URL(string: baseURL + "token/refresh/") else {
            completion(false)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["refresh": refreshToken])

        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: String],
                  let newAccess = json["access"] else {
                DispatchQueue.main.async { completion(false) }
                return
            }
            KeychainManager.save(key: "access_token", value: newAccess)
            if let newRefresh = json["refresh"] {
                KeychainManager.save(key: "refresh_token", value: newRefresh)
            }
            DispatchQueue.main.async { completion(true) }
        }.resume()
    }

    // MARK: - Auth
    func login(email: String, password: String) async throws -> TokenResponse {
        let body = try JSONEncoder().encode(["email": email, "password": password])
        let data = try await makeRequest(path: "token/", method: "POST", body: body)
        return try JSONDecoder().decode(TokenResponse.self, from: data)
    }

    // MARK: - Projects
    func getProjects() async throws -> [Project] {
        let data = try await makeRequest(path: "projects/")
        return try JSONDecoder().decode([Project].self, from: data)
    }

    func createProject(name: String, description: String, location: String) async throws -> Project {
        let payload = CreateProjectPayload(name: name, description: description, location: location)
        let body = try JSONEncoder().encode(payload)
        let data = try await makeRequest(path: "projects/", method: "POST", body: body)
        return try JSONDecoder().decode(Project.self, from: data)
    }

    // MARK: - Drilling Points
    func getDrillingPoints(projectId: Int) async throws -> [DrillingPoint] {
        let data = try await makeRequest(path: "drilling-points/?project=\(projectId)")
        return try JSONDecoder().decode([DrillingPoint].self, from: data)
    }

    func createDrillingPoint(_ point: CreateDrillingPointPayload) async throws -> DrillingPoint {
        let body = try JSONEncoder().encode(point)
        let data = try await makeRequest(path: "drilling-points/", method: "POST", body: body)
        return try JSONDecoder().decode(DrillingPoint.self, from: data)
    }

    // MARK: - AR Measurements
    func getARMeasurements(projectId: Int) async throws -> [ARMeasurement] {
        let data = try await makeRequest(path: "ar-measurements/?project=\(projectId)")
        return try JSONDecoder().decode([ARMeasurement].self, from: data)
    }

    func createARMeasurement(_ measurement: CreateARMeasurementPayload) async throws -> ARMeasurement {
        let body = try JSONEncoder().encode(measurement)
        let data = try await makeRequest(path: "ar-measurements/", method: "POST", body: body)
        return try JSONDecoder().decode(ARMeasurement.self, from: data)
    }
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case serverError(Int)
    case decodingError

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL invalide"
        case .serverError(let code): return "Erreur serveur: \(code)"
        case .decodingError: return "Erreur de décodage"
        }
    }
}
