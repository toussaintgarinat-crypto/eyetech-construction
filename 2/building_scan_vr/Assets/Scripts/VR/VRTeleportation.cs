using System.Collections;
using UnityEngine;
using UnityEngine.XR;

namespace BuildingScanVR.VR
{
    /// <summary>
    /// Système de téléportation VR pour Building Scan VR.
    /// Permet aux utilisateurs de se déplacer dans l'environnement 3D de manière confortable.
    /// </summary>
    public class VRTeleportation : MonoBehaviour
    {
        [Header("Teleportation Settings")]
        [SerializeField] private LayerMask teleportLayerMask = -1;
        [SerializeField] private float maxTeleportDistance = 20f;
        [SerializeField] private float teleportationHeight = 0.1f;
        [SerializeField] private bool requireValidSurface = true;
        [SerializeField] private float maxSlopeAngle = 30f;

        [Header("Visual Feedback")]
        [SerializeField] private GameObject teleportMarkerPrefab;
        [SerializeField] private LineRenderer trajectoryLine;
        [SerializeField] private Material validTeleportMaterial;
        [SerializeField] private Material invalidTeleportMaterial;
        [SerializeField] private AnimationCurve trajectoryArc = AnimationCurve.Linear(0, 0, 1, 1);

        [Header("Comfort Settings")]
        [SerializeField] private bool enableFadeTransition = true;
        [SerializeField] private float fadeTransitionDuration = 0.3f;
        [SerializeField] private bool enableHapticFeedback = true;
        [SerializeField] private float hapticIntensity = 0.5f;

        [Header("Audio")]
        [SerializeField] private AudioClip teleportSound;
        [SerializeField] private AudioClip invalidTeleportSound;
        [SerializeField] private AudioSource audioSource;

        // Références
        private Transform vrRig;
        private Camera vrCamera;
        private VRManager vrManager;
        private GameObject currentTeleportMarker;
        private CanvasGroup fadeCanvas;

        // État de la téléportation
        private bool isTeleportationActive = false;
        private bool isValidTeleportTarget = false;
        private Vector3 teleportTarget;
        private Vector3 teleportNormal;

        // Contrôleurs VR
        private InputDevice leftController;
        private InputDevice rightController;

        // Paramètres de trajectoire
        private const int trajectoryResolution = 30;
        private const float trajectoryTimeStep = 0.1f;
        private const float gravity = -9.81f;

        private void Awake()
        {
            // Recherche des composants nécessaires
            vrManager = FindObjectOfType<VRManager>();
            vrCamera = Camera.main ?? FindObjectOfType<Camera>();
            vrRig = transform.root;

            // Configuration de la ligne de trajectoire
            if (trajectoryLine == null)
            {
                trajectoryLine = gameObject.AddComponent<LineRenderer>();
            }
            
            ConfigureTrajectoryLine();

            // Configuration de l'audio
            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }
            audioSource.playOnAwake = false;
            audioSource.spatialBlend = 0f; // Son 2D pour l'interface

            // Création du canvas de fade si nécessaire
            if (enableFadeTransition)
            {
                CreateFadeCanvas();
            }
        }

        private void Start()
        {
            // Abonnement aux événements VR Manager
            if (vrManager != null)
            {
                vrManager.OnVRInitialized += OnVRInitialized;
            }
        }

        private void Update()
        {
            if (vrManager != null && vrManager.IsVRActive)
            {
                UpdateControllerInput();
                
                if (isTeleportationActive)
                {
                    UpdateTeleportationPreview();
                }
            }
        }

        /// <summary>
        /// Configure la ligne de trajectoire visuelle.
        /// </summary>
        private void ConfigureTrajectoryLine()
        {
            trajectoryLine.positionCount = trajectoryResolution;
            trajectoryLine.startWidth = 0.02f;
            trajectoryLine.endWidth = 0.01f;
            trajectoryLine.useWorldSpace = true;
            trajectoryLine.enabled = false;
            
            // Matériau par défaut
            if (validTeleportMaterial != null)
            {
                trajectoryLine.material = validTeleportMaterial;
            }
        }

