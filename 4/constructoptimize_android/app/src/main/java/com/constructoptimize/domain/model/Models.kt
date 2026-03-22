package com.constructoptimize.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date
import java.util.UUID

// MARK: - Produit
@Parcelize
data class Produit(
    val id: String,
    val nom: String,
    val description: String,
    val descriptionCourte: String?,
    val categorie: Categorie,
    val marque: Marque?,
    val sku: String?,
    val ean: String?,
    val referenceFabricant: String?,
    val uniteMesure: UniteMesure,
    val poids: Double?,
    val dimensions: Dimensions?,
    val imagePrincipale: String?,
    val fichesTechniques: List<String>,
    val noteMoyenne: Double,
    val nombreAvis: Int,
    val active: Boolean,
    val dateCreation: Date,
    val dateModification: Date,
    val derniereMajPrix: Date?,
    val prixFournisseurs: List<PrixProduit> = emptyList(),
    val caracteristiques: List<CaracteristiqueProduit> = emptyList(),
    val images: List<ImageProduit> = emptyList(),
    val avis: List<AvisProduit> = emptyList()
) : Parcelable {
    
    val prixMin: Double?
        get() = prixFournisseurs.mapNotNull { it.prix }.minOrNull()
    
    val prixMax: Double?
        get() = prixFournisseurs.mapNotNull { it.prix }.maxOrNull()
    
    val nombreFournisseurs: Int
        get() = prixFournisseurs.count { it.disponible }
}

// MARK: - Catégorie
@Parcelize
data class Categorie(
    val id: String,
    val nom: String,
    val slug: String,
    val description: String?,
    val parentCategorie: String?,
    val image: String?,
    val ordreAffichage: Int,
    val active: Boolean,
    val dateCreation: Date,
    val dateModification: Date
) : Parcelable

// MARK: - Marque
@Parcelize
data class Marque(
    val id: String,
    val nom: String,
    val description: String?,
    val logo: String?,
    val siteWeb: String?,
    val active: Boolean,
    val dateCreation: Date,
    val dateModification: Date
) : Parcelable

// MARK: - Unité de mesure
@Parcelize
enum class UniteMesure(val displayName: String, val symbol: String) : Parcelable {
    PIECE("Pièce", "pce"),
    METRE("Mètre", "m"),
    METRE_CARRE("Mètre carré", "m²"),
    METRE_CUBE("Mètre cube", "m³"),
    KILOGRAMME("Kilogramme", "kg"),
    TONNE("Tonne", "t"),
    LITRE("Litre", "L"),
    SAC("Sac", "sac"),
    PALETTE("Palette", "pal"),
    LOT("Lot", "lot")
}

// MARK: - Dimensions
@Parcelize
data class Dimensions(
    val longueur: Double?,
    val largeur: Double?,
    val hauteur: Double?
) : Parcelable {
    
    val volume: Double?
        get() = if (longueur != null && largeur != null && hauteur != null) {
            longueur * largeur * hauteur
        } else null
    
    val surface: Double?
        get() = if (longueur != null && largeur != null) {
            longueur * largeur
        } else null
}

// MARK: - Fournisseur
@Parcelize
data class Fournisseur(
    val id: String,
    val nom: String,
    val nomCommercial: String?,
    val typeFournisseur: TypeFournisseur,
    val email: String?,
    val telephone: String?,
    val siteWeb: String?,
    val adresse: Adresse?,
    val coordonnees: Coordonnees?,
    val siret: String?,
    val tvaIntracommunautaire: String?,
    val logo: String?,
    val description: String?,
    val noteQualite: Double,
    val nombreEvaluations: Int,
    val delaiLivraisonMoyen: Int,
    val fraisLivraisonGratuite: Double?,
    val accepteCommandesEnLigne: Boolean,
    val active: Boolean,
    val verifie: Boolean,
    val dateCreation: Date,
    val dateModification: Date,
    val derniereSynchronisation: Date?
) : Parcelable

// MARK: - Type de fournisseur
@Parcelize
enum class TypeFournisseur(val displayName: String, val icon: String) : Parcelable {
    DISTRIBUTEUR("Distributeur", "truck"),
    FABRICANT("Fabricant", "factory"),
    GROSSISTE("Grossiste", "warehouse"),
    DETAILLANT("Détaillant", "store"),
    MARKETPLACE("Marketplace", "globe"),
    LOCAL("Fournisseur local", "location")
}

