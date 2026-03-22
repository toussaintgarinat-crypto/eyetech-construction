using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR;
using UnityEngine.XR.Management;

namespace BuildingScanVR.VR
{
    /// <summary>
    /// Gestionnaire principal pour les fonctionnalités VR de Building Scan VR.
    /// Gère l'initialisation, la configuration et les interactions VR sur iOS et Android.
    /// </summary>
    public class VRManager : MonoBehaviour
    {
        [Header("VR Configuration")]
        [SerializeField] private bool enableVROnStart = true;
        [SerializeField] private bool enableHandTracking = true;
        [SerializeField] private float teleportationRange = 10f;
        [SerializeField] private LayerMask teleportationLayerMask = -1;

        [Header("Performance Settings")]
        [SerializeField] private int targetFrameRate = 90;
        [SerializeField] private bool enableFoveatedRendering = true;
        [SerializeField] private bool enableDynamicResolution = true;

        [Header("Comfort Settings")]
        [SerializeField] private bool enableComfortVignette = true;
        [SerializeField] private float snapTurnAngle = 30f;
        [SerializeField] private bool enableSmoothLocomotion = false;

        // Événements VR
        public System.Action OnVRInitialized;
        public System.Action OnVRShutdown;
        public System.Action<bool> OnVRDeviceConnected;

        // Propriétés publiques
        public bool IsVRActive { get; private set; }
        public bool IsHandTrackingActive { get; private set; }
        public XRInputSubsystem InputSubsystem { get; private set; }

        // Références aux composants VR
        private XRGeneralSettings xrGeneralSettings;
        private XRManagerSettings xrManagerSettings;
        private Camera vrCamera;
        private Transform vrRig;

        // Contrôleurs VR
        private InputDevice leftController;
        private InputDevice rightController;
        private InputDevice headset;

        private void Awake()
        {
            // Configuration de base
            Application.targetFrameRate = targetFrameRate;
            QualitySettings.vSyncCount = 0; // Désactiver VSync pour VR
            
            // Recherche des composants VR
            vrCamera = Camera.main;
            if (vrCamera == null)
            {
                vrCamera = FindObjectOfType<Camera>();
            }

            vrRig = transform;
        }

        private void Start()
        {
            if (enableVROnStart)
            {
                StartCoroutine(InitializeVR());
            }
        }

        private void Update()
        {
            if (IsVRActive)
            {
                UpdateVRInput();
                UpdatePerformanceMetrics();
            }
        }

        /// <summary>
        /// Initialise le système VR de manière asynchrone.
        /// </summary>
        public IEnumerator InitializeVR()
        {
            Debug.Log("[VRManager] Initialisation du système VR...");

            // Obtenir les paramètres XR
            xrGeneralSettings = XRGeneralSettings.Instance;
            if (xrGeneralSettings == null)
            {
                Debug.LogError("[VRManager] XRGeneralSettings non trouvé. Assurez-vous que XR Management est configuré.");
                yield break;
            }

            xrManagerSettings = xrGeneralSettings.Manager;
            if (xrManagerSettings == null)
            {
                Debug.LogError("[VRManager] XRManagerSettings non trouvé.");
                yield break;
            }

            // Initialiser XR
            yield return xrManagerSettings.InitializeLoader();

            if (xrManagerSettings.activeLoader == null)
            {
                Debug.LogError("[VRManager] Échec de l'initialisation du loader XR.");
                yield break;
            }

            // Démarrer les sous-systèmes XR
            xrManagerSettings.StartSubsystems();

            // Vérifier si VR est disponible
            if (XRSettings.enabled && XRSettings.loadedDeviceName != "None")
            {
                IsVRActive = true;
                Debug.Log($"[VRManager] VR initialisé avec succès. Device: {XRSettings.loadedDeviceName}");
                
                // Configuration spécifique à la plateforme
                ConfigurePlatformSpecificSettings();
                
                // Initialiser le tracking des mains si disponible
                if (enableHandTracking)
                {
                    InitializeHandTracking();
                }

                // Configurer les paramètres de performance
                ConfigurePerformanceSettings();

                OnVRInitialized?.Invoke();
            }
            else
            {
                Debug.LogWarning("[VRManager] VR non disponible ou non activé.");
                IsVRActive = false;
            }
        }

