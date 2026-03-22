using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR;
using System.IO;

namespace BuildingScanVR.Core
{
    /// <summary>
    /// Système d'outils d'analyse et d'annotation pour Building Scan VR.
    /// Permet de prendre des mesures, ajouter des annotations et analyser les modèles 3D.
    /// </summary>
    public class VRAnalysisTools : MonoBehaviour
    {
        [Header("Tool Settings")]
        [SerializeField] private AnalysisTool defaultTool = AnalysisTool.Measure;
        [SerializeField] private bool enableToolSwitching = true;
        [SerializeField] private bool enableUndoRedo = true;
        [SerializeField] private int maxUndoSteps = 50;

        [Header("Measurement Settings")]
        [SerializeField] private Material measurementLineMaterial;
        [SerializeField] private Material measurementPointMaterial;
        [SerializeField] private Color measurementColor = Color.yellow;
        [SerializeField] private float measurementLineWidth = 0.01f;
        [SerializeField] private float measurementPointSize = 0.02f;
        [SerializeField] private bool showMeasurementLabels = true;

        [Header("Annotation Settings")]
        [SerializeField] private GameObject annotationPrefab;
        [SerializeField] private Material annotationMaterial;
        [SerializeField] private Color annotationColor = Color.cyan;
        [SerializeField] private float annotationSize = 0.1f;
        [SerializeField] private bool enableVoiceAnnotations = true;
        [SerializeField] private float maxRecordingDuration = 60f;

        [Header("Analysis Settings")]
        [SerializeField] private bool enableSurfaceAnalysis = true;
        [SerializeField] private bool enableVolumeAnalysis = true;
        [SerializeField] private bool enableStructuralAnalysis = false;
        [SerializeField] private LayerMask analysisLayerMask = -1;

        [Header("UI Settings")]
        [SerializeField] private Canvas toolsUI;
        [SerializeField] private bool showToolTips = true;
        [SerializeField] private bool showMeasurementValues = true;
        [SerializeField] private UnityEngine.UI.Text measurementDisplay;

        // Événements
        public System.Action<AnalysisTool> OnToolChanged;
        public System.Action<MeasurementResult> OnMeasurementCompleted;
        public System.Action<AnnotationData> OnAnnotationCreated;
        public System.Action<AnalysisResult> OnAnalysisCompleted;
        public System.Action<string> OnToolError;

        // Propriétés publiques
        public AnalysisTool CurrentTool { get; private set; }
        public bool IsToolActive { get; private set; }
        public List<MeasurementResult> Measurements { get; private set; }
        public List<AnnotationData> Annotations { get; private set; }

        // Références
        private Camera vrCamera;
        private Transform vrRig;
        private AudioSource audioSource;
        private VRManager vrManager;

        // État des outils
        private List<Vector3> measurementPoints = new List<Vector3>();
        private List<GameObject> measurementObjects = new List<GameObject>();
        private List<GameObject> annotationObjects = new List<GameObject>();
        private Stack<ToolAction> undoStack = new Stack<ToolAction>();
        private Stack<ToolAction> redoStack = new Stack<ToolAction>();

        // Contrôleurs VR
        private InputDevice leftController;
        private InputDevice rightController;
        private bool isRecording = false;
        private AudioClip currentRecording;

        public enum AnalysisTool
        {
            Measure,        // Outil de mesure
            Annotate,       // Outil d'annotation
            Surface,        // Analyse de surface
            Volume,         // Analyse de volume
            Structural,     // Analyse structurelle
            Screenshot,     // Capture d'écran
            Pointer         // Pointeur laser
        }

        private void Awake()
        {
            // Recherche des composants
            vrCamera = Camera.main ?? FindObjectOfType<Camera>();
            vrRig = transform.root;
            vrManager = FindObjectOfType<VRManager>();

            // Configuration de l'audio
            audioSource = gameObject.AddComponent<AudioSource>();
            audioSource.playOnAwake = false;
            audioSource.spatialBlend = 0f;

            // Initialisation des listes
            Measurements = new List<MeasurementResult>();
            Annotations = new List<AnnotationData>();

            // Configuration de l'outil par défaut
            CurrentTool = defaultTool;
        }

        private void Start()
        {
            // Configuration des matériaux par défaut
            CreateDefaultMaterials();
            
            // Activation de l'outil par défaut
            SetTool(defaultTool);
        }

