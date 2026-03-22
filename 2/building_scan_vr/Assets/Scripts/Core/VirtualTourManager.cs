using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;

namespace BuildingScanVR.Core
{
    /// <summary>
    /// Gestionnaire de visites virtuelles pour Building Scan VR.
    /// Permet de créer des parcours guidés ou libres dans les modèles 3D.
    /// </summary>
    public class VirtualTourManager : MonoBehaviour
    {
        [Header("Tour Settings")]
        [SerializeField] private bool autoStartTour = false;
        [SerializeField] private TourMode defaultTourMode = TourMode.Guided;
        [SerializeField] private float waypointTransitionDuration = 2f;
        [SerializeField] private AnimationCurve transitionCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);

        [Header("Waypoint Settings")]
        [SerializeField] private GameObject waypointPrefab;
        [SerializeField] private float waypointHeight = 1.8f; // Hauteur des yeux
        [SerializeField] private float waypointRadius = 0.5f;
        [SerializeField] private Color waypointColor = Color.blue;
        [SerializeField] private Color activeWaypointColor = Color.green;

        [Header("Navigation Settings")]
        [SerializeField] private bool enableFreeNavigation = true;
        [SerializeField] private bool enableTeleportation = true;
        [SerializeField] private float maxNavigationDistance = 50f;
        [SerializeField] private LayerMask navigationLayerMask = -1;

        [Header("Audio Settings")]
        [SerializeField] private AudioMixerGroup audioMixerGroup;
        [SerializeField] private AudioClip waypointReachedSound;
        [SerializeField] private AudioClip tourStartSound;
        [SerializeField] private AudioClip tourEndSound;
        [SerializeField] private float audioVolume = 0.7f;

        [Header("UI Settings")]
        [SerializeField] private bool showWaypointLabels = true;
        [SerializeField] private bool showProgressIndicator = true;
        [SerializeField] private bool showNavigationHints = true;
        [SerializeField] private Canvas tourUI;

        // Événements
        public System.Action<TourWaypoint> OnWaypointReached;
        public System.Action<VirtualTour> OnTourStarted;
        public System.Action<VirtualTour> OnTourCompleted;
        public System.Action<TourMode> OnTourModeChanged;
        public System.Action<float> OnTourProgress;

        // Propriétés publiques
        public VirtualTour CurrentTour { get; private set; }
        public TourWaypoint CurrentWaypoint { get; private set; }
        public TourMode CurrentMode { get; private set; }
        public bool IsTourActive { get; private set; }
        public bool IsTransitioning { get; private set; }
        public float TourProgress { get; private set; }

        // Références
        private Transform vrRig;
        private Camera vrCamera;
        private AudioSource audioSource;
        private VRTeleportation teleportation;
        private Model3DViewer model3DViewer;

        // État de la visite
        private List<VirtualTour> availableTours = new List<VirtualTour>();
        private int currentWaypointIndex = 0;
        private Coroutine tourCoroutine;
        private List<GameObject> waypointObjects = new List<GameObject>();

        public enum TourMode
        {
            Guided,      // Visite guidée automatique
            SemiGuided,  // Visite guidée avec contrôle utilisateur
            Free         // Navigation libre
        }

        private void Awake()
        {
            // Recherche des composants
            vrCamera = Camera.main ?? FindObjectOfType<Camera>();
            vrRig = transform.root;
            teleportation = FindObjectOfType<VRTeleportation>();
            model3DViewer = FindObjectOfType<Model3DViewer>();

            // Configuration de l'audio
            audioSource = gameObject.AddComponent<AudioSource>();
            audioSource.playOnAwake = false;
            audioSource.volume = audioVolume;
            audioSource.spatialBlend = 0f; // Son 2D pour l'interface
            
            if (audioMixerGroup != null)
            {
                audioSource.outputAudioMixerGroup = audioMixerGroup;
            }

            // Configuration du mode par défaut
            CurrentMode = defaultTourMode;
        }

        private void Start()
        {
            // Création des visites par défaut
            CreateDefaultTours();

            if (autoStartTour && availableTours.Count > 0)
            {
                StartTour(availableTours[0]);
            }
        }

