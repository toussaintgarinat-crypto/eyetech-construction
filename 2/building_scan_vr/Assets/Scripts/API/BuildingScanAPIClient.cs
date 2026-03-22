using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using System.Text;
using System.IO;

namespace BuildingScanVR.API
{
    /// <summary>
    /// Client API pour l'intégration avec le backend Building Scan.
    /// Permet de récupérer les modèles 3D, sessions de scan et données utilisateur.
    /// </summary>
    public class BuildingScanAPIClient : MonoBehaviour
    {
        [Header("API Configuration")]
        [SerializeField] private string baseURL = "http://localhost:8000/api";
        [SerializeField] private string authToken = "";
        [SerializeField] private float requestTimeout = 30f;
        [SerializeField] private int maxRetryAttempts = 3;
        [SerializeField] private float retryDelay = 2f;

        [Header("Authentication")]
        [SerializeField] private bool autoAuthenticate = true;
        [SerializeField] private string username = "";
        [SerializeField] private string password = "";
        [SerializeField] private bool rememberCredentials = true;

        [Header("Caching")]
        [SerializeField] private bool enableCaching = true;
        [SerializeField] private float cacheExpiration = 3600f; // 1 heure
        [SerializeField] private int maxCacheSize = 100; // MB
        [SerializeField] private bool offlineMode = false;

        // Événements
        public System.Action<string> OnAuthenticationSuccess;
        public System.Action<string> OnAuthenticationFailed;
        public System.Action<List<ScanSession>> OnScanSessionsLoaded;
        public System.Action<ScanSession> OnScanSessionLoaded;
        public System.Action<BuildingScanModel> OnModelLoaded;
        public System.Action<string> OnAPIError;
        public System.Action<float> OnDownloadProgress;

        // Propriétés publiques
        public bool IsAuthenticated { get; private set; }
        public string CurrentToken { get; private set; }
        public UserProfile CurrentUser { get; private set; }
        public bool IsOnline { get; private set; }

        // Cache des données
        private Dictionary<string, CachedData> dataCache = new Dictionary<string, CachedData>();
        private Dictionary<string, Texture2D> imageCache = new Dictionary<string, Texture2D>();
        private Dictionary<string, AudioClip> audioCache = new Dictionary<string, AudioClip>();

        // État des requêtes
        private Dictionary<string, UnityWebRequest> activeRequests = new Dictionary<string, UnityWebRequest>();
        private Queue<APIRequest> requestQueue = new Queue<APIRequest>();
        private bool isProcessingQueue = false;

        private void Awake()
        {
            // Chargement des credentials sauvegardés
            if (rememberCredentials)
            {
                LoadSavedCredentials();
            }

            // Vérification de la connectivité
            StartCoroutine(CheckConnectivity());
        }

        private void Start()
        {
            if (autoAuthenticate && !string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                Authenticate(username, password);
            }
        }

        /// <summary>
        /// Vérifie la connectivité réseau.
        /// </summary>
        private IEnumerator CheckConnectivity()
        {
            while (true)
            {
                UnityWebRequest request = UnityWebRequest.Get(baseURL + "/health");
                request.timeout = 5;
                
                yield return request.SendWebRequest();
                
                IsOnline = request.result == UnityWebRequest.Result.Success;
                
                if (!IsOnline && !offlineMode)
                {
                    Debug.LogWarning("[BuildingScanAPIClient] Connexion réseau indisponible.");
                }

                request.Dispose();
                yield return new WaitForSeconds(30f); // Vérification toutes les 30 secondes
            }
        }

        /// <summary>
        /// Authentifie l'utilisateur auprès du backend.
        /// </summary>
        public void Authenticate(string user, string pass)
        {
            StartCoroutine(AuthenticateCoroutine(user, pass));
        }