        /// <summary>
        /// Crée le canvas de fade pour les transitions.
        /// </summary>
        private void CreateFadeCanvas()
        {
            GameObject fadeObject = new GameObject("FadeCanvas");
            fadeObject.transform.SetParent(vrCamera.transform);
            fadeObject.transform.localPosition = Vector3.forward * 0.1f;
            fadeObject.transform.localRotation = Quaternion.identity;

            Canvas canvas = fadeObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;
            canvas.worldCamera = vrCamera;

            fadeCanvas = fadeObject.AddComponent<CanvasGroup>();
            fadeCanvas.alpha = 0f;
            fadeCanvas.blocksRaycasts = false;

            // Image de fade
            GameObject fadeImage = new GameObject("FadeImage");
            fadeImage.transform.SetParent(fadeObject.transform);
            
            UnityEngine.UI.Image image = fadeImage.AddComponent<UnityEngine.UI.Image>();
            image.color = Color.black;
            
            RectTransform rectTransform = fadeImage.GetComponent<RectTransform>();
            rectTransform.anchorMin = Vector2.zero;
            rectTransform.anchorMax = Vector2.one;
            rectTransform.sizeDelta = Vector2.zero;
            rectTransform.anchoredPosition = Vector2.zero;
        }

        /// <summary>
        /// Appelé quand le système VR est initialisé.
        /// </summary>
        private void OnVRInitialized()
        {
            Debug.Log("[VRTeleportation] Système de téléportation VR initialisé.");
        }

        /// <summary>
        /// Met à jour les entrées des contrôleurs pour la téléportation.
        /// </summary>
        private void UpdateControllerInput()
        {
            // Mise à jour des références des contrôleurs
            if (!leftController.isValid)
                leftController = InputDevices.GetDeviceAtXRNode(XRNode.LeftHand);
            if (!rightController.isValid)
                rightController = InputDevices.GetDeviceAtXRNode(XRNode.RightHand);

            // Vérification de l'activation de la téléportation (bouton trackpad/joystick)
            CheckTeleportationActivation(leftController, "Left");
            CheckTeleportationActivation(rightController, "Right");

            // Vérification de l'exécution de la téléportation (relâchement du bouton)
            CheckTeleportationExecution(leftController, "Left");
            CheckTeleportationExecution(rightController, "Right");
        }

        /// <summary>
        /// Vérifie l'activation de la téléportation pour un contrôleur.
        /// </summary>
        private void CheckTeleportationActivation(InputDevice controller, string handedness)
        {
            if (!controller.isValid) return;

            // Vérification du bouton trackpad ou joystick
            bool trackpadPressed = false;
            bool joystickPressed = false;

            controller.TryGetFeatureValue(CommonUsages.primary2DAxisClick, out trackpadPressed);
            controller.TryGetFeatureValue(CommonUsages.secondary2DAxisClick, out joystickPressed);

            if ((trackpadPressed || joystickPressed) && !isTeleportationActive)
            {
                StartTeleportationPreview(controller, handedness);
            }
        }

        /// <summary>
        /// Vérifie l'exécution de la téléportation pour un contrôleur.
        /// </summary>
        private void CheckTeleportationExecution(InputDevice controller, string handedness)
        {
            if (!controller.isValid || !isTeleportationActive) return;

            // Vérification du relâchement du bouton
            bool trackpadPressed = false;
            bool joystickPressed = false;

            controller.TryGetFeatureValue(CommonUsages.primary2DAxisClick, out trackpadPressed);
            controller.TryGetFeatureValue(CommonUsages.secondary2DAxisClick, out joystickPressed);

            if (!trackpadPressed && !joystickPressed)
            {
                ExecuteTeleportation();
            }
        }

        /// <summary>
        /// Démarre l'aperçu de téléportation.
        /// </summary>
        private void StartTeleportationPreview(InputDevice controller, string handedness)
        {
            isTeleportationActive = true;
            trajectoryLine.enabled = true;

            Debug.Log($"[VRTeleportation] Aperçu de téléportation démarré - {handedness}");
        }