        /// <summary>
        /// Crée les visites virtuelles par défaut.
        /// </summary>
        private void CreateDefaultTours()
        {
            // Visite générale du modèle
            VirtualTour generalTour = new VirtualTour
            {
                Name = "Visite Générale",
                Description = "Découverte complète du modèle 3D",
                Duration = 300f, // 5 minutes
                Waypoints = new List<TourWaypoint>()
            };

            // Ajout de waypoints par défaut (à adapter selon le modèle)
            generalTour.Waypoints.Add(new TourWaypoint
            {
                Name = "Vue d'ensemble",
                Position = new Vector3(0, 2, 5),
                Rotation = Quaternion.LookRotation(Vector3.forward),
                Description = "Vue générale du bâtiment scanné",
                Duration = 10f,
                AudioClip = null
            });

            generalTour.Waypoints.Add(new TourWaypoint
            {
                Name = "Entrée principale",
                Position = new Vector3(2, 1.8f, 0),
                Rotation = Quaternion.LookRotation(Vector3.left),
                Description = "Entrée principale du bâtiment",
                Duration = 15f,
                AudioClip = null
            });

            generalTour.Waypoints.Add(new TourWaypoint
            {
                Name = "Zone centrale",
                Position = new Vector3(0, 1.8f, -2),
                Rotation = Quaternion.LookRotation(Vector3.forward),
                Description = "Espace central du bâtiment",
                Duration = 20f,
                AudioClip = null
            });

            availableTours.Add(generalTour);

            // Visite technique détaillée
            VirtualTour technicalTour = new VirtualTour
            {
                Name = "Visite Technique",
                Description = "Analyse technique des structures et installations",
                Duration = 600f, // 10 minutes
                Waypoints = new List<TourWaypoint>()
            };

            technicalTour.Waypoints.Add(new TourWaypoint
            {
                Name = "Structure porteuse",
                Position = new Vector3(-3, 1.8f, 0),
                Rotation = Quaternion.LookRotation(Vector3.right),
                Description = "Analyse de la structure porteuse",
                Duration = 30f,
                AudioClip = null
            });

            technicalTour.Waypoints.Add(new TourWaypoint
            {
                Name = "Installations techniques",
                Position = new Vector3(0, 3, 0),
                Rotation = Quaternion.LookRotation(Vector3.down),
                Description = "Vue des installations techniques",
                Duration = 25f,
                AudioClip = null
            });

            availableTours.Add(technicalTour);

            Debug.Log($"[VirtualTourManager] {availableTours.Count} visites créées.");
        }

        /// <summary>
        /// Démarre une visite virtuelle.
        /// </summary>
        public void StartTour(VirtualTour tour)
        {
            if (tour == null || tour.Waypoints.Count == 0)
            {
                Debug.LogError("[VirtualTourManager] Visite invalide ou sans waypoints.");
                return;
            }

            if (IsTourActive)
            {
                StopTour();
            }

            CurrentTour = tour;
            currentWaypointIndex = 0;
            TourProgress = 0f;
            IsTourActive = true;

            Debug.Log($"[VirtualTourManager] Démarrage de la visite: {tour.Name}");

            // Création des waypoints visuels
            CreateWaypointObjects();

            // Démarrage de la visite selon le mode
            switch (CurrentMode)
            {
                case TourMode.Guided:
                    tourCoroutine = StartCoroutine(GuidedTourCoroutine());
                    break;
                case TourMode.SemiGuided:
                    tourCoroutine = StartCoroutine(SemiGuidedTourCoroutine());
                    break;
                case TourMode.Free:
                    StartFreeTour();
                    break;
            }

            // Audio de démarrage
            if (tourStartSound != null)
            {
                audioSource.PlayOneShot(tourStartSound);
            }

            OnTourStarted?.Invoke(tour);
        }

        /// <summary>
        /// Arrête la visite en cours.
        /// </summary>
        public void StopTour()
        {
            if (!IsTourActive) return;

            Debug.Log("[VirtualTourManager] Arrêt de la visite.");

            IsTourActive = false;
            IsTransitioning = false;

            if (tourCoroutine != null)
            {
                StopCoroutine(tourCoroutine);
                tourCoroutine = null;
            }

            // Suppression des waypoints visuels
            DestroyWaypointObjects();

            // Audio de fin
            if (tourEndSound != null)
            {
                audioSource.PlayOneShot(tourEndSound);
            }

            CurrentTour = null;
            CurrentWaypoint = null;
            TourProgress = 0f;
        }

