import Foundation
import Combine

// MARK: - API Client
class APIClient: ObservableObject {
    static let shared = APIClient()
    
    private let baseURL = "http://localhost:8004/api/"
    private let session = URLSession.shared
    private var cancellables = Set<AnyCancellable>()
    
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // Token d'authentification
    @Published var authToken: String? {
        didSet {
            if let token = authToken {
                KeychainManager.save(key: "auth_token", value: token)
            } else {
                KeychainManager.delete(key: "auth_token")
            }
        }
    }

    private init() {
        // Récupérer le token sauvegardé depuis le Keychain
        authToken = KeychainManager.get(key: "auth_token")
    }
    
    // MARK: - Authentification
    func login(email: String, password: String) -> AnyPublisher<AuthResponse, APIError> {
        let loginData = LoginRequest(email: email, password: password)
        return post(endpoint: "auth/login/", body: loginData)
            .handleEvents(receiveOutput: { [weak self] response in
                self?.authToken = response.access
                KeychainManager.save(key: "refresh_token", value: response.refresh)
            })
            .eraseToAnyPublisher()
    }
    
    func register(email: String, password: String, firstName: String = "", lastName: String = "") -> AnyPublisher<AuthResponse, APIError> {
        let registerData = RegisterRequest(
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        )
        return post(endpoint: "auth/register/", body: registerData)
    }
    
    func refreshToken() -> AnyPublisher<AuthResponse, APIError> {
        guard let storedRefresh = KeychainManager.get(key: "refresh_token") else {
            return Fail(error: APIError.unauthorized)
                .eraseToAnyPublisher()
        }

        let refreshData = RefreshTokenRequest(refresh: storedRefresh)
        return post(endpoint: "auth/refresh/", body: refreshData)
            .handleEvents(receiveOutput: { [weak self] response in
                self?.authToken = response.access
                KeychainManager.save(key: "refresh_token", value: response.refresh)
            })
            .eraseToAnyPublisher()
    }
    
    func logout() {
        authToken = nil
        KeychainManager.delete(key: "refresh_token")
    }
    
    // MARK: - Produits
    func rechercherProduits(terme: String, filtres: FiltresRecherche? = nil, page: Int = 1) -> AnyPublisher<PaginatedResponse<Produit>, APIError> {
        var queryItems = [URLQueryItem(name: "search", value: terme)]
        queryItems.append(URLQueryItem(name: "page", value: String(page)))
        
        if let filtres = filtres {
            if let prixMin = filtres.prixMin {
                queryItems.append(URLQueryItem(name: "prix_min", value: String(prixMin)))
            }
            if let prixMax = filtres.prixMax {
                queryItems.append(URLQueryItem(name: "prix_max", value: String(prixMax)))
            }
            if let rayon = filtres.rayonRecherche {
                queryItems.append(URLQueryItem(name: "rayon", value: String(rayon)))
            }
            if filtres.disponibleUniquement {
                queryItems.append(URLQueryItem(name: "disponible", value: "true"))
            }
            if filtres.fournisseursVerifies {
                queryItems.append(URLQueryItem(name: "verifies", value: "true"))
            }
        }
        
        return get(endpoint: "produits/", queryItems: queryItems)
    }
    
    func obtenirProduit(id: UUID) -> AnyPublisher<Produit, APIError> {
        return get(endpoint: "produits/\(id.uuidString)/")
    }
    
    func obtenirCategories() -> AnyPublisher<[Categorie], APIError> {
        return get(endpoint: "produits/categories/")
    }
    
    func obtenirMarques() -> AnyPublisher<[Marque], APIError> {
        return get(endpoint: "produits/marques/")
    }
    
    // MARK: - Fournisseurs
    func obtenirFournisseurs(page: Int = 1) -> AnyPublisher<PaginatedResponse<Fournisseur>, APIError> {
        let queryItems = [URLQueryItem(name: "page", value: String(page))]
        return get(endpoint: "fournisseurs/", queryItems: queryItems)
    }
    
    func obtenirFournisseur(id: UUID) -> AnyPublisher<Fournisseur, APIError> {
        return get(endpoint: "fournisseurs/\(id.uuidString)/")
    }
    
    func rechercherFournisseursProximite(latitude: Double, longitude: Double, rayon: Int) -> AnyPublisher<[Fournisseur], APIError> {
        let queryItems = [
            URLQueryItem(name: "lat", value: String(latitude)),
            URLQueryItem(name: "lng", value: String(longitude)),
            URLQueryItem(name: "rayon", value: String(rayon))
        ]
        return get(endpoint: "fournisseurs/proximite/", queryItems: queryItems)
    }
    
    // MARK: - Comparaison de prix
    func creerRechercheComparaison(recherche: CreerRechercheRequest) -> AnyPublisher<RechercheComparaison, APIError> {
        return post(endpoint: "comparateur/recherches/", body: recherche)
    }
    
    func obtenirResultatsComparaison(rechercheId: UUID) -> AnyPublisher<[ResultatComparaison], APIError> {
        return get(endpoint: "comparateur/recherches/\(rechercheId.uuidString)/resultats/")
    }
    
    func obtenirRecommandations(rechercheId: UUID) -> AnyPublisher<[RecommandationAchat], APIError> {
        return get(endpoint: "comparateur/recherches/\(rechercheId.uuidString)/recommandations/")
    }
    
    func sauvegarderRecherche(rechercheId: UUID) -> AnyPublisher<RechercheComparaison, APIError> {
        return post(endpoint: "comparateur/recherches/\(rechercheId.uuidString)/sauvegarder/", body: EmptyBody())
    }
    