        private void Update()
        {
            if (vrManager != null && vrManager.IsVRActive)
            {
                UpdateControllerInput();
                UpdateToolBehavior();
            }
        }

        /// <summary>
        /// Crée les matériaux par défaut si non assignés.
        /// </summary>
        private void CreateDefaultMaterials()
        {
            if (measurementLineMaterial == null)
            {
                measurementLineMaterial = new Material(Shader.Find("Unlit/Color"));
                measurementLineMaterial.color = measurementColor;
            }

            if (measurementPointMaterial == null)
            {
                measurementPointMaterial = new Material(Shader.Find("Standard"));
                measurementPointMaterial.color = measurementColor;
                measurementPointMaterial.SetFloat("_Metallic", 0.5f);
                measurementPointMaterial.SetFloat("_Smoothness", 0.8f);
            }

            if (annotationMaterial == null)
            {
                annotationMaterial = new Material(Shader.Find("Standard"));
                annotationMaterial.color = annotationColor;
                annotationMaterial.SetFloat("_Metallic", 0.3f);
                annotationMaterial.SetFloat("_Smoothness", 0.6f);
            }
        }

        /// <summary>
        /// Met à jour les entrées des contrôleurs VR.
        /// </summary>
        private void UpdateControllerInput()
        {
            // Mise à jour des références des contrôleurs
            if (!leftController.isValid)
                leftController = InputDevices.GetDeviceAtXRNode(XRNode.LeftHand);
            if (!rightController.isValid)
                rightController = InputDevices.GetDeviceAtXRNode(XRNode.RightHand);

            // Gestion des entrées selon l'outil actuel
            ProcessToolInput(leftController, "Left");
            ProcessToolInput(rightController, "Right");

            // Changement d'outil via les boutons
            if (enableToolSwitching)
            {
                CheckToolSwitching();
            }
        }

        /// <summary>
        /// Traite les entrées pour les outils.
        /// </summary>
        private void ProcessToolInput(InputDevice controller, string handedness)
        {
            if (!controller.isValid || !IsToolActive) return;

            // Bouton trigger pour l'action principale
            if (controller.TryGetFeatureValue(CommonUsages.triggerButton, out bool triggerPressed))
            {
                if (triggerPressed)
                {
                    OnTriggerPressed(controller, handedness);
                }
                else
                {
                    OnTriggerReleased(controller, handedness);
                }
            }

            // Bouton grip pour l'action secondaire
            if (controller.TryGetFeatureValue(CommonUsages.gripButton, out bool gripPressed))
            {
                if (gripPressed)
                {
                    OnGripPressed(controller, handedness);
                }
            }
        }

        /// <summary>
        /// Vérifie les changements d'outil via les contrôleurs.
        /// </summary>
        private void CheckToolSwitching()
        {
            // Changement d'outil via le joystick droit
            if (rightController.TryGetFeatureValue(CommonUsages.primary2DAxis, out Vector2 joystickValue))
            {
                if (joystickValue.magnitude > 0.8f)
                {
                    float angle = Mathf.Atan2(joystickValue.y, joystickValue.x) * Mathf.Rad2Deg;
                    AnalysisTool newTool = GetToolFromAngle(angle);
                    
                    if (newTool != CurrentTool)
                    {
                        SetTool(newTool);
                    }
                }
            }
        }

        /// <summary>
        /// Obtient l'outil correspondant à un angle de joystick.
        /// </summary>
        private AnalysisTool GetToolFromAngle(float angle)
        {
            // Répartition des outils sur 360 degrés
            angle = (angle + 360f) % 360f;
            
            if (angle < 60f || angle >= 300f) return AnalysisTool.Measure;
            if (angle >= 60f && angle < 120f) return AnalysisTool.Annotate;
            if (angle >= 120f && angle < 180f) return AnalysisTool.Surface;
            if (angle >= 180f && angle < 240f) return AnalysisTool.Volume;
            if (angle >= 240f && angle < 300f) return AnalysisTool.Screenshot;
            
            return AnalysisTool.Pointer;
        }

        /// <summary>
        /// Met à jour le comportement de l'outil actuel.
        /// </summary>
        private void UpdateToolBehavior()
        {
            switch (CurrentTool)
            {
                case AnalysisTool.Measure:
                    UpdateMeasurementTool();
                    break;
                case AnalysisTool.Annotate:
                    UpdateAnnotationTool();
                    break;
                case AnalysisTool.Pointer:
                    UpdatePointerTool();
                    break;
            }
        }

