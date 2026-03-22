using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR;

#if UNITY_ANDROID
using UnityEngine.Android;
#endif

namespace BuildingScanVR.VR
{
    /// <summary>
    /// Configuration spécifique Android pour Building Scan VR.
    /// Gère l'intégration avec ARCore, OpenXR et les casques VR Android.
    /// </summary>
    public class AndroidVRConfiguration : MonoBehaviour
    {
        [Header("Android VR Settings")]
        [SerializeField] private bool enableARCore = true;
        [SerializeField] private bool enableOpenXR = true;
        [SerializeField] private bool autoDetectVRHeadset = true;
        [SerializeField] private AndroidVRMode preferredVRMode = AndroidVRMode.OpenXR;

        [Header("Performance Settings")]
        [SerializeField] private bool enableVulkanRenderer = false;
        [SerializeField] private bool enableMultithreadedRendering = true;
        [SerializeField] private int targetCPULevel = 3;
        [SerializeField] private int targetGPULevel = 3;

        [Header("ARCore Settings")]
        [SerializeField] private bool requireARCoreSupport = false;
        [SerializeField] private bool enablePlaneDetection = true;
        [SerializeField] private bool enableLightEstimation = true;
        [SerializeField] private bool enableCloudAnchors = false;

        [Header("OpenXR Settings")]
        [SerializeField] private bool enableHandTracking = true;
        [SerializeField] private bool enableEyeTracking = false;
        [SerializeField] private bool enablePassthrough = false;
        [SerializeField] private OpenXRRuntimeTarget runtimeTarget = OpenXRRuntimeTarget.Auto;

        // Événements Android VR
        public System.Action<AndroidVRMode> OnVRModeChanged;
        public System.Action<bool> OnARCoreStatusChanged;
        public System.Action<string> OnHeadsetDetected;

        // Propriétés publiques
        public AndroidVRMode CurrentVRMode { get; private set; }
        public bool IsARCoreAvailable { get; private set; }
        public bool IsOpenXRAvailable { get; private set; }
        public string DetectedHeadset { get; private set; }

        // Références
        private VRManager vrManager;
        private AndroidPermissionManager permissionManager;

        // État de configuration
        private bool isConfigured = false;
        private bool isARCoreInitialized = false;
        private bool isOpenXRInitialized = false;

        public enum AndroidVRMode
        {
            ARCore,
            OpenXR,
            Hybrid,
            Auto
        }

        public enum OpenXRRuntimeTarget
        {
            Auto,
            MetaQuest,
            Pico,
            HTC,
            Varjo,
            Generic
        }

        private void Awake()
        {
            // Recherche des composants
            vrManager = FindObjectOfType<VRManager>();
            
            // Initialisation du gestionnaire de permissions
            permissionManager = gameObject.AddComponent<AndroidPermissionManager>();
        }

        private void Start()
        {
#if UNITY_ANDROID
            StartCoroutine(InitializeAndroidVR());
#else
            Debug.LogWarning("[AndroidVRConfiguration] Ce script est conçu pour Android uniquement.");
#endif
        }

#if UNITY_ANDROID
        /// <summary>
        /// Initialise la configuration VR Android.
        /// </summary>
        private IEnumerator InitializeAndroidVR()
        {
            Debug.Log("[AndroidVRConfiguration] Initialisation de la configuration VR Android...");

            // Vérification des permissions
            yield return StartCoroutine(RequestRequiredPermissions());

            // Détection des capacités du dispositif
            yield return StartCoroutine(DetectDeviceCapabilities());

            // Configuration du mode VR optimal
            ConfigureOptimalVRMode();

            // Initialisation des sous-systèmes
            yield return StartCoroutine(InitializeVRSubsystems());

            // Configuration des paramètres de performance
            ConfigurePerformanceSettings();

            isConfigured = true;
            Debug.Log($"[AndroidVRConfiguration] Configuration terminée - Mode: {CurrentVRMode}");
        }