        /// <summary>
        /// Met à jour l'aperçu de téléportation.
        /// </summary>
        private void UpdateTeleportationPreview()
        {
            // Obtenir la position et rotation du contrôleur actif
            Transform controllerTransform = GetActiveControllerTransform();
            if (controllerTransform == null) return;

            // Calculer la trajectoire parabolique
            Vector3[] trajectoryPoints = CalculateTrajectory(
                controllerTransform.position,
                controllerTransform.forward,
                15f // Vitesse initiale
            );

            // Mettre à jour la ligne de trajectoire
            trajectoryLine.positionCount = trajectoryPoints.Length;
            trajectoryLine.SetPositions(trajectoryPoints);

            // Vérifier si la destination est valide
            Vector3 hitPoint;
            Vector3 hitNormal;
            bool validTarget = CheckTeleportationTarget(trajectoryPoints, out hitPoint, out hitNormal);

            // Mettre à jour les visuels selon la validité
            UpdateTeleportationVisuals(validTarget, hitPoint, hitNormal);

            isValidTeleportTarget = validTarget;
            teleportTarget = hitPoint;
            teleportNormal = hitNormal;
        }

        /// <summary>
        /// Obtient le transform du contrôleur actif.
        /// </summary>
        private Transform GetActiveControllerTransform()
        {
            // Pour simplifier, on utilise le contrôleur droit par défaut
            // Dans une implémentation complète, on déterminerait quel contrôleur est utilisé
            if (rightController.isValid)
            {
                // Retourner le transform du contrôleur droit
                // Note: Dans Unity XR, il faudrait obtenir le transform via XR Origin
                return vrCamera.transform; // Placeholder
            }
            return null;
        }

        /// <summary>
        /// Calcule la trajectoire parabolique de téléportation.
        /// </summary>
        private Vector3[] CalculateTrajectory(Vector3 startPosition, Vector3 direction, float initialVelocity)
        {
            Vector3[] points = new Vector3[trajectoryResolution];
            Vector3 velocity = direction * initialVelocity;

            for (int i = 0; i < trajectoryResolution; i++)
            {
                float time = i * trajectoryTimeStep;
                Vector3 point = startPosition + velocity * time + 0.5f * Vector3.up * gravity * time * time;
                points[i] = point;

                // Arrêter si on touche le sol
                if (point.y <= 0f)
                {
                    System.Array.Resize(ref points, i + 1);
                    break;
                }
            }

            return points;
        }

