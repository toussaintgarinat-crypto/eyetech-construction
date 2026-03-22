using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using System.IO;

namespace BuildingScanVR.Core
{
    /// <summary>
    /// Gestionnaire de visualisation immersive des modèles 3D pour Building Scan VR.
    /// Charge, affiche et optimise les modèles 3D générés par Building Scan.
    /// </summary>
    public class Model3DViewer : MonoBehaviour
    {
        [Header("Model Loading Settings")]
        [SerializeField] private bool autoLoadOnStart = false;
        [SerializeField] private string defaultModelURL = "";
        [SerializeField] private Transform modelContainer;
        [SerializeField] private Vector3 defaultModelScale = Vector3.one;
        [SerializeField] private Vector3 defaultModelPosition = Vector3.zero;

        [Header("Performance Settings")]
        [SerializeField] private bool enableLOD = true;
        [SerializeField] private float[] lodDistances = { 5f, 15f, 30f };
        [SerializeField] private bool enableOcclusionCulling = true;
        [SerializeField] private bool enableDynamicBatching = true;
        [SerializeField] private int maxVerticesPerMesh = 65000;

        [Header("Visual Settings")]
        [SerializeField] private bool enableRealtimeLighting = true;
        [SerializeField] private bool enableShadows = true;
        [SerializeField] private bool enableReflections = false;
        [SerializeField] private Material defaultMaterial;
        [SerializeField] private Material wireframeMaterial;

        [Header("Interaction Settings")]
        [SerializeField] private bool enableModelRotation = true;
        [SerializeField] private bool enableModelScaling = true;
        [SerializeField] private bool enableModelTranslation = true;
        [SerializeField] private float rotationSpeed = 50f;
        [SerializeField] private float scalingSpeed = 0.1f;

        // Événements
        public System.Action<GameObject> OnModelLoaded;
        public System.Action<string> OnModelLoadError;
        public System.Action<float> OnLoadingProgress;
        public System.Action<Model3DInfo> OnModelInfoUpdated;

        // Propriétés publiques
        public GameObject CurrentModel { get; private set; }
        public Model3DInfo CurrentModelInfo { get; private set; }
        public bool IsModelLoaded => CurrentModel != null;
        public bool IsLoading { get; private set; }

        // Références
        private Camera vrCamera;
        private Transform vrRig;
        private Model3DOptimizer optimizer;
        private Model3DInteractionHandler interactionHandler;

        // Cache des modèles
        private Dictionary<string, GameObject> modelCache = new Dictionary<string, GameObject>();
        private Dictionary<string, Model3DInfo> modelInfoCache = new Dictionary<string, Model3DInfo>();

        // État de visualisation
        private ViewMode currentViewMode = ViewMode.Realistic;
        private bool isWireframeMode = false;
        private float currentScale = 1f;

        public enum ViewMode
        {
            Realistic,
            Wireframe,
            XRay,
            Sectioned
        }

        private void Awake()
        {
            // Recherche des composants
            vrCamera = Camera.main ?? FindObjectOfType<Camera>();
            vrRig = transform.root;

            // Configuration du conteneur de modèle
            if (modelContainer == null)
            {
                GameObject container = new GameObject("ModelContainer");
                container.transform.SetParent(transform);
                container.transform.localPosition = defaultModelPosition;
                modelContainer = container.transform;
            }

            // Initialisation des composants
            optimizer = gameObject.AddComponent<Model3DOptimizer>();
            interactionHandler = gameObject.AddComponent<Model3DInteractionHandler>();

            // Configuration de l'optimiseur
            optimizer.EnableLOD = enableLOD;
            optimizer.LODDistances = lodDistances;
            optimizer.MaxVerticesPerMesh = maxVerticesPerMesh;

            // Configuration du gestionnaire d'interaction
            interactionHandler.EnableRotation = enableModelRotation;
            interactionHandler.EnableScaling = enableModelScaling;
            interactionHandler.EnableTranslation = enableModelTranslation;
            interactionHandler.RotationSpeed = rotationSpeed;
            interactionHandler.ScalingSpeed = scalingSpeed;
        }