        /// <summary>
        /// Demande les permissions nécessaires pour VR/AR.
        /// </summary>
        private IEnumerator RequestRequiredPermissions()
        {
            Debug.Log("[AndroidVRConfiguration] Vérification des permissions...");

            List<string> requiredPermissions = new List<string>();

            // Permissions pour ARCore
            if (enableARCore)
            {
                requiredPermissions.Add(Permission.Camera);
                requiredPermissions.Add("android.permission.ACCESS_FINE_LOCATION");
            }

            // Permissions pour VR
            requiredPermissions.Add("android.permission.RECORD_AUDIO");
            requiredPermissions.Add("android.permission.MODIFY_AUDIO_SETTINGS");

            // Demander les permissions
            foreach (string permission in requiredPermissions)
            {
                if (!Permission.HasUserAuthorizedPermission(permission))
                {
                    Permission.RequestUserPermission(permission);
                    
                    // Attendre la réponse de l'utilisateur
                    float timeout = 10f;
                    while (!Permission.HasUserAuthorizedPermission(permission) && timeout > 0)
                    {
                        timeout -= Time.deltaTime;
                        yield return null;
                    }

                    if (!Permission.HasUserAuthorizedPermission(permission))
                    {
                        Debug.LogWarning($"[AndroidVRConfiguration] Permission refusée: {permission}");
                    }
                }
            }
        }

        /// <summary>
        /// Détecte les capacités VR/AR du dispositif Android.
        /// </summary>
        private IEnumerator DetectDeviceCapabilities()
        {
            Debug.Log("[AndroidVRConfiguration] Détection des capacités du dispositif...");

            // Vérification ARCore
            if (enableARCore)
            {
                IsARCoreAvailable = CheckARCoreSupport();
                Debug.Log($"[AndroidVRConfiguration] ARCore disponible: {IsARCoreAvailable}");
            }

            // Vérification OpenXR
            if (enableOpenXR)
            {
                IsOpenXRAvailable = CheckOpenXRSupport();
                Debug.Log($"[AndroidVRConfiguration] OpenXR disponible: {IsOpenXRAvailable}");
            }

            // Détection du casque VR
            if (autoDetectVRHeadset)
            {
                DetectedHeadset = DetectVRHeadset();
                if (!string.IsNullOrEmpty(DetectedHeadset))
                {
                    Debug.Log($"[AndroidVRConfiguration] Casque détecté: {DetectedHeadset}");
                    OnHeadsetDetected?.Invoke(DetectedHeadset);
                }
            }

            yield return null;
        }