        /// <summary>
        /// Change l'outil actuel.
        /// </summary>
        public void SetTool(AnalysisTool tool)
        {
            if (CurrentTool == tool) return;

            // Nettoyage de l'outil précédent
            CleanupCurrentTool();

            CurrentTool = tool;
            IsToolActive = true;

            // Initialisation du nouvel outil
            InitializeTool(tool);

            OnToolChanged?.Invoke(tool);
            Debug.Log($"[VRAnalysisTools] Outil changé: {tool}");
        }

        /// <summary>
        /// Nettoie l'outil actuel.
        /// </summary>
        private void CleanupCurrentTool()
        {
            // Nettoyage spécifique selon l'outil
            switch (CurrentTool)
            {
                case AnalysisTool.Measure:
                    ClearTemporaryMeasurements();
                    break;
                case AnalysisTool.Annotate:
                    StopRecording();
                    break;
            }
        }

        /// <summary>
        /// Initialise un outil.
        /// </summary>
        private void InitializeTool(AnalysisTool tool)
        {
            switch (tool)
            {
                case AnalysisTool.Measure:
                    Debug.Log("[VRAnalysisTools] Outil de mesure activé.");
                    break;
                case AnalysisTool.Annotate:
                    Debug.Log("[VRAnalysisTools] Outil d'annotation activé.");
                    break;
                case AnalysisTool.Surface:
                    Debug.Log("[VRAnalysisTools] Outil d'analyse de surface activé.");
                    break;
                case AnalysisTool.Volume:
                    Debug.Log("[VRAnalysisTools] Outil d'analyse de volume activé.");
                    break;
                case AnalysisTool.Screenshot:
                    Debug.Log("[VRAnalysisTools] Outil de capture activé.");
                    break;
                case AnalysisTool.Pointer:
                    Debug.Log("[VRAnalysisTools] Pointeur laser activé.");
                    break;
            }
        }

        /// <summary>
        /// Gestion du trigger pressé.
        /// </summary>
        private void OnTriggerPressed(InputDevice controller, string handedness)
        {
            switch (CurrentTool)
            {
                case AnalysisTool.Measure:
                    StartMeasurement(controller);
                    break;
                case AnalysisTool.Annotate:
                    CreateAnnotation(controller);
                    break;
                case AnalysisTool.Surface:
                    AnalyzeSurface(controller);
                    break;
                case AnalysisTool.Volume:
                    AnalyzeVolume(controller);
                    break;
                case AnalysisTool.Screenshot:
                    TakeScreenshot();
                    break;
            }
        }

        /// <summary>
        /// Gestion du trigger relâché.
        /// </summary>
        private void OnTriggerReleased(InputDevice controller, string handedness)
        {
            switch (CurrentTool)
            {
                case AnalysisTool.Measure:
                    CompleteMeasurement();
                    break;
                case AnalysisTool.Annotate:
                    StopRecording();
                    break;
            }
        }

        /// <summary>
        /// Gestion du grip pressé.
        /// </summary>
        private void OnGripPressed(InputDevice controller, string handedness)
        {
            if (enableUndoRedo)
            {
                UndoLastAction();
            }
        }

        /// <summary>
        /// Met à jour l'outil de mesure.
        /// </summary>
        private void UpdateMeasurementTool()
        {
            // Affichage du pointeur de mesure
            if (rightController.isValid)
            {
                if (rightController.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 position) &&
                    rightController.TryGetFeatureValue(CommonUsages.deviceRotation, out Quaternion rotation))
                {
                    // Raycast pour trouver le point de mesure
                    Ray ray = new Ray(position, rotation * Vector3.forward);
                    if (Physics.Raycast(ray, out RaycastHit hit, 10f, analysisLayerMask))
                    {
                        // Affichage du point de mesure potentiel
                        ShowMeasurementPreview(hit.point);
                    }
                }
            }
        }