        private void Start()
        {
            if (autoLoadOnStart && !string.IsNullOrEmpty(defaultModelURL))
            {
                LoadModel(defaultModelURL);
            }
        }

        /// <summary>
        /// Charge un modèle 3D depuis une URL.
        /// </summary>
        public void LoadModel(string modelURL)
        {
            if (IsLoading)
            {
                Debug.LogWarning("[Model3DViewer] Un modèle est déjà en cours de chargement.");
                return;
            }

            if (string.IsNullOrEmpty(modelURL))
            {
                Debug.LogError("[Model3DViewer] URL du modèle invalide.");
                OnModelLoadError?.Invoke("URL du modèle invalide");
                return;
            }

            StartCoroutine(LoadModelCoroutine(modelURL));
        }

        /// <summary>
        /// Charge un modèle 3D depuis les informations de Building Scan.
        /// </summary>
        public void LoadModel(BuildingScanModel modelInfo)
        {
            if (modelInfo == null)
            {
                Debug.LogError("[Model3DViewer] Informations du modèle invalides.");
                OnModelLoadError?.Invoke("Informations du modèle invalides");
                return;
            }

            // Sélection du format optimal selon la plateforme
            string modelURL = GetOptimalModelURL(modelInfo);
            
            if (string.IsNullOrEmpty(modelURL))
            {
                Debug.LogError("[Model3DViewer] Aucun format de modèle compatible trouvé.");
                OnModelLoadError?.Invoke("Format de modèle non supporté");
                return;
            }

            // Mise à jour des informations du modèle
            CurrentModelInfo = new Model3DInfo
            {
                Name = modelInfo.ScanSessionName,
                URL = modelURL,
                Format = GetModelFormat(modelURL),
                VertexCount = modelInfo.VertexCount,
                FaceCount = modelInfo.FaceCount,
                FileSizeMB = modelInfo.FileSizeMB,
                ProcessingAlgorithm = modelInfo.ProcessingAlgorithm
            };

            OnModelInfoUpdated?.Invoke(CurrentModelInfo);
            LoadModel(modelURL);
        }

