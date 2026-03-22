import Foundation
import CoreLocation

// MARK: - Produit
struct Produit: Identifiable, Codable, Hashable {
    let id: UUID
    let nom: String
    let description: String
    let descriptionCourte: String?
    let categorie: Categorie
    let marque: Marque?
    let sku: String?
    let ean: String?
    let referenceFabricant: String?
    let uniteMesure: UniteMesure
    let poids: Double?
    let dimensions: Dimensions?
    let imagePrincipale: String?
    let fichesTechniques: [String]
    let noteMoyenne: Double
    let nombreAvis: Int
    let active: Bool
    let dateCreation: Date
    let dateModification: Date
    let derniereMajPrix: Date?
    
    // Prix calculés
    var prixMin: Double? {
        return prixFournisseurs.compactMap { $0.prix }.min()
    }
    
    var prixMax: Double? {
        return prixFournisseurs.compactMap { $0.prix }.max()
    }
    
    var nombreFournisseurs: Int {
        return prixFournisseurs.filter { $0.disponible }.count
    }
    
    let prixFournisseurs: [PrixProduit]
    let caracteristiques: [CaracteristiqueProduit]
    let images: [ImageProduit]
    let avis: [AvisProduit]
    
    enum CodingKeys: String, CodingKey {
        case id, nom, description, categorie, marque, sku, ean
        case descriptionCourte = "description_courte"
        case referenceFabricant = "reference_fabricant"
        case uniteMesure = "unite_mesure"
        case poids, dimensions
        case imagePrincipale = "image_principale"
        case fichesTechniques = "fiches_techniques"
        case noteMoyenne = "note_moyenne"
        case nombreAvis = "nombre_avis"
        case active
        case dateCreation = "date_creation"
        case dateModification = "date_modification"
        case derniereMajPrix = "derniere_maj_prix"
        case prixFournisseurs = "prix_fournisseurs"
        case caracteristiques, images, avis
    }
}

// MARK: - Catégorie
struct Categorie: Identifiable, Codable, Hashable {
    let id: UUID
    let nom: String
    let slug: String
    let description: String?
    let parentCategorie: UUID?
    let image: String?
    let ordreAffichage: Int
    let active: Bool
    let dateCreation: Date
    let dateModification: Date
    
    enum CodingKeys: String, CodingKey {
        case id, nom, slug, description, image, active
        case parentCategorie = "parent_categorie"
        case ordreAffichage = "ordre_affichage"
        case dateCreation = "date_creation"
        case dateModification = "date_modification"
    }
}

// MARK: - Marque
struct Marque: Identifiable, Codable, Hashable {
    let id: UUID
    let nom: String
    let description: String?
    let logo: String?
    let siteWeb: String?
    let active: Bool
    let dateCreation: Date
    let dateModification: Date
    
    enum CodingKeys: String, CodingKey {
        case id, nom, description, logo, active
        case siteWeb = "site_web"
        case dateCreation = "date_creation"
        case dateModification = "date_modification"
    }
}

// MARK: - Unité de mesure
enum UniteMesure: String, CaseIterable, Codable {
    case piece = "piece"
    case metre = "m"
    case metreCarré = "m2"
    case metreCube = "m3"
    case kilogramme = "kg"
    case tonne = "tonne"
    case litre = "litre"
    case sac = "sac"
    case palette = "palette"
    case lot = "lot"
    
    var displayName: String {
        switch self {
        case .piece: return "Pièce"
        case .metre: return "Mètre"
        case .metreCarré: return "Mètre carré"
        case .metreCube: return "Mètre cube"
        case .kilogramme: return "Kilogramme"
        case .tonne: return "Tonne"
        case .litre: return "Litre"
        case .sac: return "Sac"
        case .palette: return "Palette"
        case .lot: return "Lot"
        }
    }
    
    var symbol: String {
        switch self {
        case .piece: return "pce"
        case .metre: return "m"
        case .metreCarré: return "m²"
        case .metreCube: return "m³"
        case .kilogramme: return "kg"
        case .tonne: return "t"
        case .litre: return "L"
        case .sac: return "sac"
        case .palette: return "pal"
        case .lot: return "lot"
        }
    }
}

// MARK: - Dimensions
struct Dimensions: Codable, Hashable {
    let longueur: Double?
    let largeur: Double?
    let hauteur: Double?
    
    var volume: Double? {
        guard let l = longueur, let w = largeur, let h = hauteur else { return nil }
        return l * w * h
    }
    
    var surface: Double? {
        guard let l = longueur, let w = largeur else { return nil }
        return l * w
    }
}