        /// <summary>
        /// Vérifie si la cible de téléportation est valide.
        /// </summary>
        private bool CheckTeleportationTarget(Vector3[] trajectoryPoints, out Vector3 hitPoint, out Vector3 hitNormal)
        {
            hitPoint = Vector3.zero;
            hitNormal = Vector3.up;

            if (trajectoryPoints.Length < 2) return false;

            // Raycast le long de la trajectoire
            for (int i = 0; i < trajectoryPoints.Length - 1; i++)
            {
                Vector3 start = trajectoryPoints[i];
                Vector3 end = trajectoryPoints[i + 1];
                Vector3 direction = (end - start).normalized;
                float distance = Vector3.Distance(start, end);

                if (Physics.Raycast(start, direction, out RaycastHit hit, distance, teleportLayerMask))
                {
                    hitPoint = hit.point;
                    hitNormal = hit.normal;

                    // Vérifier si la surface est valide
                    if (requireValidSurface)
                    {
                        float angle = Vector3.Angle(hit.normal, Vector3.up);
                        if (angle > maxSlopeAngle)
                        {
                            return false; // Pente trop raide
                        }
                    }

                    // Vérifier la distance maximale
                    float teleportDistance = Vector3.Distance(vrRig.position, hitPoint);
                    if (teleportDistance > maxTeleportDistance)
                    {
                        return false; // Trop loin
                    }

                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Met à jour les visuels de téléportation.
        /// </summary>
        private void UpdateTeleportationVisuals(bool isValid, Vector3 targetPosition, Vector3 targetNormal)
        {
            // Changer le matériau de la ligne selon la validité
            if (isValid && validTeleportMaterial != null)
            {
                trajectoryLine.material = validTeleportMaterial;
            }
            else if (!isValid && invalidTeleportMaterial != null)
            {
                trajectoryLine.material = invalidTeleportMaterial;
            }

            // Afficher/masquer le marqueur de téléportation
            if (isValid)
            {
                ShowTeleportMarker(targetPosition, targetNormal);
            }
            else
            {
                HideTeleportMarker();
            }
        }

        /// <summary>
        /// Affiche le marqueur de téléportation.
        /// </summary>
        private void ShowTeleportMarker(Vector3 position, Vector3 normal)
        {
            if (teleportMarkerPrefab == null) return;

            if (currentTeleportMarker == null)
            {
                currentTeleportMarker = Instantiate(teleportMarkerPrefab);
            }

            currentTeleportMarker.SetActive(true);
            currentTeleportMarker.transform.position = position + normal * teleportationHeight;
            currentTeleportMarker.transform.up = normal;
        }

        /// <summary>
        /// Masque le marqueur de téléportation.
        /// </summary>
        private void HideTeleportMarker()
        {
            if (currentTeleportMarker != null)
            {
                currentTeleportMarker.SetActive(false);
            }
        }

        /// <summary>
        /// Exécute la téléportation.
        /// </summary>
        private void ExecuteTeleportation()
        {
            isTeleportationActive = false;
            trajectoryLine.enabled = false;
            HideTeleportMarker();

            if (isValidTeleportTarget)
            {
                StartCoroutine(PerformTeleportation(teleportTarget));
                
                // Feedback audio
                if (teleportSound != null && audioSource != null)
                {
                    audioSource.PlayOneShot(teleportSound);
                }

                // Feedback haptique
                if (enableHapticFeedback)
                {
                    TriggerHapticFeedback();
                }
            }
            else
            {
                // Son d'erreur
                if (invalidTeleportSound != null && audioSource != null)
                {
                    audioSource.PlayOneShot(invalidTeleportSound);
                }
            }

            Debug.Log($"[VRTeleportation] Téléportation {'réussie' : 'échouée'}");
        }

        /// <summary>
        /// Effectue la téléportation avec transition de fade.
        /// </summary>
        private IEnumerator PerformTeleportation(Vector3 targetPosition)
        {
            if (enableFadeTransition && fadeCanvas != null)
            {
                // Fade out
                yield return StartCoroutine(FadeScreen(0f, 1f, fadeTransitionDuration * 0.5f));
            }

            // Téléportation instantanée
            Vector3 offset = vrCamera.transform.position - vrRig.position;
            Vector3 newPosition = targetPosition - offset;
            newPosition.y += teleportationHeight;
            
            vrRig.position = newPosition;

            if (enableFadeTransition && fadeCanvas != null)
            {
                // Fade in
                yield return StartCoroutine(FadeScreen(1f, 0f, fadeTransitionDuration * 0.5f));
            }
        }

        /// <summary>
        /// Effectue un fade de l'écran.
        /// </summary>
        private IEnumerator FadeScreen(float startAlpha, float endAlpha, float duration)
        {
            if (fadeCanvas == null) yield break;

            float elapsedTime = 0f;
            
            while (elapsedTime < duration)
            {
                elapsedTime += Time.deltaTime;
                float alpha = Mathf.Lerp(startAlpha, endAlpha, elapsedTime / duration);
                fadeCanvas.alpha = alpha;
                yield return null;
            }
            
            fadeCanvas.alpha = endAlpha;
        }

        /// <summary>
        /// Déclenche un feedback haptique sur les contrôleurs.
        /// </summary>
        private void TriggerHapticFeedback()
        {
            if (leftController.isValid)
            {
                leftController.SendHapticImpulse(0, hapticIntensity, 0.1f);
            }
            
            if (rightController.isValid)
            {
                rightController.SendHapticImpulse(0, hapticIntensity, 0.1f);
            }
        }

        /// <summary>
        /// Active ou désactive le système de téléportation.
        /// </summary>
        public void SetTeleportationEnabled(bool enabled)
        {
            this.enabled = enabled;
            
            if (!enabled && isTeleportationActive)
            {
                isTeleportationActive = false;
                trajectoryLine.enabled = false;
                HideTeleportMarker();
            }
        }

        private void OnDestroy()
        {
            if (vrManager != null)
            {
                vrManager.OnVRInitialized -= OnVRInitialized;
            }
        }

        private void OnDrawGizmosSelected()
        {
            // Visualisation de la portée de téléportation
            Gizmos.color = Color.cyan;
            Gizmos.DrawWireSphere(transform.position, maxTeleportDistance);
        }
    }
}