        /// <summary>
        /// Coroutine de chargement du modèle 3D.
        /// </summary>
        private IEnumerator LoadModelCoroutine(string modelURL)
        {
            IsLoading = true;
            OnLoadingProgress?.Invoke(0f);

            Debug.Log($"[Model3DViewer] Chargement du modèle: {modelURL}");

            try
            {
                // Vérification du cache
                if (modelCache.ContainsKey(modelURL))
                {
                    Debug.Log("[Model3DViewer] Modèle trouvé dans le cache.");
                    SetCurrentModel(modelCache[modelURL]);
                    OnLoadingProgress?.Invoke(1f);
                    IsLoading = false;
                    yield break;
                }

                // Téléchargement du modèle
                yield return StartCoroutine(DownloadModel(modelURL));

                OnLoadingProgress?.Invoke(0.5f);

                // Chargement selon le format
                string fileExtension = Path.GetExtension(modelURL).ToLower();
                GameObject loadedModel = null;

                switch (fileExtension)
                {
                    case ".glb":
                    case ".gltf":
                        loadedModel = yield return StartCoroutine(LoadGLTFModel(modelURL));
                        break;
                    case ".usdz":
                        loadedModel = yield return StartCoroutine(LoadUSDZModel(modelURL));
                        break;
                    case ".obj":
                        loadedModel = yield return StartCoroutine(LoadOBJModel(modelURL));
                        break;
                    default:
                        throw new System.NotSupportedException($"Format de modèle non supporté: {fileExtension}");
                }

                OnLoadingProgress?.Invoke(0.8f);

                if (loadedModel != null)
                {
                    // Optimisation du modèle
                    yield return StartCoroutine(OptimizeModel(loadedModel));
                    
                    OnLoadingProgress?.Invoke(0.9f);

                    // Configuration du modèle
                    ConfigureModel(loadedModel);
                    
                    // Mise en cache
                    modelCache[modelURL] = loadedModel;
                    
                    // Activation du modèle
                    SetCurrentModel(loadedModel);
                    
                    OnLoadingProgress?.Invoke(1f);
                    OnModelLoaded?.Invoke(loadedModel);
                    
                    Debug.Log("[Model3DViewer] Modèle chargé avec succès.");
                }
                else
                {
                    throw new System.Exception("Échec du chargement du modèle");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[Model3DViewer] Erreur lors du chargement: {e.Message}");
                OnModelLoadError?.Invoke(e.Message);
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Télécharge le fichier du modèle 3D.
        /// </summary>
        private IEnumerator DownloadModel(string modelURL)
        {
            using (UnityWebRequest request = UnityWebRequest.Get(modelURL))
            {
                var operation = request.SendWebRequest();
                
                while (!operation.isDone)
                {
                    OnLoadingProgress?.Invoke(operation.progress * 0.3f);
                    yield return null;
                }

                if (request.result != UnityWebRequest.Result.Success)
                {
                    throw new System.Exception($"Erreur de téléchargement: {request.error}");
                }

                // Sauvegarde temporaire du fichier
                string tempPath = Path.Combine(Application.temporaryCachePath, Path.GetFileName(modelURL));
                File.WriteAllBytes(tempPath, request.downloadHandler.data);
                
                Debug.Log($"[Model3DViewer] Modèle téléchargé: {tempPath}");
            }
        }

        /// <summary>
        /// Charge un modèle GLTF/GLB.
        /// </summary>
        private IEnumerator LoadGLTFModel(string modelURL)
        {
            // Note: Nécessite un package GLTF comme GLTFUtility ou UnityGLTF
            Debug.Log("[Model3DViewer] Chargement du modèle GLTF/GLB...");
            
            // Implémentation placeholder - à remplacer par un vrai loader GLTF
            GameObject model = CreatePlaceholderModel("GLTF Model");
            yield return new WaitForSeconds(0.5f); // Simulation du temps de chargement
            
            return model;
        }

        /// <summary>
        /// Charge un modèle USDZ (iOS).
        /// </summary>
        private IEnumerator LoadUSDZModel(string modelURL)
        {
#if UNITY_IOS
            Debug.Log("[Model3DViewer] Chargement du modèle USDZ...");
            
            // Implémentation spécifique iOS pour USDZ
            GameObject model = CreatePlaceholderModel("USDZ Model");
            yield return new WaitForSeconds(0.5f);
            
            return model;
#else
            throw new System.NotSupportedException("USDZ supporté uniquement sur iOS");
#endif
        }

        /// <summary>
        /// Charge un modèle OBJ.
        /// </summary>
        private IEnumerator LoadOBJModel(string modelURL)
        {
            Debug.Log("[Model3DViewer] Chargement du modèle OBJ...");
            
            // Implémentation placeholder - à remplacer par un vrai loader OBJ
            GameObject model = CreatePlaceholderModel("OBJ Model");
            yield return new WaitForSeconds(0.5f);
            
            return model;
        }

        /// <summary>
        /// Crée un modèle placeholder pour les tests.
        /// </summary>
        private GameObject CreatePlaceholderModel(string name)
        {
            GameObject model = GameObject.CreatePrimitive(PrimitiveType.Cube);
            model.name = name;
            model.transform.localScale = Vector3.one * 2f;
            
            // Ajout de quelques détails visuels
            Renderer renderer = model.GetComponent<Renderer>();
            if (defaultMaterial != null)
            {
                renderer.material = defaultMaterial;
            }
            
            return model;
        }

        /// <summary>
        /// Optimise le modèle 3D pour la VR.
        /// </summary>
        private IEnumerator OptimizeModel(GameObject model)
        {
            if (optimizer != null)
            {
                yield return StartCoroutine(optimizer.OptimizeModel(model));
            }
            else
            {
                yield return null;
            }
        }

        /// <summary>
        /// Configure le modèle 3D pour la visualisation VR.
        /// </summary>
        private void ConfigureModel(GameObject model)
        {
            // Positionnement et mise à l'échelle
            model.transform.SetParent(modelContainer);
            model.transform.localPosition = Vector3.zero;
            model.transform.localRotation = Quaternion.identity;
            model.transform.localScale = defaultModelScale;

            // Configuration des colliders pour l'interaction
            if (model.GetComponent<Collider>() == null)
            {
                model.AddComponent<MeshCollider>();
            }

            // Configuration de l'éclairage
            ConfigureModelLighting(model);

            // Configuration des interactions
            if (interactionHandler != null)
            {
                interactionHandler.SetTargetModel(model);
            }
        }

        /// <summary>
        /// Configure l'éclairage du modèle.
        /// </summary>
        private void ConfigureModelLighting(GameObject model)
        {
            Renderer[] renderers = model.GetComponentsInChildren<Renderer>();
            
            foreach (Renderer renderer in renderers)
            {
                if (enableRealtimeLighting)
                {
                    renderer.shadowCastingMode = enableShadows ? 
                        UnityEngine.Rendering.ShadowCastingMode.On : 
                        UnityEngine.Rendering.ShadowCastingMode.Off;
                    
                    renderer.receiveShadows = enableShadows;
                }

                if (enableReflections)
                {
                    renderer.reflectionProbeUsage = UnityEngine.Rendering.ReflectionProbeUsage.BlendProbes;
                }
            }
        }

        /// <summary>
        /// Définit le modèle actuel.
        /// </summary>
        private void SetCurrentModel(GameObject model)
        {
            // Désactivation du modèle précédent
            if (CurrentModel != null && CurrentModel != model)
            {
                CurrentModel.SetActive(false);
            }

            CurrentModel = model;
            CurrentModel.SetActive(true);
            CurrentModel.transform.SetParent(modelContainer);
        }

        /// <summary>
        /// Change le mode de visualisation.
        /// </summary>
        public void SetViewMode(ViewMode mode)
        {
            if (CurrentModel == null) return;

            currentViewMode = mode;
            
            switch (mode)
            {
                case ViewMode.Realistic:
                    SetRealisticMode();
                    break;
                case ViewMode.Wireframe:
                    SetWireframeMode();
                    break;
                case ViewMode.XRay:
                    SetXRayMode();
                    break;
                case ViewMode.Sectioned:
                    SetSectionedMode();
                    break;
            }
        }

        /// <summary>
        /// Active le mode réaliste.
        /// </summary>
        private void SetRealisticMode()
        {
            Renderer[] renderers = CurrentModel.GetComponentsInChildren<Renderer>();
            foreach (Renderer renderer in renderers)
            {
                if (defaultMaterial != null)
                {
                    renderer.material = defaultMaterial;
                }
                renderer.enabled = true;
            }
            isWireframeMode = false;
        }

        /// <summary>
        /// Active le mode wireframe.
        /// </summary>
        private void SetWireframeMode()
        {
            Renderer[] renderers = CurrentModel.GetComponentsInChildren<Renderer>();
            foreach (Renderer renderer in renderers)
            {
                if (wireframeMaterial != null)
                {
                    renderer.material = wireframeMaterial;
                }
            }
            isWireframeMode = true;
        }

        /// <summary>
        /// Active le mode X-Ray.
        /// </summary>
        private void SetXRayMode()
        {
            // Implémentation du mode X-Ray (transparence)
            Renderer[] renderers = CurrentModel.GetComponentsInChildren<Renderer>();
            foreach (Renderer renderer in renderers)
            {
                Material material = renderer.material;
                material.color = new Color(material.color.r, material.color.g, material.color.b, 0.3f);
            }
        }

        /// <summary>
        /// Active le mode sectionné.
        /// </summary>
        private void SetSectionedMode()
        {
            // Implémentation du mode sectionné (coupe du modèle)
            Debug.Log("[Model3DViewer] Mode sectionné activé.");
        }

        /// <summary>
        /// Met à l'échelle le modèle.
        /// </summary>
        public void ScaleModel(float scaleFactor)
        {
            if (CurrentModel == null) return;

            currentScale = scaleFactor;
            CurrentModel.transform.localScale = defaultModelScale * scaleFactor;
        }

        /// <summary>
        /// Fait tourner le modèle.
        /// </summary>
        public void RotateModel(Vector3 rotation)
        {
            if (CurrentModel == null) return;

            CurrentModel.transform.Rotate(rotation * rotationSpeed * Time.deltaTime);
        }

        /// <summary>
        /// Recentre le modèle.
        /// </summary>
        public void CenterModel()
        {
            if (CurrentModel == null) return;

            CurrentModel.transform.localPosition = Vector3.zero;
            CurrentModel.transform.localRotation = Quaternion.identity;
            CurrentModel.transform.localScale = defaultModelScale;
            currentScale = 1f;
        }

        /// <summary>
        /// Obtient l'URL optimale du modèle selon la plateforme.
        /// </summary>
        private string GetOptimalModelURL(BuildingScanModel modelInfo)
        {
#if UNITY_IOS
            // Préférence USDZ sur iOS
            if (!string.IsNullOrEmpty(modelInfo.ModelFileUSDZ))
                return modelInfo.ModelFileUSDZ;
#endif
            
            // GLB en priorité pour la compatibilité
            if (!string.IsNullOrEmpty(modelInfo.ModelFileGLB))
                return modelInfo.ModelFileGLB;
                
            // OBJ en fallback
            if (!string.IsNullOrEmpty(modelInfo.ModelFileOBJ))
                return modelInfo.ModelFileOBJ;
                
            return null;
        }

        /// <summary>
        /// Détermine le format du modèle depuis l'URL.
        /// </summary>
        private string GetModelFormat(string url)
        {
            string extension = Path.GetExtension(url).ToLower();
            switch (extension)
            {
                case ".glb": return "GLB";
                case ".gltf": return "GLTF";
                case ".usdz": return "USDZ";
                case ".obj": return "OBJ";
                default: return "Unknown";
            }
        }

        /// <summary>
        /// Libère les ressources du modèle actuel.
        /// </summary>
        public void UnloadCurrentModel()
        {
            if (CurrentModel != null)
            {
                CurrentModel.SetActive(false);
                CurrentModel = null;
            }
        }

        /// <summary>
        /// Vide le cache des modèles.
        /// </summary>
        public void ClearModelCache()
        {
            foreach (var model in modelCache.Values)
            {
                if (model != null && model != CurrentModel)
                {
                    DestroyImmediate(model);
                }
            }
            
            modelCache.Clear();
            modelInfoCache.Clear();
        }

        private void OnDestroy()
        {
            ClearModelCache();
        }
    }

    /// <summary>
    /// Informations sur un modèle 3D chargé.
    /// </summary>
    [System.Serializable]
    public class Model3DInfo
    {
        public string Name;
        public string URL;
        public string Format;
        public int VertexCount;
        public int FaceCount;
        public float FileSizeMB;
        public string ProcessingAlgorithm;
    }

    /// <summary>
    /// Données d'un modèle Building Scan.
    /// </summary>
    [System.Serializable]
    public class BuildingScanModel
    {
        public string ScanSessionName;
        public string ModelFileOBJ;
        public string ModelFileGLB;
        public string ModelFileUSDZ;
        public int VertexCount;
        public int FaceCount;
        public float FileSizeMB;
        public string ProcessingAlgorithm;
    }
}