        /// <summary>
        /// Change le mode de visite.
        /// </summary>
        public void SetTourMode(TourMode mode)
        {
            if (CurrentMode == mode) return;

            TourMode previousMode = CurrentMode;
            CurrentMode = mode;

            Debug.Log($"[VirtualTourManager] Changement de mode: {previousMode} -> {mode}");

            // Redémarrage de la visite si active
            if (IsTourActive && CurrentTour != null)
            {
                VirtualTour currentTour = CurrentTour;
                StopTour();
                StartTour(currentTour);
            }

            OnTourModeChanged?.Invoke(mode);
        }

        /// <summary>
        /// Coroutine pour la visite guidée automatique.
        /// </summary>
        private IEnumerator GuidedTourCoroutine()
        {
            for (int i = 0; i < CurrentTour.Waypoints.Count; i++)
            {
                currentWaypointIndex = i;
                TourWaypoint waypoint = CurrentTour.Waypoints[i];
                
                yield return StartCoroutine(MoveToWaypoint(waypoint));
                yield return StartCoroutine(StayAtWaypoint(waypoint));
                
                // Mise à jour du progrès
                TourProgress = (float)(i + 1) / CurrentTour.Waypoints.Count;
                OnTourProgress?.Invoke(TourProgress);
            }

            // Fin de la visite
            OnTourCompleted?.Invoke(CurrentTour);
            StopTour();
        }

        /// <summary>
        /// Coroutine pour la visite semi-guidée.
        /// </summary>
        private IEnumerator SemiGuidedTourCoroutine()
        {
            // Affichage des waypoints et attente de l'interaction utilisateur
            while (currentWaypointIndex < CurrentTour.Waypoints.Count)
            {
                TourWaypoint waypoint = CurrentTour.Waypoints[currentWaypointIndex];
                HighlightWaypoint(currentWaypointIndex);
                
                // Attente que l'utilisateur se déplace vers le waypoint
                yield return StartCoroutine(WaitForWaypointReach(waypoint));
                
                // Présentation du waypoint
                yield return StartCoroutine(StayAtWaypoint(waypoint));
                
                currentWaypointIndex++;
                TourProgress = (float)currentWaypointIndex / CurrentTour.Waypoints.Count;
                OnTourProgress?.Invoke(TourProgress);
            }

            OnTourCompleted?.Invoke(CurrentTour);
            StopTour();
        }

        /// <summary>
        /// Démarre la visite libre.
        /// </summary>
        private void StartFreeTour()
        {
            // En mode libre, tous les waypoints sont visibles et accessibles
            for (int i = 0; i < waypointObjects.Count; i++)
            {
                waypointObjects[i].SetActive(true);
            }

            Debug.Log("[VirtualTourManager] Mode libre activé - explorez librement!");
        }

        /// <summary>
        /// Déplace la caméra vers un waypoint.
        /// </summary>
        private IEnumerator MoveToWaypoint(TourWaypoint waypoint)
        {
            IsTransitioning = true;
            
            Vector3 startPosition = vrRig.position;
            Quaternion startRotation = vrCamera.transform.rotation;
            
            Vector3 targetPosition = waypoint.Position;
            targetPosition.y = waypointHeight; // Ajustement de la hauteur
            
            Quaternion targetRotation = waypoint.Rotation;

            float elapsedTime = 0f;
            
            while (elapsedTime < waypointTransitionDuration)
            {
                elapsedTime += Time.deltaTime;
                float t = elapsedTime / waypointTransitionDuration;
                t = transitionCurve.Evaluate(t);

                // Interpolation de la position
                vrRig.position = Vector3.Lerp(startPosition, targetPosition, t);
                
                // Interpolation de la rotation
                vrCamera.transform.rotation = Quaternion.Lerp(startRotation, targetRotation, t);

                yield return null;
            }

            // Position finale
            vrRig.position = targetPosition;
            vrCamera.transform.rotation = targetRotation;
            
            IsTransitioning = false;
            CurrentWaypoint = waypoint;
            
            OnWaypointReached?.Invoke(waypoint);
            
            // Audio de waypoint atteint
            if (waypointReachedSound != null)
            {
                audioSource.PlayOneShot(waypointReachedSound);
            }
        }

