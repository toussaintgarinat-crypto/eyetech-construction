import Foundation
import CoreLocation

// MARK: - Recherche de comparaison
struct RechercheComparaison: Identifiable, Codable {
    let id: UUID
    let utilisateur: UUID?
    let sessionId: String?
    let termeRecherche: String
    let produits: [ElementRecherche]
    let filtres: FiltresRecherche
    let triPar: TriRecherche
    let statut: StatutRecherche
    let nombreResultats: Int
    let tempsExecution: Double?
    let dateCreation: Date
    let dateExpiration: Date?
    let sauvegardee: Bool
    let partageable: Bool
    let lienPartage: String?
    
    enum CodingKeys: String, CodingKey {
        case id, utilisateur, produits, statut, sauvegardee, partageable
        case sessionId = "session_id"
        case termeRecherche = "terme_recherche"
        case filtres
        case triPar = "tri_par"
        case nombreResultats = "nombre_resultats"
        case tempsExecution = "temps_execution"
        case dateCreation = "date_creation"
        case dateExpiration = "date_expiration"
        case lienPartage = "lien_partage"
    }
}

// MARK: - Élément de recherche
struct ElementRecherche: Identifiable, Codable, Hashable {
    let id: UUID
    let produit: Produit
    let quantiteDemandee: Int
    let priorite: Int
    let notes: String?
    
    enum CodingKeys: String, CodingKey {
        case id, produit, priorite, notes
        case quantiteDemandee = "quantite_demandee"
    }
}

// MARK: - Filtres de recherche
struct FiltresRecherche: Codable, Hashable {
    let prixMin: Double?
    let prixMax: Double?
    let fournisseursInclus: [UUID]
    let rayonRecherche: Int?
    let localisation: CLLocationCoordinate2D?
    let categoriesIncluses: [UUID]
    let marquesIncluses: [UUID]
    let disponibleUniquement: Bool
    let livraison24h: Bool
    let fournisseursVerifies: Bool
    
    enum CodingKeys: String, CodingKey {
        case localisation
        case prixMin = "prix_min"
        case prixMax = "prix_max"
        case fournisseursInclus = "fournisseurs_inclus"
        case rayonRecherche = "rayon_recherche"
        case categoriesIncluses = "categories_incluses"
        case marquesIncluses = "marques_incluses"
        case disponibleUniquement = "disponible_uniquement"
        case livraison24h = "livraison_24h"
        case fournisseursVerifies = "fournisseurs_verifies"
    }
    
    static let defaut = FiltresRecherche(
        prixMin: nil,
        prixMax: nil,
        fournisseursInclus: [],
        rayonRecherche: 50,
        localisation: nil,
        categoriesIncluses: [],
        marquesIncluses: [],
        disponibleUniquement: true,
        livraison24h: false,
        fournisseursVerifies: false
    )
}

// MARK: - Tri de recherche
enum TriRecherche: String, CaseIterable, Codable {
    case prix = "prix"
    case prixDesc = "prix_desc"
    case delai = "delai"
    case note = "note"
    case distance = "distance"
    case disponibilite = "disponibilite"
    case pertinence = "pertinence"
    
    var displayName: String {
        switch self {
        case .prix: return "Prix croissant"
        case .prixDesc: return "Prix décroissant"
        case .delai: return "Délai de livraison"
        case .note: return "Note fournisseur"
        case .distance: return "Distance"
        case .disponibilite: return "Disponibilité"
        case .pertinence: return "Pertinence"
        }
    }
    
    var icon: String {
        switch self {
        case .prix, .prixDesc: return "eurosign.circle"
        case .delai: return "clock"
        case .note: return "star"
        case .distance: return "location"
        case .disponibilite: return "checkmark.circle"
        case .pertinence: return "target"
        }
    }
}

// MARK: - Statut de recherche
enum StatutRecherche: String, CaseIterable, Codable {
    case enCours = "en_cours"
    case terminee = "terminee"
    case erreur = "erreur"
    case expiree = "expiree"
    