        /// <summary>
        /// Configure les paramètres spécifiques à la plateforme (iOS/Android).
        /// </summary>
        private void ConfigurePlatformSpecificSettings()
        {
#if UNITY_IOS
            // Configuration spécifique iOS (ARKit/RealityKit)
            Debug.Log("[VRManager] Configuration iOS détectée.");
            
            // Activer ARKit si disponible
            if (XRSettings.loadedDeviceName.Contains("ARKit"))
            {
                // Configuration ARKit spécifique
                ConfigureARKit();
            }
#elif UNITY_ANDROID
            // Configuration spécifique Android (ARCore/OpenXR)
            Debug.Log("[VRManager] Configuration Android détectée.");
            
            // Activer ARCore si disponible
            if (XRSettings.loadedDeviceName.Contains("ARCore"))
            {
                // Configuration ARCore spécifique
                ConfigureARCore();
            }
            
            // Configuration OpenXR pour casques VR Android
            if (XRSettings.loadedDeviceName.Contains("OpenXR"))
            {
                ConfigureOpenXR();
            }
#endif
        }

#if UNITY_IOS
        /// <summary>
        /// Configure les paramètres ARKit pour iOS.
        /// </summary>
        private void ConfigureARKit()
        {
            Debug.Log("[VRManager] Configuration ARKit...");
            
            // Configuration de la caméra pour ARKit
            if (vrCamera != null)
            {
                vrCamera.clearFlags = CameraClearFlags.Color;
                vrCamera.backgroundColor = Color.black;
            }
            
            // Activer le tracking de position 6DOF
            XRSettings.eyeTextureResolutionScale = enableDynamicResolution ? 0.8f : 1.0f;
        }
#endif

#if UNITY_ANDROID
        /// <summary>
        /// Configure les paramètres ARCore pour Android.
        /// </summary>
        private void ConfigureARCore()
        {
            Debug.Log("[VRManager] Configuration ARCore...");
            
            // Configuration similaire à ARKit mais pour Android
            if (vrCamera != null)
            {
                vrCamera.clearFlags = CameraClearFlags.Color;
                vrCamera.backgroundColor = Color.black;
            }
        }

        /// <summary>
        /// Configure les paramètres OpenXR pour les casques VR Android.
        /// </summary>
        private void ConfigureOpenXR()
        {
            Debug.Log("[VRManager] Configuration OpenXR...");
            
            // Configuration pour casques VR (Meta Quest, Pico, etc.)
            if (vrCamera != null)
            {
                vrCamera.clearFlags = CameraClearFlags.Skybox;
            }
            
            // Activer le rendu stéréoscopique
            XRSettings.eyeTextureResolutionScale = 1.0f;
        }
#endif

        /// <summary>
        /// Initialise le tracking des mains si disponible.
        /// </summary>
        private void InitializeHandTracking()
        {
            // Vérifier si le tracking des mains est supporté
            var handSubsystems = new List<XRHandSubsystem>();
            SubsystemManager.GetInstances(handSubsystems);
            
            if (handSubsystems.Count > 0)
            {
                IsHandTrackingActive = true;
                Debug.Log("[VRManager] Tracking des mains activé.");
            }
            else
            {
                IsHandTrackingActive = false;
                Debug.Log("[VRManager] Tracking des mains non disponible.");
            }
        }

        /// <summary>
        /// Configure les paramètres de performance pour VR.
        /// </summary>
        private void ConfigurePerformanceSettings()
        {
            // Configuration du framerate cible
            Application.targetFrameRate = targetFrameRate;
            
            // Configuration de la résolution dynamique
            if (enableDynamicResolution)
            {
                XRSettings.eyeTextureResolutionScale = 0.8f;
            }
            
            // Configuration du rendu fovéal si supporté
            if (enableFoveatedRendering)
            {
                // Note: Le rendu fovéal nécessite un support spécifique du casque
                Debug.Log("[VRManager] Tentative d'activation du rendu fovéal...");
            }
            
            Debug.Log($"[VRManager] Performance configurée - Target FPS: {targetFrameRate}");
        }

        /// <summary>
        /// Met à jour les entrées VR (contrôleurs, tracking).
        /// </summary>
        private void UpdateVRInput()
        {
            // Mise à jour des dispositifs d'entrée
            UpdateInputDevices();
            
            // Traitement des entrées des contrôleurs
            ProcessControllerInput();
            
            // Traitement du tracking de la tête
            ProcessHeadTracking();
        }

        /// <summary>
        /// Met à jour la liste des dispositifs d'entrée VR.
        /// </summary>
        private void UpdateInputDevices()
        {
            // Contrôleur gauche
            if (!leftController.isValid)
            {
                leftController = InputDevices.GetDeviceAtXRNode(XRNode.LeftHand);
            }
            
            // Contrôleur droit
            if (!rightController.isValid)
            {
                rightController = InputDevices.GetDeviceAtXRNode(XRNode.RightHand);
            }
            
            // Casque
            if (!headset.isValid)
            {
                headset = InputDevices.GetDeviceAtXRNode(XRNode.Head);
            }
        }

        /// <summary>
        /// Traite les entrées des contrôleurs VR.
        /// </summary>
        private void ProcessControllerInput()
        {
            // Traitement du contrôleur gauche
            if (leftController.isValid)
            {
                ProcessControllerInputForDevice(leftController, "Left");
            }
            
            // Traitement du contrôleur droit
            if (rightController.isValid)
            {
                ProcessControllerInputForDevice(rightController, "Right");
            }
        }