        /// <summary>
        /// Reste au waypoint pendant la durée spécifiée.
        /// </summary>
        private IEnumerator StayAtWaypoint(TourWaypoint waypoint)
        {
            Debug.Log($"[VirtualTourManager] Waypoint atteint: {waypoint.Name}");
            
            // Lecture de l'audio du waypoint si disponible
            if (waypoint.AudioClip != null)
            {
                audioSource.PlayOneShot(waypoint.AudioClip);
            }

            // Affichage des informations du waypoint
            ShowWaypointInfo(waypoint);

            // Attente de la durée du waypoint
            yield return new WaitForSeconds(waypoint.Duration);

            // Masquage des informations
            HideWaypointInfo();
        }

        /// <summary>
        /// Attend que l'utilisateur atteigne un waypoint.
        /// </summary>
        private IEnumerator WaitForWaypointReach(TourWaypoint waypoint)
        {
            float detectionRadius = waypointRadius * 2f;
            
            while (Vector3.Distance(vrRig.position, waypoint.Position) > detectionRadius)
            {
                yield return new WaitForSeconds(0.1f);
            }
            
            CurrentWaypoint = waypoint;
            OnWaypointReached?.Invoke(waypoint);
        }

        /// <summary>
        /// Crée les objets visuels des waypoints.
        /// </summary>
        private void CreateWaypointObjects()
        {
            DestroyWaypointObjects(); // Nettoyage préalable

            for (int i = 0; i < CurrentTour.Waypoints.Count; i++)
            {
                TourWaypoint waypoint = CurrentTour.Waypoints[i];
                GameObject waypointObj = CreateWaypointObject(waypoint, i);
                waypointObjects.Add(waypointObj);
            }
        }

        /// <summary>
        /// Crée un objet waypoint visuel.
        /// </summary>
        private GameObject CreateWaypointObject(TourWaypoint waypoint, int index)
        {
            GameObject waypointObj;
            
            if (waypointPrefab != null)
            {
                waypointObj = Instantiate(waypointPrefab);
            }
            else
            {
                // Création d'un waypoint par défaut
                waypointObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                waypointObj.transform.localScale = Vector3.one * waypointRadius;
                
                Renderer renderer = waypointObj.GetComponent<Renderer>();
                Material material = new Material(Shader.Find("Standard"));
                material.color = waypointColor;
                material.SetFloat("_Mode", 3); // Transparent
                material.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
                material.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                material.SetInt("_ZWrite", 0);
                material.DisableKeyword("_ALPHATEST_ON");
                material.EnableKeyword("_ALPHABLEND_ON");
                material.DisableKeyword("_ALPHAPREMULTIPLY_ON");
                material.renderQueue = 3000;
                renderer.material = material;
            }

            waypointObj.name = $"Waypoint_{index}_{waypoint.Name}";
            waypointObj.transform.position = waypoint.Position;
            waypointObj.transform.rotation = waypoint.Rotation;

            // Ajout d'un label si activé
            if (showWaypointLabels)
            {
                CreateWaypointLabel(waypointObj, waypoint.Name, index + 1);
            }

            // Configuration de l'interaction
            WaypointInteraction interaction = waypointObj.AddComponent<WaypointInteraction>();
            interaction.Initialize(waypoint, index, this);

            return waypointObj;
        }

        /// <summary>
        /// Crée un label pour un waypoint.
        /// </summary>
        private void CreateWaypointLabel(GameObject waypointObj, string text, int number)
        {
            GameObject labelObj = new GameObject("WaypointLabel");
            labelObj.transform.SetParent(waypointObj.transform);
            labelObj.transform.localPosition = Vector3.up * 0.5f;

            Canvas canvas = labelObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;
            canvas.worldCamera = vrCamera;

            UnityEngine.UI.Text label = labelObj.AddComponent<UnityEngine.UI.Text>();
            label.text = $"{number}. {text}";
            label.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            label.fontSize = 24;
            label.color = Color.white;
            label.alignment = TextAnchor.MiddleCenter;

            RectTransform rectTransform = labelObj.GetComponent<RectTransform>();
            rectTransform.sizeDelta = new Vector2(200, 50);
        }

        /// <summary>
        /// Met en évidence un waypoint.
        /// </summary>
        private void HighlightWaypoint(int index)
        {
            if (index >= 0 && index < waypointObjects.Count)
            {
                Renderer renderer = waypointObjects[index].GetComponent<Renderer>();
                if (renderer != null)
                {
                    renderer.material.color = activeWaypointColor;
                }
            }
        }