    var displayName: String {
        switch self {
        case .enCours: return "En cours"
        case .terminee: return "Terminée"
        case .erreur: return "Erreur"
        case .expiree: return "Expirée"
        }
    }
    
    var color: String {
        switch self {
        case .enCours: return "orange"
        case .terminee: return "green"
        case .erreur: return "red"
        case .expiree: return "gray"
        }
    }
}

// MARK: - Résultat de comparaison
struct ResultatComparaison: Identifiable, Codable, Hashable {
    let id: UUID
    let recherche: UUID
    let prixProduit: PrixProduit
    let quantite: Int
    let prixUnitaire: Double
    let prixTotalHT: Double
    let prixTotalTTC: Double
    let fraisLivraison: Double
    let disponible: Bool
    let stockDisponible: Int?
    let delaiLivraisonEstime: Int
    let distanceFournisseur: Double?
    let scores: ScoresResultat
    let rangs: RangsResultat
    let dateCreation: Date
    let sourceDonnees: SourceDonnees
    let fiabiliteDonnees: Double
    
    var economieVsPlusCher: Double {
        // Cette valeur sera calculée côté client lors de la comparaison
        return 0.0
    }
    
    var pourcentageEconomie: Double {
        // Cette valeur sera calculée côté client lors de la comparaison
        return 0.0
    }
    
    enum CodingKeys: String, CodingKey {
        case id, recherche, quantite, disponible, scores, rangs
        case prixProduit = "prix_produit"
        case prixUnitaire = "prix_unitaire"
        case prixTotalHT = "prix_total_ht"
        case prixTotalTTC = "prix_total_ttc"
        case fraisLivraison = "frais_livraison"
        case stockDisponible = "stock_disponible"
        case delaiLivraisonEstime = "delai_livraison_estime"
        case distanceFournisseur = "distance_fournisseur"
        case dateCreation = "date_creation"
        case sourceDonnees = "source_donnees"
        case fiabiliteDonnees = "fiabilite_donnees"
    }
}

// MARK: - Scores de résultat
struct ScoresResultat: Codable, Hashable {
    let scorePrix: Double
    let scoreQualite: Double
    let scoreGlobal: Double
    
    enum CodingKeys: String, CodingKey {
        case scorePrix = "score_prix"
        case scoreQualite = "score_qualite"
        case scoreGlobal = "score_global"
    }
}

// MARK: - Rangs de résultat
struct RangsResultat: Codable, Hashable {
    let rangPrix: Int?
    let rangGlobal: Int?
    
    enum CodingKeys: String, CodingKey {
        case rangPrix = "rang_prix"
        case rangGlobal = "rang_global"
    }
}

// MARK: - Recommandation d'achat
struct RecommandationAchat: Identifiable, Codable {
    let id: UUID
    let recherche: UUID
    let typeRecommandation: TypeRecommandation
    let resultatRecommande: ResultatComparaison?
    let produitAlternatif: Produit?
    let titre: String
    let description: String
    let economieEstimee: Double?
    let pourcentageEconomie: Double?
    let scoreConfiance: Double
    let priorite: Int
    let dateCreation: Date
    let vueParUtilisateur: Bool
    let accepteeParUtilisateur: Bool
    
    enum CodingKeys: String, CodingKey {
        case id, recherche, titre, description, priorite
        case typeRecommandation = "type_recommandation"
        case resultatRecommande = "resultat_recommande"
        case produitAlternatif = "produit_alternatif"
        case economieEstimee = "economie_estimee"
        case pourcentageEconomie = "pourcentage_economie"
        case scoreConfiance = "score_confiance"
        case dateCreation = "date_creation"
        case vueParUtilisateur = "vue_par_utilisateur"
        case accepteeParUtilisateur = "acceptee_par_utilisateur"
    }
}