// MARK: - Fournisseur
struct Fournisseur: Identifiable, Codable, Hashable {
    let id: UUID
    let nom: String
    let nomCommercial: String?
    let typeFournisseur: TypeFournisseur
    let email: String?
    let telephone: String?
    let siteWeb: String?
    let adresse: Adresse?
    let coordonnees: CLLocationCoordinate2D?
    let siret: String?
    let tvaIntracommunautaire: String?
    let logo: String?
    let description: String?
    let noteQualite: Double
    let nombreEvaluations: Int
    let delaiLivraisonMoyen: Int
    let fraisLivraisonGratuite: Double?
    let accepteCommandesEnLigne: Bool
    let active: Bool
    let verifie: Bool
    let dateCreation: Date
    let dateModification: Date
    let derniereSynchronisation: Date?
    
    enum CodingKeys: String, CodingKey {
        case id, nom, email, telephone, adresse, siret, logo, description, active, verifie
        case nomCommercial = "nom_commercial"
        case typeFournisseur = "type_fournisseur"
        case siteWeb = "site_web"
        case coordonnees = "coordonnees"
        case tvaIntracommunautaire = "tva_intracommunautaire"
        case noteQualite = "note_qualite"
        case nombreEvaluations = "nombre_evaluations"
        case delaiLivraisonMoyen = "delai_livraison_moyen"
        case fraisLivraisonGratuite = "frais_livraison_gratuite"
        case accepteCommandesEnLigne = "accepte_commandes_en_ligne"
        case dateCreation = "date_creation"
        case dateModification = "date_modification"
        case derniereSynchronisation = "derniere_synchronisation"
    }
}

// MARK: - Type de fournisseur
enum TypeFournisseur: String, CaseIterable, Codable {
    case distributeur = "distributeur"
    case fabricant = "fabricant"
    case grossiste = "grossiste"
    case detaillant = "detaillant"
    case marketplace = "marketplace"
    case local = "local"
    
    var displayName: String {
        switch self {
        case .distributeur: return "Distributeur"
        case .fabricant: return "Fabricant"
        case .grossiste: return "Grossiste"
        case .detaillant: return "Détaillant"
        case .marketplace: return "Marketplace"
        case .local: return "Fournisseur local"
        }
    }
    
    var icon: String {
        switch self {
        case .distributeur: return "truck.box"
        case .fabricant: return "hammer"
        case .grossiste: return "building.2"
        case .detaillant: return "storefront"
        case .marketplace: return "globe"
        case .local: return "location"
        }
    }
}

// MARK: - Adresse
struct Adresse: Codable, Hashable {
    let rue: String?
    let ville: String?
    let codePostal: String?
    let pays: String
    let latitude: Double?
    let longitude: Double?
    
    var adresseComplete: String {
        var components: [String] = []
        if let rue = rue, !rue.isEmpty { components.append(rue) }
        if let codePostal = codePostal, !codePostal.isEmpty,
           let ville = ville, !ville.isEmpty {
            components.append("\(codePostal) \(ville)")
        } else if let ville = ville, !ville.isEmpty {
            components.append(ville)
        }
        if pays != "France" { components.append(pays) }
        return components.joined(separator: ", ")
    }
    
    enum CodingKeys: String, CodingKey {
        case rue = "adresse"
        case ville
        case codePostal = "code_postal"
        case pays, latitude, longitude
    }
}

// MARK: - Prix Produit
struct PrixProduit: Identifiable, Codable, Hashable {
    let id: UUID
    let produit: UUID
    let fournisseur: Fournisseur
    let prix: Double
    let devise: Devise
    let prixUnitaire: Double?
    let quantiteMinimale: Int
    let quantiteMaximale: Int?
    let remises: RemisesQuantite
    let disponible: Bool
    let stockDisponible: Int?
    let delaiLivraison: Int
    let fraisLivraison: Double
    let referenceFournisseur: String?
    let urlProduit: String?
    let dateCreation: Date
    let dateModification: Date
    let derniereVerification: Date
    let sourceDonnees: SourceDonnees
    
    func prixAvecRemise(quantite: Int) -> Double {
        if quantite >= 100 && remises.remise100Pieces > 0 {
            return prix * (1 - remises.remise100Pieces / 100)
        } else if quantite >= 50 && remises.remise50Pieces > 0 {
            return prix * (1 - remises.remise50Pieces / 100)
        } else if quantite >= 10 && remises.remise10Pieces > 0 {
            return prix * (1 - remises.remise10Pieces / 100)
        }
        return prix
    }
    
