package com.tradelayer.intelligence.spatial

import android.content.Context
import android.location.Location
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.google.ar.core.Pose
import com.google.ar.sceneform.math.Vector3
import com.tradelayer.intelligence.data.repository.SpatialAnalysisRepository
import com.tradelayer.intelligence.domain.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.*

/**
 * Gestionnaire pour l'analyse spatiale dans l'application Android.
 * Fournit des outils de mesure, d'analyse géométrique et de gestion des zones d'intérêt.
 */
@Singleton
class SpatialAnalysisManager @Inject constructor(
    private val context: Context,
    private val spatialAnalysisRepository: SpatialAnalysisRepository
) {
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    private val _zonesAnalyse = MutableLiveData<List<ZoneAnalyse>>(emptyList())
    val zonesAnalyse: LiveData<List<ZoneAnalyse>> = _zonesAnalyse
    
    private val _pointsInteret = MutableLiveData<List<PointInteret>>(emptyList())
    val pointsInteret: LiveData<List<PointInteret>> = _pointsInteret
    
    private val _mesuresSpatiales = MutableLiveData<List<MesureSpatiale>>(emptyList())
    val mesuresSpatiales: LiveData<List<MesureSpatiale>> = _mesuresSpatiales
    
    private var currentProjectId: String? = null
    
    companion object {
        private const val TAG = "SpatialAnalysisManager"
        private const val EARTH_RADIUS = 6371000.0 // Rayon de la Terre en mètres
    }
    
    /**
     * Définit l'ID du projet actuel pour l'analyse spatiale.
     */
    fun setCurrentProject(projectId: String) {
        this.currentProjectId = projectId
        loadSpatialData()
        Log.d(TAG, "Projet actuel défini pour l'analyse spatiale: $projectId")
    }
    
    /**
     * Charge toutes les données d'analyse spatiale pour le projet actuel.
     */
    private fun loadSpatialData() {
        currentProjectId?.let { projectId ->
            coroutineScope.launch {
                try {
                    // Chargement des zones d'analyse
                    val zones = spatialAnalysisRepository.getZonesAnalyse(projectId)
                    _zonesAnalyse.value = zones
                    
                    // Chargement des points d'intérêt
                    val points = spatialAnalysisRepository.getPointsInteret(projectId)
                    _pointsInteret.value = points
                    
                    // Chargement des mesures spatiales
                    val mesures = spatialAnalysisRepository.getMesuresSpatiales(projectId)
                    _mesuresSpatiales.value = mesures
                    
                    Log.d(TAG, "Données spatiales chargées: ${zones.size} zones, ${points.size} points, ${mesures.size} mesures")
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Erreur lors du chargement des données spatiales", e)
                }
            }
        }
    }
    
    /**
     * Calcule la distance entre deux points 3D.
     */
    fun calculateDistance(point1: Vector3, point2: Vector3): Float {
        return sqrt(
            (point2.x - point1.x).pow(2) +
            (point2.y - point1.y).pow(2) +
            (point2.z - point1.z).pow(2)
        )
    }
    
    /**
     * Calcule la distance entre deux poses AR.
     */
    fun calculateDistance(pose1: Pose, pose2: Pose): Float {
        val translation1 = pose1.translation
        val translation2 = pose2.translation
        
        return sqrt(
            (translation2[0] - translation1[0]).pow(2) +
            (translation2[1] - translation1[1]).pow(2) +
            (translation2[2] - translation1[2]).pow(2)
        )
    }
    
    /**
     * Calcule l'angle entre trois points.
     */
    fun calculateAngle(center: Vector3, point1: Vector3, point2: Vector3): Float {
        val vector1 = Vector3.subtract(point1, center)
        val vector2 = Vector3.subtract(point2, center)
        
        val dotProduct = Vector3.dot(vector1, vector2)
        val magnitude1 = vector1.length()
        val magnitude2 = vector2.length()
        
        if (magnitude1 == 0f || magnitude2 == 0f) return 0f
        
        val cosAngle = dotProduct / (magnitude1 * magnitude2)
        return acos(cosAngle.coerceIn(-1f, 1f)) * 180f / PI.toFloat()
    }
    
    /**
     * Calcule la surface d'un polygone défini par une liste de points.
     */
    fun calculatePolygonArea(vertices: List<Vector3>): Float {
        if (vertices.size < 3) return 0f
        
        var area = 0f
        val n = vertices.size
        
        for (i in 0 until n) {
            val j = (i + 1) % n
            area += vertices[i].x * vertices[j].z
            area -= vertices[j].x * vertices[i].z
        }
        
        return abs(area) / 2f
    }
    
    /**
     * Calcule le volume d'un prisme défini par une base polygonale et une hauteur.
     */
    fun calculatePrismVolume(baseVertices: List<Vector3>, height: Float): Float {
        val baseArea = calculatePolygonArea(baseVertices)
        return baseArea * height
    }
    
    /**
     * Crée une nouvelle mesure de distance.
     */
    fun createDistanceMeasurement(
        startPoint: Vector3,
        endPoint: Vector3,
        description: String = "Mesure de distance"
    ) {
        currentProjectId?.let { projectId ->
            val distance = calculateDistance(startPoint, endPoint)
            
            coroutineScope.launch {
                try {
                    val mesure = spatialAnalysisRepository.createMesureSpatiale(
                        projectId = projectId,
                        typeMesure = "distance",
                        valeur = distance,
                        unite = "m",
                        description = description,
                        contexteMesure = mapOf(
                            "start_point" to mapOf(
                                "x" to startPoint.x,
                                "y" to startPoint.y,
                                "z" to startPoint.z
                            ),
                            "end_point" to mapOf(
                                "x" to endPoint.x,
                                "y" to endPoint.y,
                                "z" to endPoint.z
                            )
                        )
                    )
                    
                    // Mettre à jour la liste locale
                    val currentMesures = _mesuresSpatiales.value?.toMutableList() ?: mutableListOf()
                    currentMesures.add(mesure)
                    _mesuresSpatiales.value = currentMesures
                    
                    Log.d(TAG, "Mesure de distance créée: ${distance}m")
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Erreur lors de la création de la mesure de distance", e)
                }
            }
        }
    }
    
    /**
     * Crée une nouvelle mesure d'angle.
     */
    fun createAngleMeasurement(
        centerPoint: Vector3,
        point1: Vector3,
        point2: Vector3,
        description: String = "Mesure d'angle"
    ) {
        currentProjectId?.let { projectId ->
            val angle = calculateAngle(centerPoint, point1, point2)
            
            coroutineScope.launch {
                try {
                    val mesure = spatialAnalysisRepository.createMesureSpatiale(
                        projectId = projectId,
                        typeMesure = "angle",
                        valeur = angle,
                        unite = "°",
                        description = description,
                        contexteMesure = mapOf(
                            "center_point" to mapOf(
                                "x" to centerPoint.x,
                                "y" to centerPoint.y,
                                "z" to centerPoint.z
                            ),
                            "point1" to mapOf(
                                "x" to point1.x,
                                "y" to point1.y,
                                "z" to point1.z
                            ),
                            "point2" to mapOf(
                                "x" to point2.x,
                                "y" to point2.y,
                                "z" to point2.z
                            )
                        )
                    )
                    
                    // Mettre à jour la liste locale
                    val currentMesures = _mesuresSpatiales.value?.toMutableList() ?: mutableListOf()
                    currentMesures.add(mesure)
                    _mesuresSpatiales.value = currentMesures
                    
                    Log.d(TAG, "Mesure d'angle créée: ${angle}°")
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Erreur lors de la création de la mesure d'angle", e)
                }
            }
        }
    }
    
    /**
     * Crée une nouvelle mesure de surface.
     */
    fun createAreaMeasurement(
        vertices: List<Vector3>,
        description: String = "Mesure de surface"
    ) {
        currentProjectId?.let { projectId ->
            val area = calculatePolygonArea(vertices)
            
            coroutineScope.launch {
                try {
                    val mesure = spatialAnalysisRepository.createMesureSpatiale(
                        projectId = projectId,
                        typeMesure = "surface",
                        valeur = area,
                        unite = "m²",
                        description = description,
                        contexteMesure = mapOf(
                            "vertices" to vertices.map { vertex ->
                                mapOf(
                                    "x" to vertex.x,
                                    "y" to vertex.y,
                                    "z" to vertex.z
                                )
                            }
                        )
                    )
                    
                    // Mettre à jour la liste locale
                    val currentMesures = _mesuresSpatiales.value?.toMutableList() ?: mutableListOf()
                    currentMesures.add(mesure)
                    _mesuresSpatiales.value = currentMesures
                    
                    Log.d(TAG, "Mesure de surface créée: ${area}m²")
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Erreur lors de la création de la mesure de surface", e)
                }
            }
        }
    }
    
    /**
     * Crée un nouveau point d'intérêt.
     */
    fun createPointInteret(
        position: Vector3,
        nom: String,
        description: String,
        typePoint: String = "marker"
    ) {
        currentProjectId?.let { projectId ->
            coroutineScope.launch {
                try {
                    val point = spatialAnalysisRepository.createPointInteret(
                        projectId = projectId,
                        nom = nom,
                        description = description,
                        positionX = position.x,
                        positionY = position.y,
                        positionZ = position.z,
                        typePoint = typePoint,
                        metadata = mapOf(
                            "created_timestamp" to System.currentTimeMillis(),
                            "creation_method" to "manual"
                        )
                    )
                    
                    // Mettre à jour la liste locale
                    val currentPoints = _pointsInteret.value?.toMutableList() ?: mutableListOf()
                    currentPoints.add(point)
                    _pointsInteret.value = currentPoints
                    
                    Log.d(TAG, "Point d'intérêt créé: $nom")
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Erreur lors de la création du point d'intérêt", e)
                }
            }
        }
    }
    
    /**
     * Crée une nouvelle zone d'analyse.
     */
    fun createZoneAnalyse(
        nom: String,
        description: String,
        vertices: List<Vector3>,
        parametresAnalyse: Map<String, Any> = emptyMap()
    ) {
        currentProjectId?.let { projectId ->
            coroutineScope.launch {
                try {
                    val zone = spatialAnalysisRepository.createZoneAnalyse(
                        projectId = projectId,
                        nom = nom,
                        description = description,
                        geometrieZone = mapOf(
                            "type" to "Polygon",
                            "coordinates" to listOf(
                                vertices.map { vertex ->
                                    listOf(vertex.x.toDouble(), vertex.y.toDouble(), vertex.z.toDouble())
                                }
                            )
                        ),
                        parametresAnalyse = parametresAnalyse,
                        visible = true
                    )
                    
                    // Mettre à jour la liste locale
                    val currentZones = _zonesAnalyse.value?.toMutableList() ?: mutableListOf()
                    currentZones.add(zone)
                    _zonesAnalyse.value = currentZones
                    
                    Log.d(TAG, "Zone d'analyse créée: $nom")
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Erreur lors de la création de la zone d'analyse", e)
                }
            }
        }
    }
    
    /**
     * Détecte les collisions entre éléments dans une zone donnée.
     */
    fun detectCollisions(elements: List<ElementCalque>): List<Pair<ElementCalque, ElementCalque>> {
        val collisions = mutableListOf<Pair<ElementCalque, ElementCalque>>()
        
        for (i in elements.indices) {
            for (j in i + 1 until elements.size) {
                if (checkElementsCollision(elements[i], elements[j])) {
                    collisions.add(Pair(elements[i], elements[j]))
                }
            }
        }
        
        Log.d(TAG, "Détection de collisions: ${collisions.size} collisions trouvées")
        return collisions
    }
    
    private fun checkElementsCollision(element1: ElementCalque, element2: ElementCalque): Boolean {
        // Implémentation simplifiée de détection de collision
        // Dans une implémentation complète, ceci utiliserait les géométries réelles
        val pos1 = extractPositionFromGeometry(element1.geometrie)
        val pos2 = extractPositionFromGeometry(element2.geometrie)
        
        val distance = calculateDistance(pos1, pos2)
        val threshold = (element1.taille + element2.taille) / 2f
        
        return distance < threshold
    }
    
    private fun extractPositionFromGeometry(geometrie: Map<String, Any>): Vector3 {
        val position = geometrie["position"] as? Map<String, Any>
        return if (position != null) {
            Vector3(
                (position["x"] as? Double)?.toFloat() ?: 0f,
                (position["y"] as? Double)?.toFloat() ?: 0f,
                (position["z"] as? Double)?.toFloat() ?: 0f
            )
        } else {
            Vector3.zero()
        }
    }
    
    /**
     * Calcule la distance géographique entre deux coordonnées GPS.
     */
    fun calculateGeoDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        
        val a = sin(dLat / 2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        return EARTH_RADIUS * c
    }
    
    /**
     * Nettoie les ressources du gestionnaire.
     */
    fun cleanup() {
        _zonesAnalyse.value = emptyList()
        _pointsInteret.value = emptyList()
        _mesuresSpatiales.value = emptyList()
        currentProjectId = null
        Log.d(TAG, "Nettoyage des données d'analyse spatiale")
    }
}