// MARK: - Type de recommandation
enum TypeRecommandation: String, CaseIterable, Codable {
    case meilleurPrix = "meilleur_prix"
    case meilleurRapport = "meilleur_rapport"
    case livraisonRapide = "livraison_rapide"
    case fournisseurLocal = "fournisseur_local"
    case achatGroupe = "achat_groupe"
    case alternative = "alternative"
    
    var displayName: String {
        switch self {
        case .meilleurPrix: return "Meilleur prix"
        case .meilleurRapport: return "Meilleur rapport qualité/prix"
        case .livraisonRapide: return "Livraison la plus rapide"
        case .fournisseurLocal: return "Fournisseur local"
        case .achatGroupe: return "Achat groupé"
        case .alternative: return "Produit alternatif"
        }
    }
    
    var icon: String {
        switch self {
        case .meilleurPrix: return "eurosign.circle.fill"
        case .meilleurRapport: return "star.circle.fill"
        case .livraisonRapide: return "clock.circle.fill"
        case .fournisseurLocal: return "location.circle.fill"
        case .achatGroupe: return "person.3.fill"
        case .alternative: return "arrow.triangle.2.circlepath"
        }
    }
    
    var color: String {
        switch self {
        case .meilleurPrix: return "green"
        case .meilleurRapport: return "blue"
        case .livraisonRapide: return "orange"
        case .fournisseurLocal: return "purple"
        case .achatGroupe: return "indigo"
        case .alternative: return "teal"
        }
    }
}

// MARK: - Analyse de marché
struct AnalyseMarche: Identifiable, Codable {
    let id: UUID
    let produit: UUID
    let statistiquesPrix: StatistiquesPrix
    let analyseConcurrence: AnalyseConcurrence
    let tendances: TendancesPrix
    let recommandationsTemporelles: RecommandationsTemporelles
    let dateAnalyse: Date
    let periodeAnalyse: PeriodeAnalyse
    let fiabiliteAnalyse: Double
    
    enum CodingKeys: String, CodingKey {
        case id, produit, tendances
        case statistiquesPrix = "statistiques_prix"
        case analyseConcurrence = "analyse_concurrence"
        case recommandationsTemporelles = "recommandations_temporelles"
        case dateAnalyse = "date_analyse"
        case periodeAnalyse = "periode_analyse"
        case fiabiliteAnalyse = "fiabilite_analyse"
    }
}

// MARK: - Statistiques de prix
struct StatistiquesPrix: Codable {
    let prixMoyenMarche: Double
    let prixMedian: Double
    let prixMinMarche: Double
    let prixMaxMarche: Double
    let ecartTypePrix: Double
    
    enum CodingKeys: String, CodingKey {
        case prixMoyenMarche = "prix_moyen_marche"
        case prixMedian = "prix_median"
        case prixMinMarche = "prix_min_marche"
        case prixMaxMarche = "prix_max_marche"
        case ecartTypePrix = "ecart_type_prix"
    }
}

// MARK: - Analyse de concurrence
struct AnalyseConcurrence: Codable {
    let nombreFournisseurs: Int
    let nombreFournisseursStock: Int
    let delaiMoyenLivraison: Double
    
    enum CodingKeys: String, CodingKey {
        case nombreFournisseurs = "nombre_fournisseurs"
        case nombreFournisseursStock = "nombre_fournisseurs_stock"
        case delaiMoyenLivraison = "delai_moyen_livraison"
    }
}

// MARK: - Tendances de prix
struct TendancesPrix: Codable {
    let tendancePrix: TendancePrix
    let variationPrix7j: Double
    let variationPrix30j: Double
    
    enum CodingKeys: String, CodingKey {
        case tendancePrix = "tendance_prix"
        case variationPrix7j = "variation_prix_7j"
        case variationPrix30j = "variation_prix_30j"
    }
}

// MARK: - Tendance de prix
enum TendancePrix: String, CaseIterable, Codable {
    case hausse = "hausse"
    case baisse = "baisse"
    case stable = "stable"
    case volatile = "volatile"
    