// MARK: - Adresse
@Parcelize
data class Adresse(
    val rue: String?,
    val ville: String?,
    val codePostal: String?,
    val pays: String,
    val latitude: Double?,
    val longitude: Double?
) : Parcelable {
    
    val adresseComplete: String
        get() {
            val components = mutableListOf<String>()
            rue?.takeIf { it.isNotEmpty() }?.let { components.add(it) }
            
            if (!codePostal.isNullOrEmpty() && !ville.isNullOrEmpty()) {
                components.add("$codePostal $ville")
            } else if (!ville.isNullOrEmpty()) {
                components.add(ville)
            }
            
            if (pays != "France") components.add(pays)
            
            return components.joinToString(", ")
        }
}

// MARK: - Coordonnées
@Parcelize
data class Coordonnees(
    val latitude: Double,
    val longitude: Double
) : Parcelable

// MARK: - Prix Produit
@Parcelize
data class PrixProduit(
    val id: String,
    val produit: String,
    val fournisseur: Fournisseur,
    val prix: Double,
    val devise: Devise,
    val prixUnitaire: Double?,
    val quantiteMinimale: Int,
    val quantiteMaximale: Int?,
    val remises: RemisesQuantite,
    val disponible: Boolean,
    val stockDisponible: Int?,
    val delaiLivraison: Int,
    val fraisLivraison: Double,
    val referenceFournisseur: String?,
    val urlProduit: String?,
    val dateCreation: Date,
    val dateModification: Date,
    val derniereVerification: Date,
    val sourceDonnees: SourceDonnees
) : Parcelable {
    
    fun prixAvecRemise(quantite: Int): Double {
        return when {
            quantite >= 100 && remises.remise100Pieces > 0 -> 
                prix * (1 - remises.remise100Pieces / 100)
            quantite >= 50 && remises.remise50Pieces > 0 -> 
                prix * (1 - remises.remise50Pieces / 100)
            quantite >= 10 && remises.remise10Pieces > 0 -> 
                prix * (1 - remises.remise10Pieces / 100)
            else -> prix
        }
    }
    
    fun prixTotal(quantite: Int, inclureLivraison: Boolean = true): Double {
        val prixUnitaireAvecRemise = prixAvecRemise(quantite)
        var total = prixUnitaireAvecRemise * quantite
        
        if (inclureLivraison) {
            val seuilGratuite = fournisseur.fraisLivraisonGratuite
            if (seuilGratuite == null || total < seuilGratuite) {
                total += fraisLivraison
            }
        }
        
        return total
    }
}

// MARK: - Devise
@Parcelize
enum class Devise(val symbol: String, val name: String) : Parcelable {
    EUR("€", "Euro"),
    USD("$", "Dollar US"),
    GBP("£", "Livre Sterling")
}

// MARK: - Remises par quantité
@Parcelize
data class RemisesQuantite(
    val remise10Pieces: Double,
    val remise50Pieces: Double,
    val remise100Pieces: Double
) : Parcelable

// MARK: - Source de données
@Parcelize
enum class SourceDonnees(val displayName: String, val fiabilite: Double) : Parcelable {
    MANUAL("Manuel", 1.0),
    API("API", 0.95),
    SCRAPING("Scraping", 0.8)
}

// MARK: - Modèles supplémentaires
@Parcelize
data class CaracteristiqueProduit(
    val id: String,
    val nom: String,
    val valeur: String,
    val unite: String?,
    val ordre: Int
) : Parcelable

@Parcelize
data class ImageProduit(
    val id: String,
    val image: String,
    val altText: String?,
    val ordre: Int,
    val dateAjout: Date
) : Parcelable

@Parcelize
data class AvisProduit(
    val id: String,
    val utilisateur: String?,
    val nomUtilisateur: String?,
    val note: Int,
    val titre: String?,
    val commentaire: String,
    val verifie: Boolean,
    val dateCreation: Date
) : Parcelable

