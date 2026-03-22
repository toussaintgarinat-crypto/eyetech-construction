package com.tradelayer.intelligence.domain

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.*

/**
 * Modèles de données pour l'application Tradelayer Intelligence Android.
 * Ces modèles correspondent aux structures de données du backend Django.
 */

@Parcelize
data class CorpsMetier(
    val id: String,
    val nom: String,
    val nomAffichage: String,
    val description: String,
    val couleurPrincipale: String,
    val icone: String,
    val actif: Boolean,
    val ordreAffichage: Int
) : Parcelable

@Parcelize
data class Projet(
    val id: String,
    val nom: String,
    val description: String,
    val adresse: String,
    val latitude: Double?,
    val longitude: Double?,
    val surfaceTotale: Double?,
    val nombreEtages: Int?,
    val typeBatiment: String,
    val statut: String
) : Parcelable

@Parcelize
data class CalqueMetier(
    val id: String,
    val nom: String,
    val description: String,
    val projet: String,
    val corpsMetier: String,
    val couleur: String,
    val opacite: Float,
    val styleLigne: String,
    val epaisseurLigne: Float,
    val visible: Boolean,
    val verrouille: Boolean,
    val prioriteAffichage: Int,
    val version: Int
) : Parcelable

@Parcelize
data class ElementCalque(
    val id: String,
    val calque: String,
    val typeElement: String,
    val nom: String,
    val description: String,
    val geometrie: Map<String, Any>,
    val couleur: String,
    val opacite: Float,
    val taille: Float,
    val rotation: Float,
    val proprietesMetier: Map<String, Any>,
    val visible: Boolean,
    val verrouille: Boolean
) : Parcelable

@Parcelize
data class CommandeVocale(
    val id: String,
    val utilisateur: String,
    val projet: String?,
    val fichierAudio: String?,
    val dureeAudio: Float,
    val transcriptionBrute: String,
    val transcriptionCorrigee: String?,
    val intentionDetectee: String?,
    val entitesExtraites: Map<String, Any>?,
    val contexte: Map<String, Any>?,
    val actionResultante: String?,
    val succesExecution: Boolean?,
    val reponseGeneree: String?,
    val horodatage: Date,
    val traitee: Boolean
) : Parcelable

@Parcelize
data class ZoneAnalyse(
    val id: String,
    val projet: String,
    val nom: String,
    val description: String,
    val geometrieZone: Map<String, Any>,
    val parametresAnalyse: Map<String, Any>,
    val visible: Boolean,
    val createur: String?
) : Parcelable

@Parcelize
data class PointInteret(
    val id: String,
    val projet: String,
    val nom: String,
    val description: String,
    val positionX: Float,
    val positionY: Float,
    val positionZ: Float,
    val typePoint: String,
    val elementLie: String?,
    val metadata: Map<String, Any>,
    val createur: String?
) : Parcelable

@Parcelize
data class MesureSpatiale(
    val id: String,
    val projet: String,
    val calque: String?,
    val typeMesure: String,
    val valeur: Float,
    val unite: String,
    val description: String,
    val contexteMesure: Map<String, Any>,
    val realiseePar: String?
) : Parcelable

// Modèles pour l'authentification
@Parcelize
data class User(
    val id: String,
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String
) : Parcelable

@Parcelize
data class TokenResponse(
    val access: String,
    val refresh: String
) : Parcelable

// Modèles pour les réponses API
data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?
)

// Modèles pour les erreurs
sealed class ApiError : Exception() {
    object NetworkError : ApiError()
    object UnauthorizedError : ApiError()
    data class ServerError(val code: Int, val message: String) : ApiError()
    data class UnknownError(val throwable: Throwable) : ApiError()
}

// Modèles pour l'état de l'AR
data class ARState(
    val isInitialized: Boolean = false,
    val isTracking: Boolean = false,
    val calquesLoaded: List<CalqueMetier> = emptyList(),
    val elementsVisible: List<ElementCalque> = emptyList(),
    val zonesAnalyse: List<ZoneAnalyse> = emptyList(),
    val pointsInteret: List<PointInteret> = emptyList(),
    val mesuresSpatiales: List<MesureSpatiale> = emptyList()
)

// Modèles pour les commandes vocales
data class VoiceCommandState(
    val isListening: Boolean = false,
    val isProcessing: Boolean = false,
    val lastTranscription: String = "",
    val lastResponse: String = "",
    val error: String? = null
)