    func obtenirRecherchesUtilisateur(page: Int = 1) -> AnyPublisher<PaginatedResponse<RechercheComparaison>, APIError> {
        let queryItems = [URLQueryItem(name: "page", value: String(page))]
        return get(endpoint: "comparateur/recherches/", queryItems: queryItems)
    }
    
    // MARK: - Analyse de marché
    func obtenirAnalyseMarche(produitId: UUID) -> AnyPublisher<AnalyseMarche, APIError> {
        return get(endpoint: "comparateur/analyses-marche/\(produitId.uuidString)/")
    }
    
    // MARK: - Configuration utilisateur
    func obtenirConfigurationUtilisateur() -> AnyPublisher<ConfigurationUtilisateur, APIError> {
        return get(endpoint: "comparateur/configuration/")
    }
    
    func mettreAJourConfigurationUtilisateur(config: ConfigurationUtilisateur) -> AnyPublisher<ConfigurationUtilisateur, APIError> {
        return put(endpoint: "comparateur/configuration/", body: config)
    }
    
    // MARK: - Méthodes HTTP génériques
    private func get<T: Codable>(endpoint: String, queryItems: [URLQueryItem] = []) -> AnyPublisher<T, APIError> {
        guard let url = buildURL(endpoint: endpoint, queryItems: queryItems) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        addAuthHeaders(to: &request)
        
        return performRequest(request)
    }
    
    private func post<T: Codable, U: Codable>(endpoint: String, body: U) -> AnyPublisher<T, APIError> {
        guard let url = buildURL(endpoint: endpoint) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        addAuthHeaders(to: &request)
        
        do {
            request.httpBody = try JSONEncoder().encode(body)
        } catch {
            return Fail(error: APIError.encodingError(error))
                .eraseToAnyPublisher()
        }
        
        return performRequest(request)
    }
    
    private func put<T: Codable, U: Codable>(endpoint: String, body: U) -> AnyPublisher<T, APIError> {
        guard let url = buildURL(endpoint: endpoint) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        addAuthHeaders(to: &request)
        
        do {
            request.httpBody = try JSONEncoder().encode(body)
        } catch {
            return Fail(error: APIError.encodingError(error))
                .eraseToAnyPublisher()
        }
        
        return performRequest(request)
    }
    
    private func performRequest<T: Codable>(_ request: URLRequest) -> AnyPublisher<T, APIError> {
        return session.dataTaskPublisher(for: request)
            .handleEvents(receiveSubscription: { [weak self] _ in
                DispatchQueue.main.async {
                    self?.isLoading = true
                    self?.errorMessage = nil
                }
            })
            .map(\.data)
            .decode(type: T.self, decoder: JSONDecoder.constructOptimizeDecoder)
            .mapError { error in
                if error is DecodingError {
                    return APIError.decodingError(error)
                } else {
                    return APIError.networkError(error)
                }
            }
            .handleEvents(receiveCompletion: { [weak self] completion in
                DispatchQueue.main.async {
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                }
            })
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    private func buildURL(endpoint: String, queryItems: [URLQueryItem] = []) -> URL? {
        guard let baseURL = URL(string: baseURL) else { return nil }
        var components = URLComponents(url: baseURL.appendingPathComponent(endpoint), resolvingAgainstBaseURL: true)
        if !queryItems.isEmpty {
            components?.queryItems = queryItems
        }
        return components?.url
    }
    
    private func addAuthHeaders(to request: inout URLRequest) {
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
    }
}

// MARK: - API Error
enum APIError: Error, LocalizedError {
    case invalidURL
    case unauthorized
    case networkError(Error)
    case decodingError(Error)
    case encodingError(Error)
    case serverError(Int, String?)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL invalide"
        case .unauthorized:
            return "Non autorisé. Veuillez vous reconnecter."
        case .networkError(let error):
            return "Erreur réseau: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Erreur de décodage: \(error.localizedDescription)"
        case .encodingError(let error):
            return "Erreur d'encodage: \(error.localizedDescription)"
        case .serverError(let code, let message):
            return "Erreur serveur (\(code)): \(message ?? "Erreur inconnue")"
        }
    }
}

// MARK: - Request Models
struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let firstName: String
    let lastName: String
    
    enum CodingKeys: String, CodingKey {
        case email, password
        case firstName = "first_name"
        case lastName = "last_name"
    }
}

struct RefreshTokenRequest: Codable {
    let refresh: String
}

struct AuthResponse: Codable {
    let access: String
    let refresh: String
    let user: UserInfo
}

struct UserInfo: Codable {
    let id: UUID
    let email: String
    let firstName: String
    let lastName: String
    
    enum CodingKeys: String, CodingKey {
        case id, email
        case firstName = "first_name"
        case lastName = "last_name"
    }
}

struct CreerRechercheRequest: Codable {
    let termeRecherche: String
    let produits: [ElementRechercheRequest]
    let filtres: FiltresRecherche
    let triPar: TriRecherche
    
    enum CodingKeys: String, CodingKey {
        case termeRecherche = "terme_recherche"
        case produits, filtres
        case triPar = "tri_par"
    }
}

struct ElementRechercheRequest: Codable {
    let produitId: UUID
    let quantiteDemandee: Int
    let priorite: Int
    let notes: String?
    
    enum CodingKeys: String, CodingKey {
        case produitId = "produit_id"
        case quantiteDemandee = "quantite_demandee"
        case priorite, notes
    }
}

struct PaginatedResponse<T: Codable>: Codable {
    let count: Int
    let next: String?
    let previous: String?
    let results: [T]
}

struct EmptyBody: Codable {}

// MARK: - JSON Decoder Extension
extension JSONDecoder {
    static let constructOptimizeDecoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }()
}

// MARK: - JSON Encoder Extension
extension JSONEncoder {
    static let constructOptimizeEncoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.keyEncodingStrategy = .convertToSnakeCase
        return encoder
    }()
}
