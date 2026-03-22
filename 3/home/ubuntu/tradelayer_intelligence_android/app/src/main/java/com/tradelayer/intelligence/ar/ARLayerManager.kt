package com.tradelayer.intelligence.ar

import android.content.Context
import android.graphics.Color
import android.util.Log
import com.google.ar.core.*
import com.google.ar.sceneform.AnchorNode
import com.google.ar.sceneform.Node
import com.google.ar.sceneform.math.Vector3
import com.google.ar.sceneform.rendering.*
import com.google.ar.sceneform.ux.ArFragment
import com.tradelayer.intelligence.domain.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Gestionnaire pour la visualisation des calques métiers en réalité augmentée.
 * Utilise ARCore et Sceneform pour le rendu 3D.
 */
@Singleton
class ARLayerManager @Inject constructor(
    private val context: Context
) {
    private var arFragment: ArFragment? = null
    private val anchorNodes = mutableListOf<AnchorNode>()
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    companion object {
        private const val TAG = "ARLayerManager"
    }
    
    /**
     * Initialise le gestionnaire AR avec le fragment AR.
     */
    fun initialize(arFragment: ArFragment) {
        this.arFragment = arFragment
        setupARSession()
    }
    
    private fun setupARSession() {
        arFragment?.let { fragment ->
            fragment.arSceneView.scene.addOnUpdateListener { frameTime ->
                val frame = fragment.arSceneView.arFrame
                if (frame != null) {
                    updateTracking(frame)
                }
            }
        }
    }
    
    private fun updateTracking(frame: Frame) {
        when (frame.camera.trackingState) {
            TrackingState.TRACKING -> {
                // La caméra suit correctement
                Log.d(TAG, "AR tracking active")
            }
            TrackingState.PAUSED -> {
                Log.w(TAG, "AR tracking en pause")
            }
            TrackingState.STOPPED -> {
                Log.w(TAG, "AR tracking arrêté")
            }
        }
    }
    
    /**
     * Charge et affiche les calques métiers en AR.
     */
    fun loadAndDisplayLayers(calques: List<CalqueMetier>, elements: List<ElementCalque>) {
        coroutineScope.launch {
            try {
                clearExistingAnchors()
                
                for (calque in calques.filter { it.visible }) {
                    val calqueElements = elements.filter { it.calque == calque.id && it.visible }
                    displayCalqueElements(calque, calqueElements)
                }
                
                Log.d(TAG, "Chargement de ${calques.size} calques avec ${elements.size} éléments")
            } catch (e: Exception) {
                Log.e(TAG, "Erreur lors du chargement des calques", e)
            }
        }
    }
    
    private suspend fun displayCalqueElements(calque: CalqueMetier, elements: List<ElementCalque>) {
        withContext(Dispatchers.IO) {
            for (element in elements) {
                val renderable = createRenderableForElement(element, calque)
                if (renderable != null) {
                    withContext(Dispatchers.Main) {
                        addRenderableToScene(renderable, element)
                    }
                }
            }
        }
    }
    
    private suspend fun createRenderableForElement(
        element: ElementCalque, 
        calque: CalqueMetier
    ): Renderable? {
        return withContext(Dispatchers.IO) {
            try {
                when (element.typeElement) {
                    "point" -> createPointRenderable(element, calque)
                    "ligne" -> createLineRenderable(element, calque)
                    "polygone", "rectangle" -> createPolygonRenderable(element, calque)
                    "cercle" -> createCircleRenderable(element, calque)
                    "texte" -> createTextRenderable(element, calque)
                    "symbole" -> createSymbolRenderable(element, calque)
                    "modele_3d" -> createModel3DRenderable(element, calque)
                    else -> createDefaultRenderable(element, calque)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Erreur lors de la création du renderable pour ${element.nom}", e)
                null
            }
        }
    }
    
    private fun createPointRenderable(element: ElementCalque, calque: CalqueMetier): Renderable? {
        val color = parseColor(element.couleur.ifEmpty { calque.couleur })
        return MaterialFactory.makeOpaqueWithColor(context, com.google.ar.sceneform.rendering.Color(color))
            .thenApply { material ->
                ShapeFactory.makeSphere(element.taille / 2f, Vector3.zero(), material)
            }.get()
    }
    
    private fun createLineRenderable(element: ElementCalque, calque: CalqueMetier): Renderable? {
        val color = parseColor(element.couleur.ifEmpty { calque.couleur })
        val points = extractPointsFromGeometry(element.geometrie)
        
        if (points.size >= 2) {
            val startPoint = points[0]
            val endPoint = points[1]
            val length = Vector3.subtract(endPoint, startPoint).length()
            
            return MaterialFactory.makeOpaqueWithColor(context, com.google.ar.sceneform.rendering.Color(color))
                .thenApply { material ->
                    ShapeFactory.makeCylinder(
                        calque.epaisseurLigne / 100f,
                        length,
                        Vector3.zero(),
                        material
                    )
                }.get()
        }
        return null
    }
    
    private fun createPolygonRenderable(element: ElementCalque, calque: CalqueMetier): Renderable? {
        val color = parseColor(element.couleur.ifEmpty { calque.couleur })
        val vertices = extractVerticesFromGeometry(element.geometrie)
        
        if (vertices.size >= 3) {
            // Calcul des dimensions du polygone pour créer un plan
            val minX = vertices.minOf { it.x }
            val maxX = vertices.maxOf { it.x }
            val minZ = vertices.minOf { it.z }
            val maxZ = vertices.maxOf { it.z }
            
            val width = maxX - minX
            val depth = maxZ - minZ
            
            return MaterialFactory.makeTransparentWithColor(
                context, 
                com.google.ar.sceneform.rendering.Color(color).apply { a = element.opacite }
            ).thenApply { material ->
                ShapeFactory.makeCube(Vector3(width, 0.01f, depth), Vector3.zero(), material)
            }.get()
        }
        return null
    }
    
    private fun createCircleRenderable(element: ElementCalque, calque: CalqueMetier): Renderable? {
        val color = parseColor(element.couleur.ifEmpty { calque.couleur })
        val radius = extractRadiusFromGeometry(element.geometrie)
        
        return MaterialFactory.makeOpaqueWithColor(context, com.google.ar.sceneform.rendering.Color(color))
            .thenApply { material ->
                ShapeFactory.makeSphere(radius, Vector3.zero(), material)
            }.get()
    }
    
    private fun createTextRenderable(element: ElementCalque, calque: CalqueMetier): Renderable? {
        // Pour le texte, on crée un petit cube comme placeholder
        // Dans une implémentation complète, on utiliserait ViewRenderable pour afficher du texte
        val color = parseColor(element.couleur.ifEmpty { calque.couleur })
        return MaterialFactory.makeOpaqueWithColor(context, com.google.ar.sceneform.rendering.Color(color))
            .thenApply { material ->
                ShapeFactory.makeCube(Vector3(0.05f, 0.05f, 0.05f), Vector3.zero(), material)
            }.get()
    }
    
    private fun createSymbolRenderable(element: ElementCalque, calque: CalqueMetier): Renderable? {
        // Placeholder pour les symboles - dans une implémentation complète,
        // on chargerait des modèles 3D spécifiques
        val color = parseColor(element.couleur.ifEmpty { calque.couleur })
        return MaterialFactory.makeOpaqueWithColor(context, com.google.ar.sceneform.rendering.Color(color))
            .thenApply { material ->
                ShapeFactory.makeCube(Vector3(0.03f, 0.03f, 0.03f), Vector3.zero(), material)
            }.get()
    }
    
    private fun createModel3DRenderable(element: ElementCalque, calque: CalqueMetier): Renderable? {
        // Pour les modèles 3D, on devrait charger depuis une URL
        // Ici on crée un placeholder
        val color = parseColor(element.couleur.ifEmpty { calque.couleur })
        return MaterialFactory.makeOpaqueWithColor(context, com.google.ar.sceneform.rendering.Color(color))
            .thenApply { material ->
                ShapeFactory.makeCube(Vector3(element.taille, element.taille, element.taille), Vector3.zero(), material)
            }.get()
    }
    
    private fun createDefaultRenderable(element: ElementCalque, calque: CalqueMetier): Renderable? {
        val color = parseColor(element.couleur.ifEmpty { calque.couleur })
        return MaterialFactory.makeOpaqueWithColor(context, com.google.ar.sceneform.rendering.Color(color))
            .thenApply { material ->
                ShapeFactory.makeCube(Vector3(0.02f, 0.02f, 0.02f), Vector3.zero(), material)
            }.get()
    }
    
    private fun addRenderableToScene(renderable: Renderable, element: ElementCalque) {
        arFragment?.let { fragment ->
            val anchor = fragment.arSceneView.session?.createAnchor(
                Pose.makeTranslation(0f, 0f, -1f) // Position par défaut
            )
            
            anchor?.let {
                val anchorNode = AnchorNode(it)
                val node = Node().apply {
                    this.renderable = renderable
                    localPosition = extractPositionFromGeometry(element.geometrie)
                    localRotation = com.google.ar.sceneform.math.Quaternion.axisAngle(
                        Vector3(0f, 1f, 0f), 
                        element.rotation
                    )
                    localScale = Vector3(element.taille, element.taille, element.taille)
                }
                
                anchorNode.addChild(node)
                fragment.arSceneView.scene.addChild(anchorNode)
                anchorNodes.add(anchorNode)
                
                Log.d(TAG, "Ajout de l'élément ${element.nom} à la scène AR")
            }
        }
    }
    
    /**
     * Affiche les données d'analyse spatiale en AR.
     */
    fun displaySpatialAnalysisData(
        zones: List<ZoneAnalyse>,
        points: List<PointInteret>,
        mesures: List<MesureSpatiale>
    ) {
        coroutineScope.launch {
            displayZonesAnalyse(zones)
            displayPointsInteret(points)
            displayMesuresSpatiales(mesures)
        }
    }
    
    private suspend fun displayZonesAnalyse(zones: List<ZoneAnalyse>) {
        for (zone in zones.filter { it.visible }) {
            val renderable = createZoneRenderable(zone)
            if (renderable != null) {
                withContext(Dispatchers.Main) {
                    addZoneToScene(renderable, zone)
                }
            }
        }
    }
    
    private suspend fun displayPointsInteret(points: List<PointInteret>) {
        for (point in points) {
            val renderable = createPointInteretRenderable(point)
            if (renderable != null) {
                withContext(Dispatchers.Main) {
                    addPointInteretToScene(renderable, point)
                }
            }
        }
    }
    
    private suspend fun displayMesuresSpatiales(mesures: List<MesureSpatiale>) {
        for (mesure in mesures) {
            val renderable = createMesureRenderable(mesure)
            if (renderable != null) {
                withContext(Dispatchers.Main) {
                    addMesureToScene(renderable, mesure)
                }
            }
        }
    }
    
    private suspend fun createZoneRenderable(zone: ZoneAnalyse): Renderable? {
        return withContext(Dispatchers.IO) {
            MaterialFactory.makeTransparentWithColor(
                context,
                com.google.ar.sceneform.rendering.Color(Color.YELLOW).apply { a = 0.5f }
            ).thenApply { material ->
                ShapeFactory.makeCube(Vector3(1f, 0.1f, 1f), Vector3.zero(), material)
            }.get()
        }
    }
    
    private suspend fun createPointInteretRenderable(point: PointInteret): Renderable? {
        return withContext(Dispatchers.IO) {
            MaterialFactory.makeOpaqueWithColor(
                context,
                com.google.ar.sceneform.rendering.Color(Color.MAGENTA)
            ).thenApply { material ->
                ShapeFactory.makeSphere(0.03f, Vector3.zero(), material)
            }.get()
        }
    }
    
    private suspend fun createMesureRenderable(mesure: MesureSpatiale): Renderable? {
        return withContext(Dispatchers.IO) {
            MaterialFactory.makeOpaqueWithColor(
                context,
                com.google.ar.sceneform.rendering.Color(Color.CYAN)
            ).thenApply { material ->
                ShapeFactory.makeCylinder(0.01f, 0.5f, Vector3.zero(), material)
            }.get()
        }
    }
    
    private fun addZoneToScene(renderable: Renderable, zone: ZoneAnalyse) {
        // Implémentation similaire à addRenderableToScene
        addGenericToScene(renderable, Vector3(0.2f, -0.5f, -1f))
    }
    
    private fun addPointInteretToScene(renderable: Renderable, point: PointInteret) {
        val position = Vector3(point.positionX, point.positionY, point.positionZ)
        addGenericToScene(renderable, position)
    }
    
    private fun addMesureToScene(renderable: Renderable, mesure: MesureSpatiale) {
        addGenericToScene(renderable, Vector3(0.2f, 0.2f, -0.8f))
    }
    
    private fun addGenericToScene(renderable: Renderable, position: Vector3) {
        arFragment?.let { fragment ->
            val anchor = fragment.arSceneView.session?.createAnchor(
                Pose.makeTranslation(position.x, position.y, position.z)
            )
            
            anchor?.let {
                val anchorNode = AnchorNode(it)
                val node = Node().apply {
                    this.renderable = renderable
                }
                
                anchorNode.addChild(node)
                fragment.arSceneView.scene.addChild(anchorNode)
                anchorNodes.add(anchorNode)
            }
        }
    }
    
    /**
     * Efface tous les objets AR de la scène.
     */
    fun clearExistingAnchors() {
        anchorNodes.forEach { anchorNode ->
            arFragment?.arSceneView?.scene?.removeChild(anchorNode)
            anchorNode.anchor?.detach()
        }
        anchorNodes.clear()
        Log.d(TAG, "Nettoyage de la scène AR")
    }
    
    // Fonctions utilitaires pour l'extraction de données géométriques
    
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
    
    private fun extractPointsFromGeometry(geometrie: Map<String, Any>): List<Vector3> {
        val points = geometrie["points"] as? List<Map<String, Any>> ?: return emptyList()
        return points.map { point ->
            Vector3(
                (point["x"] as? Double)?.toFloat() ?: 0f,
                (point["y"] as? Double)?.toFloat() ?: 0f,
                (point["z"] as? Double)?.toFloat() ?: 0f
            )
        }
    }
    
    private fun extractVerticesFromGeometry(geometrie: Map<String, Any>): List<Vector3> {
        val vertices = geometrie["vertices"] as? List<Map<String, Any>> ?: return emptyList()
        return vertices.map { vertex ->
            Vector3(
                (vertex["x"] as? Double)?.toFloat() ?: 0f,
                (vertex["y"] as? Double)?.toFloat() ?: 0f,
                (vertex["z"] as? Double)?.toFloat() ?: 0f
            )
        }
    }
    
    private fun extractRadiusFromGeometry(geometrie: Map<String, Any>): Float {
        return (geometrie["radius"] as? Double)?.toFloat() ?: 0.1f
    }
    
    private fun parseColor(colorString: String): Int {
        return try {
            Color.parseColor(if (colorString.startsWith("#")) colorString else "#$colorString")
        } catch (e: Exception) {
            Color.GRAY
        }
    }
}
