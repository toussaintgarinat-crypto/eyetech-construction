import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case decodingError(Error)
    case networkError(Error)
    case serverError(statusCode: Int, message: String?)
    case unknownError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL invalide."
        case .invalidResponse: return "Réponse du serveur invalide."
        case .decodingError(let error): return "Erreur de décodage des données: \(error.localizedDescription)"
        case .networkError(let error): return "Erreur réseau: \(error.localizedDescription)"
        case .serverError(let statusCode, let message): return "Erreur serveur (\(statusCode)): \(message ?? "")"
        case .unknownError: return "Erreur inconnue."
        }
    }
}

class APIClient {
    static let shared = APIClient()
    let baseURL = "http://localhost:8003/api/"
    
    private init() {}
    
    func fetch<T: Decodable>(endpoint: String, completion: @escaping (Result<T, APIError>) -> Void) {
        guard let url = URL(string: baseURL + endpoint) else {
            completion(.failure(.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        if let token = AuthService.shared.authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
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
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                let result = try decoder.decode(T.self, from: data)
                completion(.success(result))
            } catch {
                completion(.failure(.decodingError(error)))
            }
        }.resume()
    }
    
    func fetchCalquesMetiers(forProject projectId: UUID, completion: @escaping (Result<[CalqueMetier], APIError>) -> Void) {
        let endpoint = "calques-metiers/?project_id=\(projectId.uuidString)"
        fetch(endpoint: endpoint) { (result: Result<[CalqueMetier], APIError>) in
            completion(result)
        }
    }
    
    func fetchElementCalques(forCalque calqueId: UUID, completion: @escaping (Result<[ElementCalque], APIError>) -> Void) {
        let endpoint = "calques-metiers/elements/?calque_id=\(calqueId.uuidString)"
        fetch(endpoint: endpoint) { (result: Result<[ElementCalque], APIError>) in
            completion(result)
        }
    }
    
    func sendVoiceCommand(commandText: String, projectId: UUID, completion: @escaping (Result<CommandeVocale, APIError>) -> Void) {
        guard let url = URL(string: baseURL + "commandes-vocales/commandes-vocales/") else {
            completion(.failure(.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = AuthService.shared.authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let body: [String: Any] = [
            "transcription_brute": commandText,
            "projet": projectId.uuidString,
            "utilisateur": "<user_id>", // TODO: Replace with actual user ID from authentication
            "duree_audio": 0.0,
            "contexte": ["app_state": "AR_view"]
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
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                let result = try decoder.decode(CommandeVocale.self, from: data)
                completion(.success(result))
            } catch {
                completion(.failure(.decodingError(error)))
            }
        }.resume()
    }
    
    func fetchZonesAnalyse(forProject projectId: UUID, completion: @escaping (Result<[ZoneAnalyse], APIError>) -> Void) {
        let endpoint = "analyse-spatiale/zones-analyse/?project_id=\(projectId.uuidString)"
        fetch(endpoint: endpoint) { (result: Result<[ZoneAnalyse], APIError>) in
            completion(result)
        }
    }
    
    func fetchPointsInteret(forProject projectId: UUID, completion: @escaping (Result<[PointInteret], APIError>) -> Void) {
        let endpoint = "analyse-spatiale/points-interet/?project_id=\(projectId.uuidString)"
        fetch(endpoint: endpoint) { (result: Result<[PointInteret], APIError>) in
            completion(result)
        }
    }
    
    func fetchMesuresSpatiales(forProject projectId: UUID, completion: @escaping (Result<[MesureSpatiale], APIError>) -> Void) {
        let endpoint = "analyse-spatiale/mesures-spatiales/?project_id=\(projectId.uuidString)"
        fetch(endpoint: endpoint) { (result: Result<[MesureSpatiale], APIError>) in
            completion(result)
        }
    }
}