        /// <summary>
        /// Coroutine d'authentification.
        /// </summary>
        private IEnumerator AuthenticateCoroutine(string user, string pass)
        {
            Debug.Log("[BuildingScanAPIClient] Tentative d'authentification...");

            AuthRequest authRequest = new AuthRequest
            {
                username = user,
                password = pass
            };

            string jsonData = JsonUtility.ToJson(authRequest);
            
            using (UnityWebRequest request = new UnityWebRequest(baseURL + "/auth/login", "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.timeout = (int)requestTimeout;

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        AuthResponse response = JsonUtility.FromJson<AuthResponse>(request.downloadHandler.text);
                        
                        CurrentToken = response.access_token;
                        authToken = CurrentToken;
                        IsAuthenticated = true;
                        
                        // Sauvegarde des credentials si demandé
                        if (rememberCredentials)
                        {
                            SaveCredentials(user, pass);
                        }

                        // Chargement du profil utilisateur
                        yield return StartCoroutine(LoadUserProfile());

                        OnAuthenticationSuccess?.Invoke(CurrentToken);
                        Debug.Log("[BuildingScanAPIClient] Authentification réussie.");
                    }
                    catch (System.Exception e)
                    {
                        Debug.LogError($"[BuildingScanAPIClient] Erreur de parsing de la réponse d'authentification: {e.Message}");
                        OnAuthenticationFailed?.Invoke("Erreur de parsing de la réponse");
                    }
                }
                else
                {
                    string error = $"Erreur d'authentification: {request.error}";
                    Debug.LogError($"[BuildingScanAPIClient] {error}");
                    OnAuthenticationFailed?.Invoke(error);
                }
            }
        }