// MARK: - Recherche et Comparaison
@Parcelize
data class RechercheComparaison(
    val id: String,
    val utilisateur: String?,
    val sessionId: String?,
    val termeRecherche: String,
    val produits: List<ElementRecherche>,
    val filtres: FiltresRecherche,
    val triPar: TriRecherche,
    val statut: StatutRecherche,
    val nombreResultats: Int,
    val tempsExecution: Double?,
    val dateCreation: Date,
    val dateExpiration: Date?,
    val sauvegardee: Boolean,
    val partageable: Boolean,
    val lienPartage: String?
) : Parcelable

@Parcelize
data class ElementRecherche(
    val id: String,
    val produit: Produit,
    val quantiteDemandee: Int,
    val priorite: Int,
    val notes: String?
) : Parcelable

@Parcelize
data class FiltresRecherche(
    val prixMin: Double?,
    val prixMax: Double?,
    val fournisseursInclus: List<String>,
    val rayonRecherche: Int?,
    val localisation: Coordonnees?,
    val categoriesIncluses: List<String>,
    val marquesIncluses: List<String>,
    val disponibleUniquement: Boolean,
    val livraison24h: Boolean,
    val fournisseursVerifies: Boolean
) : Parcelable {
    
    companion object {
        val defaut = FiltresRecherche(
            prixMin = null,
            prixMax = null,
            fournisseursInclus = emptyList(),
            rayonRecherche = 50,
            localisation = null,
            categoriesIncluses = emptyList(),
            marquesIncluses = emptyList(),
            disponibleUniquement = true,
            livraison24h = false,
            fournisseursVerifies = false
        )
    }
}

@Parcelize
enum class TriRecherche(val displayName: String, val icon: String) : Parcelable {
    PRIX("Prix croissant", "arrow_upward"),
    PRIX_DESC("Prix décroissant", "arrow_downward"),
    DELAI("Délai de livraison", "schedule"),
    NOTE("Note fournisseur", "star"),
    DISTANCE("Distance", "location_on"),
    DISPONIBILITE("Disponibilité", "check_circle"),
    PERTINENCE("Pertinence", "target")
}

@Parcelize
enum class StatutRecherche(val displayName: String, val color: String) : Parcelable {
    EN_COURS("En cours", "orange"),
    TERMINEE("Terminée", "green"),
    ERREUR("Erreur", "red"),
    EXPIREE("Expirée", "gray")
}

@Parcelize
data class ResultatComparaison(
    val id: String,
    val recherche: String,
    val prixProduit: PrixProduit,
    val quantite: Int,
    val prixUnitaire: Double,
    val prixTotalHT: Double,
    val prixTotalTTC: Double,
    val fraisLivraison: Double,
    val disponible: Boolean,
    val stockDisponible: Int?,
    val delaiLivraisonEstime: Int,
    val distanceFournisseur: Double?,
    val scores: ScoresResultat,
    val rangs: RangsResultat,
    val dateCreation: Date,
    val sourceDonnees: SourceDonnees,
    val fiabiliteDonnees: Double
) : Parcelable

@Parcelize
data class ScoresResultat(
    val scorePrix: Double,
    val scoreQualite: Double,
    val scoreGlobal: Double
) : Parcelable

@Parcelize
data class RangsResultat(
    val rangPrix: Int?,
    val rangGlobal: Int?
) : Parcelable

// MARK: - Recommandations
@Parcelize
data class RecommandationAchat(
    val id: String,
    val recherche: String,
    val typeRecommandation: TypeRecommandation,
    val resultatRecommande: ResultatComparaison?,
    val produitAlternatif: Produit?,
    val titre: String,
    val description: String,
    val economieEstimee: Double?,
    val pourcentageEconomie: Double?,
    val scoreConfiance: Double,
    val priorite: Int,
    val dateCreation: Date,
    val vueParUtilisateur: Boolean,
    val accepteeParUtilisateur: Boolean
) : Parcelable

@Parcelize
enum class TypeRecommandation(
    val displayName: String, 
    val icon: String, 
    val color: String
) : Parcelable {
    MEILLEUR_PRIX("Meilleur prix", "euro_symbol", "green"),
    MEILLEUR_RAPPORT("Meilleur rapport qualité/prix", "star", "blue"),
    LIVRAISON_RAPIDE("Livraison la plus rapide", "schedule", "orange"),
    FOURNISSEUR_LOCAL("Fournisseur local", "location_on", "purple"),
    ACHAT_GROUPE("Achat groupé", "group", "indigo"),
    ALTERNATIVE("Produit alternatif", "swap_horiz", "teal")
}