        /// <summary>
        /// Supprime les objets waypoints.
        /// </summary>
        private void DestroyWaypointObjects()
        {
            foreach (GameObject obj in waypointObjects)
            {
                if (obj != null)
                {
                    DestroyImmediate(obj);
                }
            }
            waypointObjects.Clear();
        }

        /// <summary>
        /// Affiche les informations d'un waypoint.
        /// </summary>
        private void ShowWaypointInfo(TourWaypoint waypoint)
        {
            if (tourUI != null)
            {
                // Implémentation de l'affichage UI
                Debug.Log($"[VirtualTourManager] Affichage info: {waypoint.Description}");
            }
        }

        /// <summary>
        /// Masque les informations du waypoint.
        /// </summary>
        private void HideWaypointInfo()
        {
            if (tourUI != null)
            {
                // Implémentation du masquage UI
            }
        }

        /// <summary>
        /// Passe au waypoint suivant (mode semi-guidé).
        /// </summary>
        public void NextWaypoint()
        {
            if (CurrentMode == TourMode.SemiGuided && IsTourActive)
            {
                if (currentWaypointIndex < CurrentTour.Waypoints.Count - 1)
                {
                    currentWaypointIndex++;
                    TourWaypoint waypoint = CurrentTour.Waypoints[currentWaypointIndex];
                    StartCoroutine(MoveToWaypoint(waypoint));
                }
            }
        }

        /// <summary>
        /// Revient au waypoint précédent (mode semi-guidé).
        /// </summary>
        public void PreviousWaypoint()
        {
            if (CurrentMode == TourMode.SemiGuided && IsTourActive)
            {
                if (currentWaypointIndex > 0)
                {
                    currentWaypointIndex--;
                    TourWaypoint waypoint = CurrentTour.Waypoints[currentWaypointIndex];
                    StartCoroutine(MoveToWaypoint(waypoint));
                }
            }
        }

        /// <summary>
        /// Obtient la liste des visites disponibles.
        /// </summary>
        public List<VirtualTour> GetAvailableTours()
        {
            return new List<VirtualTour>(availableTours);
        }

        /// <summary>
        /// Ajoute une nouvelle visite.
        /// </summary>
        public void AddTour(VirtualTour tour)
        {
            if (tour != null && !availableTours.Contains(tour))
            {
                availableTours.Add(tour);
                Debug.Log($"[VirtualTourManager] Visite ajoutée: {tour.Name}");
            }
        }

        private void OnDestroy()
        {
            StopTour();
        }

        private void OnDrawGizmosSelected()
        {
            // Visualisation des waypoints dans l'éditeur
            if (CurrentTour != null)
            {
                Gizmos.color = waypointColor;
                for (int i = 0; i < CurrentTour.Waypoints.Count; i++)
                {
                    TourWaypoint waypoint = CurrentTour.Waypoints[i];
                    Gizmos.DrawWireSphere(waypoint.Position, waypointRadius);
                    
                    if (i < CurrentTour.Waypoints.Count - 1)
                    {
                        Gizmos.DrawLine(waypoint.Position, CurrentTour.Waypoints[i + 1].Position);
                    }
                }
            }
        }
    }

    /// <summary>
    /// Définition d'une visite virtuelle.
    /// </summary>
    [System.Serializable]
    public class VirtualTour
    {
        public string Name;
        public string Description;
        public float Duration;
        public List<TourWaypoint> Waypoints;
        public AudioClip IntroAudio;
        public AudioClip OutroAudio;
    }

    /// <summary>
    /// Définition d'un waypoint de visite.
    /// </summary>
    [System.Serializable]
    public class TourWaypoint
    {
        public string Name;
        public string Description;
        public Vector3 Position;
        public Quaternion Rotation;
        public float Duration;
        public AudioClip AudioClip;
        public string[] Tags;
    }

    /// <summary>
    /// Composant d'interaction avec les waypoints.
    /// </summary>
    public class WaypointInteraction : MonoBehaviour
    {
        private TourWaypoint waypoint;
        private int waypointIndex;
        private VirtualTourManager tourManager;

        public void Initialize(TourWaypoint wp, int index, VirtualTourManager manager)
        {
            waypoint = wp;
            waypointIndex = index;
            tourManager = manager;
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player") || other.name.Contains("VR"))
            {
                tourManager.OnWaypointReached?.Invoke(waypoint);
            }
        }
    }
}