        /// <summary>
        /// Charge le profil de l'utilisateur actuel.
        /// </summary>
        private IEnumerator LoadUserProfile()
        {
            using (UnityWebRequest request = CreateAuthenticatedRequest(baseURL + "/auth/user", "GET"))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        CurrentUser = JsonUtility.FromJson<UserProfile>(request.downloadHandler.text);
                        Debug.Log($"[BuildingScanAPIClient] Profil utilisateur chargé: {CurrentUser.username}");
                    }
                    catch (System.Exception e)
                    {
                        Debug.LogError($"[BuildingScanAPIClient] Erreur de chargement du profil: {e.Message}");
                    }
                }
            }
        }

        /// <summary>
        /// Récupère la liste des sessions de scan.
        /// </summary>
        public void GetScanSessions()
        {
            StartCoroutine(GetScanSessionsCoroutine());
        }

        /// <summary>
        /// Coroutine de récupération des sessions de scan.
        /// </summary>
        private IEnumerator GetScanSessionsCoroutine()
        {
            string cacheKey = "scan_sessions";
            
            // Vérification du cache
            if (enableCaching && TryGetFromCache<List<ScanSession>>(cacheKey, out List<ScanSession> cachedSessions))
            {
                OnScanSessionsLoaded?.Invoke(cachedSessions);
                yield break;
            }

            if (!IsOnline && offlineMode)
            {
                Debug.LogWarning("[BuildingScanAPIClient] Mode hors ligne - données non disponibles.");
                yield break;
            }

            using (UnityWebRequest request = CreateAuthenticatedRequest(baseURL + "/scan-sessions/", "GET"))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        ScanSessionsResponse response = JsonUtility.FromJson<ScanSessionsResponse>(request.downloadHandler.text);
                        
                        // Mise en cache
                        if (enableCaching)
                        {
                            CacheData(cacheKey, response.results);
                        }

                        OnScanSessionsLoaded?.Invoke(response.results);
                        Debug.Log($"[BuildingScanAPIClient] {response.results.Count} sessions de scan chargées.");
                    }
                    catch (System.Exception e)
                    {
                        Debug.LogError($"[BuildingScanAPIClient] Erreur de parsing des sessions: {e.Message}");
                        OnAPIError?.Invoke("Erreur de parsing des sessions");
                    }
                }
                else
                {
                    HandleRequestError(request, "Erreur de chargement des sessions");
                }
            }
        }

        /// <summary>
        /// Récupère une session de scan spécifique.
        /// </summary>
        public void GetScanSession(int sessionId)
        {
            StartCoroutine(GetScanSessionCoroutine(sessionId));
        }

        /// <summary>
        /// Coroutine de récupération d'une session de scan.
        /// </summary>
        private IEnumerator GetScanSessionCoroutine(int sessionId)
        {
            string cacheKey = $"scan_session_{sessionId}";
            
            // Vérification du cache
            if (enableCaching && TryGetFromCache<ScanSession>(cacheKey, out ScanSession cachedSession))
            {
                OnScanSessionLoaded?.Invoke(cachedSession);
                yield break;
            }

            using (UnityWebRequest request = CreateAuthenticatedRequest($"{baseURL}/scan-sessions/{sessionId}/", "GET"))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        ScanSession session = JsonUtility.FromJson<ScanSession>(request.downloadHandler.text);
                        
                        // Mise en cache
                        if (enableCaching)
                        {
                            CacheData(cacheKey, session);
                        }

                        OnScanSessionLoaded?.Invoke(session);
                        Debug.Log($"[BuildingScanAPIClient] Session {sessionId} chargée: {session.name}");
                    }
                    catch (System.Exception e)
                    {
                        Debug.LogError($"[BuildingScanAPIClient] Erreur de parsing de la session: {e.Message}");
                        OnAPIError?.Invoke("Erreur de parsing de la session");
                    }
                }
                else
                {
                    HandleRequestError(request, $"Erreur de chargement de la session {sessionId}");
                }
            }
        }

        /// <summary>
        /// Télécharge un modèle 3D.
        /// </summary>
        public void DownloadModel(string modelUrl, string modelId)
        {
            StartCoroutine(DownloadModelCoroutine(modelUrl, modelId));
        }

        /// <summary>
        /// Coroutine de téléchargement de modèle 3D.
        /// </summary>
        private IEnumerator DownloadModelCoroutine(string modelUrl, string modelId)
        {
            string cacheKey = $"model_{modelId}";
            
            // Vérification du cache local
            string localPath = GetModelCachePath(modelId);
            if (File.Exists(localPath))
            {
                Debug.Log($"[BuildingScanAPIClient] Modèle trouvé en cache: {localPath}");
                
                BuildingScanModel model = new BuildingScanModel
                {
                    Id = modelId,
                    LocalPath = localPath,
                    IsFromCache = true
                };
                
                OnModelLoaded?.Invoke(model);
                yield break;
            }

            using (UnityWebRequest request = CreateAuthenticatedRequest(modelUrl, "GET"))
            {
                request.downloadHandler = new DownloadHandlerBuffer();
                
                var operation = request.SendWebRequest();
                
                // Suivi du progrès de téléchargement
                while (!operation.isDone)
                {
                    OnDownloadProgress?.Invoke(request.downloadProgress);
                    yield return null;
                }

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        // Sauvegarde du fichier en cache
                        Directory.CreateDirectory(Path.GetDirectoryName(localPath));
                        File.WriteAllBytes(localPath, request.downloadHandler.data);

                        BuildingScanModel model = new BuildingScanModel
                        {
                            Id = modelId,
                            LocalPath = localPath,
                            IsFromCache = false,
                            FileSizeMB = request.downloadHandler.data.Length / (1024f * 1024f)
                        };

                        OnModelLoaded?.Invoke(model);
                        Debug.Log($"[BuildingScanAPIClient] Modèle téléchargé: {localPath}");
                    }
                    catch (System.Exception e)
                    {
                        Debug.LogError($"[BuildingScanAPIClient] Erreur de sauvegarde du modèle: {e.Message}");
                        OnAPIError?.Invoke("Erreur de sauvegarde du modèle");
                    }
                }
                else
                {
                    HandleRequestError(request, "Erreur de téléchargement du modèle");
                }
            }
        }

        /// <summary>
        /// Upload des données d'analyse (mesures, annotations).
        /// </summary>
        public void UploadAnalysisData(int sessionId, AnalysisData analysisData)
        {
            StartCoroutine(UploadAnalysisDataCoroutine(sessionId, analysisData));
        }

        /// <summary>
        /// Coroutine d'upload des données d'analyse.
        /// </summary>
        private IEnumerator UploadAnalysisDataCoroutine(int sessionId, AnalysisData analysisData)
        {
            string jsonData = JsonUtility.ToJson(analysisData);
            
            using (UnityWebRequest request = new UnityWebRequest($"{baseURL}/scan-sessions/{sessionId}/analysis/", "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.SetRequestHeader("Authorization", $"Bearer {authToken}");
                request.timeout = (int)requestTimeout;

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    Debug.Log("[BuildingScanAPIClient] Données d'analyse uploadées avec succès.");
                }
                else
                {
                    HandleRequestError(request, "Erreur d'upload des données d'analyse");
                }
            }
        }

        /// <summary>
        /// Synchronise les données de collaboration.
        /// </summary>
        public void SyncCollaborationData(CollaborationSyncData syncData)
        {
            StartCoroutine(SyncCollaborationDataCoroutine(syncData));
        }

        /// <summary>
        /// Coroutine de synchronisation des données de collaboration.
        /// </summary>
        private IEnumerator SyncCollaborationDataCoroutine(CollaborationSyncData syncData)
        {
            string jsonData = JsonUtility.ToJson(syncData);
            
            using (UnityWebRequest request = new UnityWebRequest($"{baseURL}/collaboration/sync/", "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.SetRequestHeader("Authorization", $"Bearer {authToken}");
                request.timeout = (int)requestTimeout;

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    Debug.Log("[BuildingScanAPIClient] Données de collaboration synchronisées.");
                }
                else
                {
                    HandleRequestError(request, "Erreur de synchronisation de collaboration");
                }
            }
        }

        /// <summary>
        /// Crée une requête authentifiée.
        /// </summary>
        private UnityWebRequest CreateAuthenticatedRequest(string url, string method)
        {
            UnityWebRequest request = new UnityWebRequest(url, method);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.timeout = (int)requestTimeout;
            
            if (IsAuthenticated && !string.IsNullOrEmpty(authToken))
            {
                request.SetRequestHeader("Authorization", $"Bearer {authToken}");
            }
            
            return request;
        }

        /// <summary>
        /// Gère les erreurs de requête.
        /// </summary>
        private void HandleRequestError(UnityWebRequest request, string context)
        {
            string errorMessage = $"{context}: {request.error}";
            
            if (request.responseCode == 401)
            {
                // Token expiré, tentative de re-authentification
                IsAuthenticated = false;
                errorMessage = "Token d'authentification expiré";
                
                if (autoAuthenticate && !string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    Authenticate(username, password);
                }
            }
            
            Debug.LogError($"[BuildingScanAPIClient] {errorMessage}");
            OnAPIError?.Invoke(errorMessage);
        }

        /// <summary>
        /// Met en cache des données.
        /// </summary>
        private void CacheData<T>(string key, T data)
        {
            if (!enableCaching) return;

            CachedData cachedData = new CachedData
            {
                Data = JsonUtility.ToJson(data),
                Timestamp = System.DateTime.Now,
                Type = typeof(T).Name
            };

            dataCache[key] = cachedData;
            
            // Nettoyage du cache si nécessaire
            CleanupCache();
        }

        /// <summary>
        /// Récupère des données du cache.
        /// </summary>
        private bool TryGetFromCache<T>(string key, out T data)
        {
            data = default(T);
            
            if (!enableCaching || !dataCache.ContainsKey(key))
                return false;

            CachedData cachedData = dataCache[key];
            
            // Vérification de l'expiration
            if ((System.DateTime.Now - cachedData.Timestamp).TotalSeconds > cacheExpiration)
            {
                dataCache.Remove(key);
                return false;
            }

            try
            {
                data = JsonUtility.FromJson<T>(cachedData.Data);
                return true;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[BuildingScanAPIClient] Erreur de désérialisation du cache: {e.Message}");
                dataCache.Remove(key);
                return false;
            }
        }

        /// <summary>
        /// Nettoie le cache expiré.
        /// </summary>
        private void CleanupCache()
        {
            List<string> expiredKeys = new List<string>();
            
            foreach (var kvp in dataCache)
            {
                if ((System.DateTime.Now - kvp.Value.Timestamp).TotalSeconds > cacheExpiration)
                {
                    expiredKeys.Add(kvp.Key);
                }
            }

            foreach (string key in expiredKeys)
            {
                dataCache.Remove(key);
            }
        }

        /// <summary>
        /// Obtient le chemin de cache pour un modèle.
        /// </summary>
        private string GetModelCachePath(string modelId)
        {
            return Path.Combine(Application.persistentDataPath, "ModelCache", $"{modelId}.glb");
        }

        /// <summary>
        /// Sauvegarde les credentials.
        /// </summary>
        private void SaveCredentials(string user, string pass)
        {
            PlayerPrefs.SetString("BuildingScan_Username", user);
            PlayerPrefs.SetString("BuildingScan_Password", pass);
            PlayerPrefs.Save();
        }

        /// <summary>
        /// Charge les credentials sauvegardés.
        /// </summary>
        private void LoadSavedCredentials()
        {
            if (PlayerPrefs.HasKey("BuildingScan_Username"))
            {
                username = PlayerPrefs.GetString("BuildingScan_Username");
                password = PlayerPrefs.GetString("BuildingScan_Password");
            }
        }

        /// <summary>
        /// Vide le cache.
        /// </summary>
        public void ClearCache()
        {
            dataCache.Clear();
            imageCache.Clear();
            audioCache.Clear();
            
            // Suppression des fichiers de cache
            string cacheDir = Path.Combine(Application.persistentDataPath, "ModelCache");
            if (Directory.Exists(cacheDir))
            {
                Directory.Delete(cacheDir, true);
            }
            
            Debug.Log("[BuildingScanAPIClient] Cache vidé.");
        }

        /// <summary>
        /// Déconnecte l'utilisateur.
        /// </summary>
        public void Logout()
        {
            IsAuthenticated = false;
            CurrentToken = "";
            authToken = "";
            CurrentUser = null;
            
            if (rememberCredentials)
            {
                PlayerPrefs.DeleteKey("BuildingScan_Username");
                PlayerPrefs.DeleteKey("BuildingScan_Password");
            }
            
            Debug.Log("[BuildingScanAPIClient] Utilisateur déconnecté.");
        }

        private void OnDestroy()
        {
            // Annulation des requêtes actives
            foreach (var request in activeRequests.Values)
            {
                if (request != null)
                {
                    request.Abort();
                    request.Dispose();
                }
            }
            activeRequests.Clear();
        }
    }

    // Classes de données pour l'API
    [System.Serializable]
    public class AuthRequest
    {
        public string username;
        public string password;
    }

    [System.Serializable]
    public class AuthResponse
    {
        public string access_token;
        public string refresh_token;
        public string token_type;
        public int expires_in;
    }

    [System.Serializable]
    public class UserProfile
    {
        public int id;
        public string username;
        public string email;
        public string first_name;
        public string last_name;
        public bool is_staff;
        public System.DateTime date_joined;
    }

    [System.Serializable]
    public class ScanSession
    {
        public int id;
        public string name;
        public string description;
        public System.DateTime created_at;
        public System.DateTime updated_at;
        public int user_id;
        public string status;
        public float progress;
        public ScanData scan_data;
        public List<string> model_files;
        public Dictionary<string, object> metadata;
    }

    [System.Serializable]
    public class ScanData
    {
        public int point_count;
        public int vertex_count;
        public int face_count;
        public float file_size_mb;
        public string processing_algorithm;
        public Vector3 bounding_box_min;
        public Vector3 bounding_box_max;
        public float scan_duration;
        public string device_info;
    }

    [System.Serializable]
    public class ScanSessionsResponse
    {
        public int count;
        public string next;
        public string previous;
        public List<ScanSession> results;
    }

    [System.Serializable]
    public class BuildingScanModel
    {
        public string Id;
        public string LocalPath;
        public bool IsFromCache;
        public float FileSizeMB;
        public string Format;
        public int VertexCount;
        public int FaceCount;
        public Vector3 BoundingBoxMin;
        public Vector3 BoundingBoxMax;
    }

    [System.Serializable]
    public class AnalysisData
    {
        public List<MeasurementData> measurements;
        public List<AnnotationData> annotations;
        public List<AnalysisResult> analysis_results;
        public System.DateTime timestamp;
        public string user_id;
        public string session_id;
    }

    [System.Serializable]
    public class MeasurementData
    {
        public Vector3 start_point;
        public Vector3 end_point;
        public float distance;
        public string measurement_type;
        public System.DateTime timestamp;
    }

    [System.Serializable]
    public class AnnotationData
    {
        public Vector3 position;
        public Vector3 normal;
        public string text;
        public string audio_file;
        public string annotation_type;
        public System.DateTime timestamp;
    }

    [System.Serializable]
    public class AnalysisResult
    {
        public string analysis_type;
        public Vector3 position;
        public string description;
        public float value;
        public Dictionary<string, object> metadata;
        public System.DateTime timestamp;
    }

    [System.Serializable]
    public class CollaborationSyncData
    {
        public string session_id;
        public string user_id;
        public List<object> sync_data;
        public System.DateTime timestamp;
    }

    [System.Serializable]
    public class CachedData
    {
        public string Data;
        public System.DateTime Timestamp;
        public string Type;
    }

    [System.Serializable]
    public class APIRequest
    {
        public string Url;
        public string Method;
        public string Data;
        public System.Action<string> OnSuccess;
        public System.Action<string> OnError;
    }
}