        /// <summary>
        /// Démarre une mesure.
        /// </summary>
        private void StartMeasurement(InputDevice controller)
        {
            if (controller.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 position) &&
                controller.TryGetFeatureValue(CommonUsages.deviceRotation, out Quaternion rotation))
            {
                Ray ray = new Ray(position, rotation * Vector3.forward);
                if (Physics.Raycast(ray, out RaycastHit hit, 10f, analysisLayerMask))
                {
                    measurementPoints.Add(hit.point);
                    CreateMeasurementPoint(hit.point);
                    
                    Debug.Log($"[VRAnalysisTools] Point de mesure ajouté: {hit.point}");
                }
            }
        }

        /// <summary>
        /// Complète une mesure.
        /// </summary>
        private void CompleteMeasurement()
        {
            if (measurementPoints.Count >= 2)
            {
                // Calcul de la distance
                Vector3 start = measurementPoints[measurementPoints.Count - 2];
                Vector3 end = measurementPoints[measurementPoints.Count - 1];
                float distance = Vector3.Distance(start, end);

                // Création de la ligne de mesure
                CreateMeasurementLine(start, end, distance);

                // Enregistrement du résultat
                MeasurementResult result = new MeasurementResult
                {
                    StartPoint = start,
                    EndPoint = end,
                    Distance = distance,
                    Timestamp = System.DateTime.Now,
                    Type = MeasurementType.Distance
                };

                Measurements.Add(result);
                OnMeasurementCompleted?.Invoke(result);

                // Affichage du résultat
                if (showMeasurementValues && measurementDisplay != null)
                {
                    measurementDisplay.text = $"Distance: {distance:F3}m";
                }

                Debug.Log($"[VRAnalysisTools] Mesure complétée: {distance:F3}m");
            }
        }

        /// <summary>
        /// Crée un point de mesure visuel.
        /// </summary>
        private void CreateMeasurementPoint(Vector3 position)
        {
            GameObject point = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            point.name = "MeasurementPoint";
            point.transform.position = position;
            point.transform.localScale = Vector3.one * measurementPointSize;
            
            Renderer renderer = point.GetComponent<Renderer>();
            renderer.material = measurementPointMaterial;
            
            measurementObjects.Add(point);
        }

        /// <summary>
        /// Crée une ligne de mesure visuelle.
        /// </summary>
        private void CreateMeasurementLine(Vector3 start, Vector3 end, float distance)
        {
            GameObject lineObj = new GameObject("MeasurementLine");
            LineRenderer line = lineObj.AddComponent<LineRenderer>();
            
            line.material = measurementLineMaterial;
            line.startWidth = measurementLineWidth;
            line.endWidth = measurementLineWidth;
            line.positionCount = 2;
            line.SetPosition(0, start);
            line.SetPosition(1, end);
            line.useWorldSpace = true;

            // Ajout du label de distance
            if (showMeasurementLabels)
            {
                CreateMeasurementLabel(lineObj, Vector3.Lerp(start, end, 0.5f), $"{distance:F3}m");
            }

            measurementObjects.Add(lineObj);
        }

        /// <summary>
        /// Crée un label de mesure.
        /// </summary>
        private void CreateMeasurementLabel(GameObject parent, Vector3 position, string text)
        {
            GameObject labelObj = new GameObject("MeasurementLabel");
            labelObj.transform.SetParent(parent.transform);
            labelObj.transform.position = position;

            Canvas canvas = labelObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;
            canvas.worldCamera = vrCamera;

            UnityEngine.UI.Text label = labelObj.AddComponent<UnityEngine.UI.Text>();
            label.text = text;
            label.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            label.fontSize = 16;
            label.color = measurementColor;
            label.alignment = TextAnchor.MiddleCenter;

            RectTransform rectTransform = labelObj.GetComponent<RectTransform>();
            rectTransform.sizeDelta = new Vector2(100, 30);
        }

        /// <summary>
        /// Affiche l'aperçu de mesure.
        /// </summary>
        private void ShowMeasurementPreview(Vector3 point)
        {
            // Implémentation de l'aperçu de mesure
        }

        /// <summary>
        /// Met à jour l'outil d'annotation.
        /// </summary>
        private void UpdateAnnotationTool()
        {
            // Logique de l'outil d'annotation
        }

        /// <summary>
        /// Crée une annotation.
        /// </summary>
        private void CreateAnnotation(InputDevice controller)
        {
            if (controller.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 position) &&
                controller.TryGetFeatureValue(CommonUsages.deviceRotation, out Quaternion rotation))
            {
                Ray ray = new Ray(position, rotation * Vector3.forward);
                if (Physics.Raycast(ray, out RaycastHit hit, 10f, analysisLayerMask))
                {
                    // Création de l'annotation visuelle
                    GameObject annotation = CreateAnnotationObject(hit.point, hit.normal);
                    
                    // Démarrage de l'enregistrement vocal si activé
                    if (enableVoiceAnnotations)
                    {
                        StartVoiceRecording();
                    }

                    // Enregistrement des données d'annotation
                    AnnotationData data = new AnnotationData
                    {
                        Position = hit.point,
                        Normal = hit.normal,
                        Timestamp = System.DateTime.Now,
                        Type = AnnotationType.Voice,
                        GameObject = annotation
                    };

                    Annotations.Add(data);
                    OnAnnotationCreated?.Invoke(data);

                    Debug.Log($"[VRAnalysisTools] Annotation créée à: {hit.point}");
                }
            }
        }

        /// <summary>
        /// Crée un objet d'annotation visuel.
        /// </summary>
        private GameObject CreateAnnotationObject(Vector3 position, Vector3 normal)
        {
            GameObject annotation;
            
            if (annotationPrefab != null)
            {
                annotation = Instantiate(annotationPrefab);
            }
            else
            {
                annotation = GameObject.CreatePrimitive(PrimitiveType.Cube);
                annotation.transform.localScale = Vector3.one * annotationSize;
                
                Renderer renderer = annotation.GetComponent<Renderer>();
                renderer.material = annotationMaterial;
            }

            annotation.name = "Annotation";
            annotation.transform.position = position + normal * annotationSize * 0.5f;
            annotation.transform.up = normal;

            annotationObjects.Add(annotation);
            return annotation;
        }

        /// <summary>
        /// Démarre l'enregistrement vocal.
        /// </summary>
        private void StartVoiceRecording()
        {
            if (isRecording) return;

            if (Microphone.devices.Length > 0)
            {
                isRecording = true;
                currentRecording = Microphone.Start(null, false, (int)maxRecordingDuration, 44100);
                Debug.Log("[VRAnalysisTools] Enregistrement vocal démarré.");
            }
            else
            {
                Debug.LogWarning("[VRAnalysisTools] Aucun microphone détecté.");
            }
        }

        /// <summary>
        /// Arrête l'enregistrement vocal.
        /// </summary>
        private void StopRecording()
        {
            if (!isRecording) return;

            Microphone.End(null);
            isRecording = false;
            
            Debug.Log("[VRAnalysisTools] Enregistrement vocal arrêté.");
        }

        /// <summary>
        /// Met à jour l'outil pointeur.
        /// </summary>
        private void UpdatePointerTool()
        {
            // Logique du pointeur laser
        }

        /// <summary>
        /// Analyse une surface.
        /// </summary>
        private void AnalyzeSurface(InputDevice controller)
        {
            if (controller.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 position) &&
                controller.TryGetFeatureValue(CommonUsages.deviceRotation, out Quaternion rotation))
            {
                Ray ray = new Ray(position, rotation * Vector3.forward);
                if (Physics.Raycast(ray, out RaycastHit hit, 10f, analysisLayerMask))
                {
                    // Analyse de la surface
                    AnalysisResult result = PerformSurfaceAnalysis(hit);
                    OnAnalysisCompleted?.Invoke(result);
                    
                    Debug.Log($"[VRAnalysisTools] Analyse de surface: {result.Description}");
                }
            }
        }

        /// <summary>
        /// Effectue une analyse de surface.
        /// </summary>
        private AnalysisResult PerformSurfaceAnalysis(RaycastHit hit)
        {
            return new AnalysisResult
            {
                Type = AnalysisType.Surface,
                Position = hit.point,
                Description = $"Surface normale: {hit.normal}",
                Value = Vector3.Angle(hit.normal, Vector3.up),
                Timestamp = System.DateTime.Now
            };
        }

        /// <summary>
        /// Analyse un volume.
        /// </summary>
        private void AnalyzeVolume(InputDevice controller)
        {
            Debug.Log("[VRAnalysisTools] Analyse de volume démarrée.");
            // Implémentation de l'analyse de volume
        }

        /// <summary>
        /// Prend une capture d'écran VR.
        /// </summary>
        private void TakeScreenshot()
        {
            StartCoroutine(CaptureScreenshot());
        }

        /// <summary>
        /// Coroutine de capture d'écran.
        /// </summary>
        private IEnumerator CaptureScreenshot()
        {
            yield return new WaitForEndOfFrame();

            RenderTexture renderTexture = new RenderTexture(1920, 1080, 24);
            vrCamera.targetTexture = renderTexture;
            vrCamera.Render();

            RenderTexture.active = renderTexture;
            Texture2D screenshot = new Texture2D(1920, 1080, TextureFormat.RGB24, false);
            screenshot.ReadPixels(new Rect(0, 0, 1920, 1080), 0, 0);
            screenshot.Apply();

            vrCamera.targetTexture = null;
            RenderTexture.active = null;

            // Sauvegarde de la capture
            byte[] data = screenshot.EncodeToPNG();
            string filename = $"BuildingScanVR_Screenshot_{System.DateTime.Now:yyyyMMdd_HHmmss}.png";
            string path = Path.Combine(Application.persistentDataPath, filename);
            File.WriteAllBytes(path, data);

            Debug.Log($"[VRAnalysisTools] Capture sauvegardée: {path}");

            DestroyImmediate(screenshot);
            DestroyImmediate(renderTexture);
        }

        /// <summary>
        /// Annule la dernière action.
        /// </summary>
        public void UndoLastAction()
        {
            if (undoStack.Count > 0)
            {
                ToolAction action = undoStack.Pop();
                action.Undo();
                redoStack.Push(action);
                
                Debug.Log("[VRAnalysisTools] Action annulée.");
            }
        }

        /// <summary>
        /// Refait la dernière action annulée.
        /// </summary>
        public void RedoLastAction()
        {
            if (redoStack.Count > 0)
            {
                ToolAction action = redoStack.Pop();
                action.Redo();
                undoStack.Push(action);
                
                Debug.Log("[VRAnalysisTools] Action refaite.");
            }
        }

        /// <summary>
        /// Efface les mesures temporaires.
        /// </summary>
        private void ClearTemporaryMeasurements()
        {
            measurementPoints.Clear();
        }

        /// <summary>
        /// Efface toutes les mesures.
        /// </summary>
        public void ClearAllMeasurements()
        {
            foreach (GameObject obj in measurementObjects)
            {
                if (obj != null)
                {
                    DestroyImmediate(obj);
                }
            }
            
            measurementObjects.Clear();
            Measurements.Clear();
            measurementPoints.Clear();
        }

        /// <summary>
        /// Efface toutes les annotations.
        /// </summary>
        public void ClearAllAnnotations()
        {
            foreach (GameObject obj in annotationObjects)
            {
                if (obj != null)
                {
                    DestroyImmediate(obj);
                }
            }
            
            annotationObjects.Clear();
            Annotations.Clear();
        }

        private void OnDestroy()
        {
            ClearAllMeasurements();
            ClearAllAnnotations();
        }
    }

    /// <summary>
    /// Résultat d'une mesure.
    /// </summary>
    [System.Serializable]
    public class MeasurementResult
    {
        public Vector3 StartPoint;
        public Vector3 EndPoint;
        public float Distance;
        public System.DateTime Timestamp;
        public MeasurementType Type;
    }

    /// <summary>
    /// Données d'annotation.
    /// </summary>
    [System.Serializable]
    public class AnnotationData
    {
        public Vector3 Position;
        public Vector3 Normal;
        public string Text;
        public AudioClip VoiceClip;
        public System.DateTime Timestamp;
        public AnnotationType Type;
        public GameObject GameObject;
    }

    /// <summary>
    /// Résultat d'analyse.
    /// </summary>
    [System.Serializable]
    public class AnalysisResult
    {
        public AnalysisType Type;
        public Vector3 Position;
        public string Description;
        public float Value;
        public System.DateTime Timestamp;
    }

    /// <summary>
    /// Action d'outil pour l'undo/redo.
    /// </summary>
    public abstract class ToolAction
    {
        public abstract void Undo();
        public abstract void Redo();
    }

    public enum MeasurementType
    {
        Distance,
        Area,
        Volume,
        Angle
    }

    public enum AnnotationType
    {
        Text,
        Voice,
        Image,
        Mixed
    }

    public enum AnalysisType
    {
        Surface,
        Volume,
        Structural,
        Material
    }
}