        /// <summary>
        /// Traite les entrées d'un contrôleur spécifique.
        /// </summary>
        private void ProcessControllerInputForDevice(InputDevice device, string handedness)
        {
            // Bouton trigger
            if (device.TryGetFeatureValue(CommonUsages.triggerButton, out bool triggerPressed))
            {
                if (triggerPressed)
                {
                    OnTriggerPressed(handedness);
                }
            }
            
            // Bouton grip
            if (device.TryGetFeatureValue(CommonUsages.gripButton, out bool gripPressed))
            {
                if (gripPressed)
                {
                    OnGripPressed(handedness);
                }
            }
            
            // Joystick
            if (device.TryGetFeatureValue(CommonUsages.primary2DAxis, out Vector2 joystickValue))
            {
                OnJoystickInput(handedness, joystickValue);
            }
            
            // Position et rotation du contrôleur
            if (device.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 position) &&
                device.TryGetFeatureValue(CommonUsages.deviceRotation, out Quaternion rotation))
            {
                OnControllerTracking(handedness, position, rotation);
            }
        }

        /// <summary>
        /// Traite le tracking de la tête.
        /// </summary>
        private void ProcessHeadTracking()
        {
            if (headset.isValid)
            {
                if (headset.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 headPosition) &&
                    headset.TryGetFeatureValue(CommonUsages.deviceRotation, out Quaternion headRotation))
                {
                    OnHeadTracking(headPosition, headRotation);
                }
            }
        }

        /// <summary>
        /// Met à jour les métriques de performance VR.
        /// </summary>
        private void UpdatePerformanceMetrics()
        {
            // Surveillance du framerate
            float currentFPS = 1.0f / Time.unscaledDeltaTime;
            
            // Ajustement dynamique de la résolution si nécessaire
            if (enableDynamicResolution && currentFPS < targetFrameRate * 0.9f)
            {
                float currentScale = XRSettings.eyeTextureResolutionScale;
                XRSettings.eyeTextureResolutionScale = Mathf.Max(0.5f, currentScale - 0.1f);
            }
            else if (enableDynamicResolution && currentFPS > targetFrameRate * 1.1f)
            {
                float currentScale = XRSettings.eyeTextureResolutionScale;
                XRSettings.eyeTextureResolutionScale = Mathf.Min(1.0f, currentScale + 0.05f);
            }
        }

        // Événements d'entrée VR
        protected virtual void OnTriggerPressed(string handedness)
        {
            Debug.Log($"[VRManager] Trigger pressé - {handedness}");
        }

        protected virtual void OnGripPressed(string handedness)
        {
            Debug.Log($"[VRManager] Grip pressé - {handedness}");
        }

        protected virtual void OnJoystickInput(string handedness, Vector2 input)
        {
            // Gestion de la rotation par snap turn
            if (handedness == "Right" && Mathf.Abs(input.x) > 0.8f)
            {
                float turnAngle = input.x > 0 ? snapTurnAngle : -snapTurnAngle;
                vrRig.Rotate(0, turnAngle, 0);
            }
        }

        protected virtual void OnControllerTracking(string handedness, Vector3 position, Quaternion rotation)
        {
            // Mise à jour de la position des contrôleurs virtuels
        }

        protected virtual void OnHeadTracking(Vector3 position, Quaternion rotation)
        {
            // Mise à jour de la position de la caméra VR
        }

        /// <summary>
        /// Arrête le système VR.
        /// </summary>
        public void ShutdownVR()
        {
            if (IsVRActive)
            {
                Debug.Log("[VRManager] Arrêt du système VR...");
                
                xrManagerSettings?.StopSubsystems();
                xrManagerSettings?.DeinitializeLoader();
                
                IsVRActive = false;
                IsHandTrackingActive = false;
                
                OnVRShutdown?.Invoke();
            }
        }

        private void OnDestroy()
        {
            ShutdownVR();
        }

        private void OnApplicationPause(bool pauseStatus)
        {
            if (pauseStatus && IsVRActive)
            {
                // Pause du système VR
                xrManagerSettings?.StopSubsystems();
            }
            else if (!pauseStatus && IsVRActive)
            {
                // Reprise du système VR
                xrManagerSettings?.StartSubsystems();
            }
        }

        /// <summary>
        /// Obtient les informations sur le casque VR connecté.
        /// </summary>
        public VRDeviceInfo GetVRDeviceInfo()
        {
            return new VRDeviceInfo
            {
                DeviceName = XRSettings.loadedDeviceName,
                IsActive = IsVRActive,
                RefreshRate = XRDevice.refreshRate,
                EyeTextureWidth = XRSettings.eyeTextureWidth,
                EyeTextureHeight = XRSettings.eyeTextureHeight,
                EyeTextureResolutionScale = XRSettings.eyeTextureResolutionScale
            };
        }
    }

    /// <summary>
    /// Structure contenant les informations sur le dispositif VR.
    /// </summary>
    [System.Serializable]
    public struct VRDeviceInfo
    {
        public string DeviceName;
        public bool IsActive;
        public float RefreshRate;
        public int EyeTextureWidth;
        public int EyeTextureHeight;
        public float EyeTextureResolutionScale;
    }
}