    func prixTotal(quantite: Int, inclureLivraison: Bool = true) -> Double {
        let prixUnitaireAvecRemise = prixAvecRemise(quantite: quantite)
        var total = prixUnitaireAvecRemise * Double(quantite)
        
        if inclureLivraison {
            // Ajouter les frais de livraison si pas de seuil de gratuité atteint
            if let seuilGratuite = fournisseur.fraisLivraisonGratuite {
                if total < seuilGratuite {
                    total += fraisLivraison
                }
            } else {
                total += fraisLivraison
            }
        }
        
        return total
    }
    
    enum CodingKeys: String, CodingKey {
        case id, produit, fournisseur, prix, devise, disponible
        case prixUnitaire = "prix_unitaire"
        case quantiteMinimale = "quantite_minimale"
        case quantiteMaximale = "quantite_maximale"
        case remises
        case stockDisponible = "stock_disponible"
        case delaiLivraison = "delai_livraison"
        case fraisLivraison = "frais_livraison"
        case referenceFournisseur = "reference_fournisseur"
        case urlProduit = "url_produit"
        case dateCreation = "date_creation"
        case dateModification = "date_modification"
        case derniereVerification = "derniere_verification"
        case sourceDonnees = "source_donnees"
    }
}

// MARK: - Devise
enum Devise: String, CaseIterable, Codable {
    case eur = "EUR"
    case usd = "USD"
    case gbp = "GBP"
    
    var symbol: String {
        switch self {
        case .eur: return "€"
        case .usd: return "$"
        case .gbp: return "£"
        }
    }
    
    var name: String {
        switch self {
        case .eur: return "Euro"
        case .usd: return "Dollar US"
        case .gbp: return "Livre Sterling"
        }
    }
}

// MARK: - Remises par quantité
struct RemisesQuantite: Codable, Hashable {
    let remise10Pieces: Double
    let remise50Pieces: Double
    let remise100Pieces: Double
    
    enum CodingKeys: String, CodingKey {
        case remise10Pieces = "remise_10_pieces"
        case remise50Pieces = "remise_50_pieces"
        case remise100Pieces = "remise_100_pieces"
    }
}

// MARK: - Source de données
enum SourceDonnees: String, CaseIterable, Codable {
    case manual = "manual"
    case api = "api"
    case scraping = "scraping"
    
    var displayName: String {
        switch self {
        case .manual: return "Manuel"
        case .api: return "API"
        case .scraping: return "Scraping"
        }
    }
    
    var fiabilite: Double {
        switch self {
        case .manual: return 1.0
        case .api: return 0.95
        case .scraping: return 0.8
        }
    }
}

// MARK: - Modèles supplémentaires
struct CaracteristiqueProduit: Identifiable, Codable, Hashable {
    let id: UUID
    let nom: String
    let valeur: String
    let unite: String?
    let ordre: Int
}

struct ImageProduit: Identifiable, Codable, Hashable {
    let id: UUID
    let image: String
    let altText: String?
    let ordre: Int
    let dateAjout: Date
    
    enum CodingKeys: String, CodingKey {
        case id, image, ordre
        case altText = "alt_text"
        case dateAjout = "date_ajout"
    }
}

struct AvisProduit: Identifiable, Codable, Hashable {
    let id: UUID
    let utilisateur: String?
    let nomUtilisateur: String?
    let note: Int
    let titre: String?
    let commentaire: String
    let verifie: Bool
    let dateCreation: Date
    
    enum CodingKeys: String, CodingKey {
        case id, utilisateur, note, titre, commentaire, verifie
        case nomUtilisateur = "nom_utilisateur"
        case dateCreation = "date_creation"
    }
}

// MARK: - Extensions pour CLLocationCoordinate2D
extension CLLocationCoordinate2D: Codable {
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(latitude, forKey: .latitude)
        try container.encode(longitude, forKey: .longitude)
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let latitude = try container.decode(Double.self, forKey: .latitude)
        let longitude = try container.decode(Double.self, forKey: .longitude)
        self.init(latitude: latitude, longitude: longitude)
    }
    
    private enum CodingKeys: String, CodingKey {
        case latitude, longitude
    }
}

extension CLLocationCoordinate2D: Hashable {
    public func hash(into hasher: inout Hasher) {
        hasher.combine(latitude)
        hasher.combine(longitude)
    }
    
    public static func == (lhs: CLLocationCoordinate2D, rhs: CLLocationCoordinate2D) -> Bool {
        return lhs.latitude == rhs.latitude && lhs.longitude == rhs.longitude
    }
}