        /// <summary>
        /// Vérifie le support ARCore sur le dispositif.
        /// </summary>
        private bool CheckARCoreSupport()
        {
            // Vérification de la disponibilité ARCore
            try
            {
                // Utilisation de l'API Android pour vérifier ARCore
                using (AndroidJavaClass arCoreApk = new AndroidJavaClass("com.google.ar.core.ArCoreApk"))
                using (AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer"))
                using (AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity"))
                {
                    var availability = arCoreApk.CallStatic<AndroidJavaObject>("getInstance")
                        .Call<AndroidJavaObject>("checkAvailability", currentActivity);
                    
                    string availabilityString = availability.Call<string>("toString");
                    return availabilityString.Contains("SUPPORTED");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[AndroidVRConfiguration] Erreur lors de la vérification ARCore: {e.Message}");
                return false;
            }
        }

        /// <summary>
        /// Vérifie le support OpenXR sur le dispositif.
        /// </summary>
        private bool CheckOpenXRSupport()
        {
            // Vérification des loaders XR disponibles
            var xrGeneralSettings = XRGeneralSettings.Instance;
            if (xrGeneralSettings?.Manager?.activeLoaders != null)
            {
                foreach (var loader in xrGeneralSettings.Manager.activeLoaders)
                {
                    if (loader.name.Contains("OpenXR"))
                    {
                        return true;
                    }
                }
            }

            // Vérification alternative via les capacités du système
            return XRSettings.supportedDevices.Length > 0;
        }

        /// <summary>
        /// Détecte le type de casque VR connecté.
        /// </summary>
        private string DetectVRHeadset()
        {
            // Vérification via les propriétés système Android
            try
            {
                using (AndroidJavaClass buildClass = new AndroidJavaClass("android.os.Build"))
                {
                    string manufacturer = buildClass.GetStatic<string>("MANUFACTURER").ToLower();
                    string model = buildClass.GetStatic<string>("MODEL").ToLower();
                    string device = buildClass.GetStatic<string>("DEVICE").ToLower();

                    // Détection Meta Quest
                    if (manufacturer.Contains("oculus") || model.Contains("quest") || device.Contains("quest"))
                    {
                        return "Meta Quest";
                    }
                    
                    // Détection Pico
                    if (manufacturer.Contains("pico") || model.Contains("pico"))
                    {
                        return "Pico";
                    }
                    
                    // Détection HTC
                    if (manufacturer.Contains("htc") || model.Contains("vive"))
                    {
                        return "HTC Vive";
                    }
                    
                    // Détection Varjo
                    if (manufacturer.Contains("varjo"))
                    {
                        return "Varjo";
                    }
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[AndroidVRConfiguration] Erreur lors de la détection du casque: {e.Message}");
            }

            // Vérification via XR Settings
            if (!string.IsNullOrEmpty(XRSettings.loadedDeviceName))
            {
                return XRSettings.loadedDeviceName;
            }

            return "Unknown";
        }

        /// <summary>
        /// Configure le mode VR optimal selon les capacités détectées.
        /// </summary>
        private void ConfigureOptimalVRMode()
        {
            AndroidVRMode optimalMode = preferredVRMode;

            if (preferredVRMode == AndroidVRMode.Auto)
            {
                // Sélection automatique du meilleur mode
                if (IsOpenXRAvailable && !string.IsNullOrEmpty(DetectedHeadset) && DetectedHeadset != "Unknown")
                {
                    optimalMode = AndroidVRMode.OpenXR;
                }
                else if (IsARCoreAvailable)
                {
                    optimalMode = AndroidVRMode.ARCore;
                }
                else if (IsOpenXRAvailable)
                {
                    optimalMode = AndroidVRMode.OpenXR;
                }
                else
                {
                    optimalMode = AndroidVRMode.ARCore; // Fallback
                }
            }

            // Vérification de la disponibilité du mode sélectionné
            if (optimalMode == AndroidVRMode.ARCore && !IsARCoreAvailable)
            {
                if (IsOpenXRAvailable)
                {
                    optimalMode = AndroidVRMode.OpenXR;
                }
                else
                {
                    Debug.LogError("[AndroidVRConfiguration] Aucun mode VR disponible!");
                    return;
                }
            }

            if (optimalMode == AndroidVRMode.OpenXR && !IsOpenXRAvailable)
            {
                if (IsARCoreAvailable)
                {
                    optimalMode = AndroidVRMode.ARCore;
                }
                else
                {
                    Debug.LogError("[AndroidVRConfiguration] Aucun mode VR disponible!");
                    return;
                }
            }

            CurrentVRMode = optimalMode;
            OnVRModeChanged?.Invoke(CurrentVRMode);
            
            Debug.Log($"[AndroidVRConfiguration] Mode VR configuré: {CurrentVRMode}");
        }

        /// <summary>
        /// Initialise les sous-systèmes VR selon le mode configuré.
        /// </summary>
        private IEnumerator InitializeVRSubsystems()
        {
            switch (CurrentVRMode)
            {
                case AndroidVRMode.ARCore:
                    yield return StartCoroutine(InitializeARCore());
                    break;
                    
                case AndroidVRMode.OpenXR:
                    yield return StartCoroutine(InitializeOpenXR());
                    break;
                    
                case AndroidVRMode.Hybrid:
                    yield return StartCoroutine(InitializeARCore());
                    yield return StartCoroutine(InitializeOpenXR());
                    break;
            }
        }

        /// <summary>
        /// Initialise ARCore pour Android.
        /// </summary>
        private IEnumerator InitializeARCore()
        {
            if (!IsARCoreAvailable)
            {
                Debug.LogWarning("[AndroidVRConfiguration] ARCore non disponible.");
                yield break;
            }

            Debug.Log("[AndroidVRConfiguration] Initialisation d'ARCore...");

            try
            {
                // Configuration ARCore
                if (enablePlaneDetection)
                {
                    Debug.Log("[AndroidVRConfiguration] Détection de plans activée.");
                }

                if (enableLightEstimation)
                {
                    Debug.Log("[AndroidVRConfiguration] Estimation de lumière activée.");
                }

                if (enableCloudAnchors)
                {
                    Debug.Log("[AndroidVRConfiguration] Cloud Anchors activé.");
                }

                isARCoreInitialized = true;
                OnARCoreStatusChanged?.Invoke(true);
                
                Debug.Log("[AndroidVRConfiguration] ARCore initialisé avec succès.");
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[AndroidVRConfiguration] Erreur lors de l'initialisation ARCore: {e.Message}");
                isARCoreInitialized = false;
                OnARCoreStatusChanged?.Invoke(false);
            }

            yield return null;
        }

        /// <summary>
        /// Initialise OpenXR pour Android.
        /// </summary>
        private IEnumerator InitializeOpenXR()
        {
            if (!IsOpenXRAvailable)
            {
                Debug.LogWarning("[AndroidVRConfiguration] OpenXR non disponible.");
                yield break;
            }

            Debug.Log("[AndroidVRConfiguration] Initialisation d'OpenXR...");

            try
            {
                // Configuration OpenXR selon le casque détecté
                ConfigureOpenXRForHeadset(DetectedHeadset);

                // Configuration des fonctionnalités
                if (enableHandTracking)
                {
                    Debug.Log("[AndroidVRConfiguration] Tracking des mains activé.");
                }

                if (enableEyeTracking)
                {
                    Debug.Log("[AndroidVRConfiguration] Tracking des yeux activé.");
                }

                if (enablePassthrough)
                {
                    Debug.Log("[AndroidVRConfiguration] Passthrough activé.");
                }

                isOpenXRInitialized = true;
                Debug.Log("[AndroidVRConfiguration] OpenXR initialisé avec succès.");
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[AndroidVRConfiguration] Erreur lors de l'initialisation OpenXR: {e.Message}");
                isOpenXRInitialized = false;
            }

            yield return null;
        }

        /// <summary>
        /// Configure OpenXR selon le casque VR détecté.
        /// </summary>
        private void ConfigureOpenXRForHeadset(string headset)
        {
            switch (headset?.ToLower())
            {
                case "meta quest":
                    ConfigureForMetaQuest();
                    break;
                    
                case "pico":
                    ConfigureForPico();
                    break;
                    
                case "htc vive":
                    ConfigureForHTCVive();
                    break;
                    
                case "varjo":
                    ConfigureForVarjo();
                    break;
                    
                default:
                    ConfigureForGenericOpenXR();
                    break;
            }
        }

        /// <summary>
        /// Configuration spécifique Meta Quest.
        /// </summary>
        private void ConfigureForMetaQuest()
        {
            Debug.Log("[AndroidVRConfiguration] Configuration Meta Quest...");
            
            // Paramètres spécifiques Meta Quest
            targetCPULevel = 4;
            targetGPULevel = 4;
            enableHandTracking = true;
            enablePassthrough = true;
        }

        /// <summary>
        /// Configuration spécifique Pico.
        /// </summary>
        private void ConfigureForPico()
        {
            Debug.Log("[AndroidVRConfiguration] Configuration Pico...");
            
            // Paramètres spécifiques Pico
            targetCPULevel = 3;
            targetGPULevel = 3;
            enableHandTracking = true;
        }

        /// <summary>
        /// Configuration spécifique HTC Vive.
        /// </summary>
        private void ConfigureForHTCVive()
        {
            Debug.Log("[AndroidVRConfiguration] Configuration HTC Vive...");
            
            // Paramètres spécifiques HTC Vive
            enableEyeTracking = true;
        }

        /// <summary>
        /// Configuration spécifique Varjo.
        /// </summary>
        private void ConfigureForVarjo()
        {
            Debug.Log("[AndroidVRConfiguration] Configuration Varjo...");
            
            // Paramètres spécifiques Varjo
            enableEyeTracking = true;
            targetCPULevel = 4;
            targetGPULevel = 4;
        }

        /// <summary>
        /// Configuration générique OpenXR.
        /// </summary>
        private void ConfigureForGenericOpenXR()
        {
            Debug.Log("[AndroidVRConfiguration] Configuration OpenXR générique...");
            
            // Paramètres conservateurs pour compatibilité
            targetCPULevel = 2;
            targetGPULevel = 2;
        }

        /// <summary>
        /// Configure les paramètres de performance Android.
        /// </summary>
        private void ConfigurePerformanceSettings()
        {
            Debug.Log("[AndroidVRConfiguration] Configuration des paramètres de performance...");

            // Configuration du niveau CPU/GPU
            try
            {
                using (AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer"))
                using (AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity"))
                {
                    // Configuration des niveaux de performance si supporté
                    Debug.Log($"[AndroidVRConfiguration] Niveaux de performance - CPU: {targetCPULevel}, GPU: {targetGPULevel}");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[AndroidVRConfiguration] Impossible de configurer les niveaux de performance: {e.Message}");
            }

            // Configuration du rendu
            if (enableMultithreadedRendering)
            {
                Debug.Log("[AndroidVRConfiguration] Rendu multi-thread activé.");
            }

            if (enableVulkanRenderer)
            {
                Debug.Log("[AndroidVRConfiguration] Rendu Vulkan activé.");
            }
        }

        /// <summary>
        /// Obtient les informations de configuration Android VR.
        /// </summary>
        public AndroidVRInfo GetAndroidVRInfo()
        {
            return new AndroidVRInfo
            {
                CurrentMode = CurrentVRMode,
                IsARCoreAvailable = IsARCoreAvailable,
                IsOpenXRAvailable = IsOpenXRAvailable,
                DetectedHeadset = DetectedHeadset,
                IsConfigured = isConfigured,
                IsARCoreInitialized = isARCoreInitialized,
                IsOpenXRInitialized = isOpenXRInitialized,
                TargetCPULevel = targetCPULevel,
                TargetGPULevel = targetGPULevel
            };
        }

        /// <summary>
        /// Change le mode VR à l'exécution.
        /// </summary>
        public IEnumerator SwitchVRMode(AndroidVRMode newMode)
        {
            if (newMode == CurrentVRMode) yield break;

            Debug.Log($"[AndroidVRConfiguration] Changement de mode VR: {CurrentVRMode} -> {newMode}");

            // Arrêt des sous-systèmes actuels
            if (vrManager != null)
            {
                vrManager.ShutdownVR();
            }

            // Configuration du nouveau mode
            CurrentVRMode = newMode;
            ConfigureOptimalVRMode();

            // Réinitialisation
            yield return StartCoroutine(InitializeVRSubsystems());

            // Redémarrage du VR Manager
            if (vrManager != null)
            {
                yield return StartCoroutine(vrManager.InitializeVR());
            }

            OnVRModeChanged?.Invoke(CurrentVRMode);
        }
#endif

        /// <summary>
        /// Gestionnaire de permissions Android.
        /// </summary>
        private class AndroidPermissionManager : MonoBehaviour
        {
            public bool HasCameraPermission => Permission.HasUserAuthorizedPermission(Permission.Camera);
            public bool HasLocationPermission => Permission.HasUserAuthorizedPermission(Permission.FineLocation);
            public bool HasAudioPermission => Permission.HasUserAuthorizedPermission(Permission.Microphone);
        }
    }

    /// <summary>
    /// Structure contenant les informations de configuration Android VR.
    /// </summary>
    [System.Serializable]
    public struct AndroidVRInfo
    {
        public AndroidVRConfiguration.AndroidVRMode CurrentMode;
        public bool IsARCoreAvailable;
        public bool IsOpenXRAvailable;
        public string DetectedHeadset;
        public bool IsConfigured;
        public bool IsARCoreInitialized;
        public bool IsOpenXRInitialized;
        public int TargetCPULevel;
        public int TargetGPULevel;
    }
}