    var displayName: String {
        switch self {
        case .hausse: return "En hausse"
        case .baisse: return "En baisse"
        case .stable: return "Stable"
        case .volatile: return "Volatile"
        }
    }
    
    var icon: String {
        switch self {
        case .hausse: return "arrow.up.circle.fill"
        case .baisse: return "arrow.down.circle.fill"
        case .stable: return "minus.circle.fill"
        case .volatile: return "waveform.circle.fill"
        }
    }
    
    var color: String {
        switch self {
        case .hausse: return "red"
        case .baisse: return "green"
        case .stable: return "blue"
        case .volatile: return "orange"
        }
    }
}

// MARK: - Recommandations temporelles
struct RecommandationsTemporelles: Codable {
    let meilleurMomentAchat: String?
    let alertePrixRecommande: Double?
    
    enum CodingKeys: String, CodingKey {
        case meilleurMomentAchat = "meilleur_moment_achat"
        case alertePrixRecommande = "alerte_prix_recommande"
    }
}

// MARK: - Période d'analyse
struct PeriodeAnalyse: Codable {
    let debut: Date
    let fin: Date
    
    enum CodingKeys: String, CodingKey {
        case debut = "periode_analyse_debut"
        case fin = "periode_analyse_fin"
    }
}

// MARK: - Configuration utilisateur
struct ConfigurationUtilisateur: Identifiable, Codable {
    let id: UUID
    let utilisateur: UUID
    let preferencesRecherche: PreferencesRecherche
    let preferencesTri: PreferencesTri
    let seuilsAlertes: SeuilsAlertes
    let preferencesAffichage: PreferencesAffichage
    let dateCreation: Date
    let dateModification: Date
    
    enum CodingKeys: String, CodingKey {
        case id, utilisateur
        case preferencesRecherche = "preferences_recherche"
        case preferencesTri = "preferences_tri"
        case seuilsAlertes = "seuils_alertes"
        case preferencesAffichage = "preferences_affichage"
        case dateCreation = "date_creation"
        case dateModification = "date_modification"
    }
}

// MARK: - Préférences de recherche
struct PreferencesRecherche: Codable {
    let rayonRechercheDefaut: Int
    let adresseDefaut: String?
    let localisationDefaut: CLLocationCoordinate2D?
    
    enum CodingKeys: String, CodingKey {
        case rayonRechercheDefaut = "rayon_recherche_defaut"
        case adresseDefaut = "adresse_defaut"
        case localisationDefaut = "localisation_defaut"
    }
}

// MARK: - Préférences de tri
struct PreferencesTri: Codable {
    let triDefaut: TriRecherche
    let fournisseursPreferes: [UUID]
    let fournisseursExclus: [UUID]
    
    enum CodingKeys: String, CodingKey {
        case triDefaut = "tri_defaut"
        case fournisseursPreferes = "fournisseurs_preferes"
        case fournisseursExclus = "fournisseurs_exclus"
    }
}

// MARK: - Seuils et alertes
struct SeuilsAlertes: Codable {
    let seuilAlertePrix: Double
    let notificationsEmail: Bool
    let notificationsPush: Bool
    
    enum CodingKeys: String, CodingKey {
        case seuilAlertePrix = "seuil_alerte_prix"
        case notificationsEmail = "notifications_email"
        case notificationsPush = "notifications_push"
    }
}

// MARK: - Préférences d'affichage
struct PreferencesAffichage: Codable {
    let nombreResultatsParPage: Int
    let afficherFraisLivraison: Bool
    let afficherNotesFournisseurs: Bool
    let afficherHistoriquePrix: Bool
    
    enum CodingKeys: String, CodingKey {
        case nombreResultatsParPage = "nombre_resultats_par_page"
        case afficherFraisLivraison = "afficher_frais_livraison"
        case afficherNotesFournisseurs = "afficher_notes_fournisseurs"
        case afficherHistoriquePrix = "afficher_historique_prix"
    }
}
