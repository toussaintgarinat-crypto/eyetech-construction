using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using System.IO;

namespace BuildingScanVR.Networking
{
    /// <summary>
    /// Gestionnaire de collaboration multi-utilisateurs pour Building Scan VR.
    /// Permet à plusieurs utilisateurs de rejoindre la même session VR pour explorer et discuter d'un projet en temps réel.
    /// </summary>
    public class VRCollaborationManager : MonoBehaviour
    {
        [Header("Network Settings")]
        [SerializeField] private string serverURL = "ws://localhost:8080";
        [SerializeField] private int maxUsers = 8;
        [SerializeField] private float networkUpdateRate = 20f;
        [SerializeField] private bool enableVoiceChat = true;
        [SerializeField] private bool enableTextChat = true;
        [SerializeField] private bool enableScreenSharing = false;

        [Header("User Settings")]
        [SerializeField] private GameObject userAvatarPrefab;
        [SerializeField] private Material[] avatarMaterials;
        [SerializeField] private Color[] userColors;
        [SerializeField] private bool showUserNames = true;
        [SerializeField] private bool showUserPointers = true;

        [Header("Session Settings")]
        [SerializeField] private bool enableSessionRecording = false;
        [SerializeField] private bool enableSessionReplay = false;
        [SerializeField] private float sessionTimeout = 3600f; // 1 heure
        [SerializeField] private bool autoSaveSession = true;
        [SerializeField] private float autoSaveInterval = 300f; // 5 minutes

        [Header("Synchronization Settings")]
        [SerializeField] private bool syncModelTransforms = true;
        [SerializeField] private bool syncAnnotations = true;
        [SerializeField] private bool syncMeasurements = true;
        [SerializeField] private bool syncViewpoints = true;
        [SerializeField] private bool syncToolStates = true;

        [Header("Audio Settings")]
        [SerializeField] private AudioSource voiceChatSource;
        [SerializeField] private float voiceVolume = 0.8f;
        [SerializeField] private bool enableSpatialAudio = true;
        [SerializeField] private float maxVoiceDistance = 10f;
        [SerializeField] private AnimationCurve voiceDistanceCurve = AnimationCurve.Linear(0, 1, 1, 0);

        // Événements
        public System.Action<CollaborationSession> OnSessionJoined;
        public System.Action<CollaborationSession> OnSessionLeft;
        public System.Action<CollaborationUser> OnUserJoined;
        public System.Action<CollaborationUser> OnUserLeft;
        public System.Action<string, CollaborationUser> OnMessageReceived;
        public System.Action<NetworkError> OnNetworkError;
        public System.Action<SyncData> OnDataSynchronized;

        // Propriétés publiques
        public CollaborationSession CurrentSession { get; private set; }
        public CollaborationUser LocalUser { get; private set; }
        public List<CollaborationUser> RemoteUsers { get; private set; }
        public bool IsConnected { get; private set; }
        public bool IsSessionHost { get; private set; }
        public NetworkState ConnectionState { get; private set; }

        // Références
        private WebSocketClient webSocketClient;
        private AudioSource audioSource;
        private VRAnalysisTools analysisTools;
        private Model3DViewer model3DViewer;
        private VirtualTourManager tourManager;

        // État de la collaboration
        private Dictionary<string, GameObject> userAvatars = new Dictionary<string, GameObject>();
        private Dictionary<string, CollaborationUser> connectedUsers = new Dictionary<string, CollaborationUser>();
        private Queue<NetworkMessage> messageQueue = new Queue<NetworkMessage>();
        private Coroutine networkUpdateCoroutine;
        private Coroutine sessionRecordingCoroutine;

        // Synchronisation
        private float lastNetworkUpdate = 0f;
        private float networkUpdateInterval;
        private List<SyncData> pendingSyncData = new List<SyncData>();

        public enum NetworkState
        {
            Disconnected,
            Connecting,
            Connected,
            Reconnecting,
            Error
        }

        private void Awake()
        {
            // Initialisation des composants
            RemoteUsers = new List<CollaborationUser>();
            networkUpdateInterval = 1f / networkUpdateRate;

            // Recherche des composants
            audioSource = GetComponent<AudioSource>() ?? gameObject.AddComponent<AudioSource>();
            analysisTools = FindObjectOfType<VRAnalysisTools>();
            model3DViewer = FindObjectOfType<Model3DViewer>();
            tourManager = FindObjectOfType<VirtualTourManager>();

            // Configuration de l'audio
            ConfigureAudioSettings();

            // Initialisation du client WebSocket
            InitializeWebSocketClient();
        }

        private void Start()
        {
            // Création de l'utilisateur local
            CreateLocalUser();

            // Abonnement aux événements des outils
            SubscribeToToolEvents();
        }

        private void Update()
        {
            // Traitement des messages réseau
            ProcessNetworkMessages();

            // Mise à jour de la synchronisation
            UpdateNetworkSync();
        }

        /// <summary>
        /// Configure les paramètres audio pour la collaboration.
        /// </summary>
        private void ConfigureAudioSettings()
        {
            if (voiceChatSource == null)
            {
                voiceChatSource = audioSource;
            }

            voiceChatSource.volume = voiceVolume;
            voiceChatSource.spatialBlend = enableSpatialAudio ? 1f : 0f;
            voiceChatSource.maxDistance = maxVoiceDistance;
            voiceChatSource.rolloffMode = AudioRolloffMode.Custom;
            voiceChatSource.SetCustomCurve(AudioSourceCurveType.CustomRolloff, voiceDistanceCurve);
        }

        /// <summary>
        /// Initialise le client WebSocket.
        /// </summary>
        private void InitializeWebSocketClient()
        {
            webSocketClient = gameObject.AddComponent<WebSocketClient>();
            webSocketClient.OnConnected += OnWebSocketConnected;
            webSocketClient.OnDisconnected += OnWebSocketDisconnected;
            webSocketClient.OnMessageReceived += OnWebSocketMessageReceived;
            webSocketClient.OnError += OnWebSocketError;
        }

        /// <summary>
        /// Crée l'utilisateur local.
        /// </summary>
        private void CreateLocalUser()
        {
            LocalUser = new CollaborationUser
            {
                Id = System.Guid.NewGuid().ToString(),
                Name = $"User_{Random.Range(1000, 9999)}",
                Color = userColors[Random.Range(0, userColors.Length)],
                IsLocal = true,
                Position = transform.position,
                Rotation = transform.rotation,
                JoinTime = System.DateTime.Now
            };

            Debug.Log($"[VRCollaborationManager] Utilisateur local créé: {LocalUser.Name}");
        }

        /// <summary>
        /// S'abonne aux événements des outils pour la synchronisation.
        /// </summary>
        private void SubscribeToToolEvents()
        {
            if (analysisTools != null)
            {
                analysisTools.OnMeasurementCompleted += OnMeasurementCompleted;
                analysisTools.OnAnnotationCreated += OnAnnotationCreated;
                analysisTools.OnToolChanged += OnToolChanged;
            }

            if (model3DViewer != null)
            {
                model3DViewer.OnModelLoaded += OnModelLoaded;
            }

            if (tourManager != null)
            {
                tourManager.OnWaypointReached += OnWaypointReached;
                tourManager.OnTourStarted += OnTourStarted;
            }
        }

        /// <summary>
        /// Rejoint une session de collaboration.
        /// </summary>
        public void JoinSession(string sessionId, string password = "")
        {
            if (IsConnected)
            {
                Debug.LogWarning("[VRCollaborationManager] Déjà connecté à une session.");
                return;
            }

            Debug.Log($"[VRCollaborationManager] Tentative de connexion à la session: {sessionId}");

            ConnectionState = NetworkState.Connecting;
            
            // Connexion au serveur WebSocket
            StartCoroutine(ConnectToSession(sessionId, password));
        }

        /// <summary>
        /// Crée une nouvelle session de collaboration.
        /// </summary>
        public void CreateSession(string sessionName, string password = "")
        {
            if (IsConnected)
            {
                Debug.LogWarning("[VRCollaborationManager] Déjà connecté à une session.");
                return;
            }

            Debug.Log($"[VRCollaborationManager] Création d'une nouvelle session: {sessionName}");

            IsSessionHost = true;
            ConnectionState = NetworkState.Connecting;

            StartCoroutine(CreateNewSession(sessionName, password));
        }

        /// <summary>
        /// Quitte la session actuelle.
        /// </summary>
        public void LeaveSession()
        {
            if (!IsConnected)
            {
                Debug.LogWarning("[VRCollaborationManager] Aucune session active.");
                return;
            }

            Debug.Log("[VRCollaborationManager] Quitter la session.");

            // Envoi du message de départ
            SendNetworkMessage(new NetworkMessage
            {
                Type = MessageType.UserLeft,
                SenderId = LocalUser.Id,
                Data = LocalUser
            });

            // Nettoyage
            CleanupSession();

            OnSessionLeft?.Invoke(CurrentSession);
        }

        /// <summary>
        /// Coroutine de connexion à une session.
        /// </summary>
        private IEnumerator ConnectToSession(string sessionId, string password)
        {
            // Connexion WebSocket
            yield return StartCoroutine(webSocketClient.Connect(serverURL));

            if (webSocketClient.IsConnected)
            {
                // Envoi de la demande de connexion
                JoinSessionRequest request = new JoinSessionRequest
                {
                    SessionId = sessionId,
                    Password = password,
                    User = LocalUser
                };

                SendNetworkMessage(new NetworkMessage
                {
                    Type = MessageType.JoinSession,
                    SenderId = LocalUser.Id,
                    Data = request
                });

                // Attente de la réponse
                float timeout = 10f;
                float elapsed = 0f;

                while (elapsed < timeout && ConnectionState == NetworkState.Connecting)
                {
                    elapsed += Time.deltaTime;
                    yield return null;
                }

                if (ConnectionState != NetworkState.Connected)
                {
                    Debug.LogError("[VRCollaborationManager] Échec de la connexion à la session.");
                    ConnectionState = NetworkState.Error;
                    OnNetworkError?.Invoke(new NetworkError { Message = "Timeout de connexion" });
                }
            }
            else
            {
                Debug.LogError("[VRCollaborationManager] Échec de la connexion WebSocket.");
                ConnectionState = NetworkState.Error;
                OnNetworkError?.Invoke(new NetworkError { Message = "Connexion WebSocket échouée" });
            }
        }

        /// <summary>
        /// Coroutine de création d'une nouvelle session.
        /// </summary>
        private IEnumerator CreateNewSession(string sessionName, string password)
        {
            // Connexion WebSocket
            yield return StartCoroutine(webSocketClient.Connect(serverURL));

            if (webSocketClient.IsConnected)
            {
                // Création de la session
                CurrentSession = new CollaborationSession
                {
                    Id = System.Guid.NewGuid().ToString(),
                    Name = sessionName,
                    Password = password,
                    HostId = LocalUser.Id,
                    CreatedAt = System.DateTime.Now,
                    MaxUsers = maxUsers
                };

                CreateSessionRequest request = new CreateSessionRequest
                {
                    Session = CurrentSession,
                    Host = LocalUser
                };

                SendNetworkMessage(new NetworkMessage
                {
                    Type = MessageType.CreateSession,
                    SenderId = LocalUser.Id,
                    Data = request
                });

                // La session est créée immédiatement pour l'hôte
                ConnectionState = NetworkState.Connected;
                IsConnected = true;

                // Démarrage des coroutines de mise à jour
                StartNetworkCoroutines();

                OnSessionJoined?.Invoke(CurrentSession);
                Debug.Log($"[VRCollaborationManager] Session créée: {CurrentSession.Id}");
            }
        }

        /// <summary>
        /// Démarre les coroutines réseau.
        /// </summary>
        private void StartNetworkCoroutines()
        {
            if (networkUpdateCoroutine == null)
            {
                networkUpdateCoroutine = StartCoroutine(NetworkUpdateLoop());
            }

            if (enableSessionRecording && sessionRecordingCoroutine == null)
            {
                sessionRecordingCoroutine = StartCoroutine(SessionRecordingLoop());
            }
        }

        /// <summary>
        /// Boucle de mise à jour réseau.
        /// </summary>
        private IEnumerator NetworkUpdateLoop()
        {
            while (IsConnected)
            {
                // Synchronisation de la position de l'utilisateur local
                SynchronizeLocalUser();

                // Traitement des données de synchronisation en attente
                ProcessPendingSyncData();

                yield return new WaitForSeconds(networkUpdateInterval);
            }
        }

        /// <summary>
        /// Boucle d'enregistrement de session.
        /// </summary>
        private IEnumerator SessionRecordingLoop()
        {
            while (IsConnected && enableSessionRecording)
            {
                // Enregistrement de l'état de la session
                RecordSessionState();

                yield return new WaitForSeconds(autoSaveInterval);
            }
        }

        /// <summary>
        /// Synchronise l'utilisateur local.
        /// </summary>
        private void SynchronizeLocalUser()
        {
            if (LocalUser == null) return;

            // Mise à jour de la position et rotation
            LocalUser.Position = transform.position;
            LocalUser.Rotation = transform.rotation;

            // Envoi de la mise à jour
            SendNetworkMessage(new NetworkMessage
            {
                Type = MessageType.UserUpdate,
                SenderId = LocalUser.Id,
                Data = LocalUser
            });
        }

        /// <summary>
        /// Traite les données de synchronisation en attente.
        /// </summary>
        private void ProcessPendingSyncData()
        {
            while (pendingSyncData.Count > 0)
            {
                SyncData data = pendingSyncData[0];
                pendingSyncData.RemoveAt(0);

                SendNetworkMessage(new NetworkMessage
                {
                    Type = MessageType.SyncData,
                    SenderId = LocalUser.Id,
                    Data = data
                });

                OnDataSynchronized?.Invoke(data);
            }
        }

        /// <summary>
        /// Traite les messages réseau.
        /// </summary>
        private void ProcessNetworkMessages()
        {
            while (messageQueue.Count > 0)
            {
                NetworkMessage message = messageQueue.Dequeue();
                ProcessNetworkMessage(message);
            }
        }

        /// <summary>
        /// Traite un message réseau.
        /// </summary>
        private void ProcessNetworkMessage(NetworkMessage message)
        {
            switch (message.Type)
            {
                case MessageType.SessionJoined:
                    HandleSessionJoined(message);
                    break;
                case MessageType.UserJoined:
                    HandleUserJoined(message);
                    break;
                case MessageType.UserLeft:
                    HandleUserLeft(message);
                    break;
                case MessageType.UserUpdate:
                    HandleUserUpdate(message);
                    break;
                case MessageType.ChatMessage:
                    HandleChatMessage(message);
                    break;
                case MessageType.VoiceData:
                    HandleVoiceData(message);
                    break;
                case MessageType.SyncData:
                    HandleSyncData(message);
                    break;
                case MessageType.Error:
                    HandleError(message);
                    break;
            }
        }

        /// <summary>
        /// Gère la confirmation de connexion à la session.
        /// </summary>
        private void HandleSessionJoined(NetworkMessage message)
        {
            SessionJoinedResponse response = (SessionJoinedResponse)message.Data;
            CurrentSession = response.Session;
            
            ConnectionState = NetworkState.Connected;
            IsConnected = true;

            // Ajout des utilisateurs existants
            foreach (CollaborationUser user in response.ExistingUsers)
            {
                if (user.Id != LocalUser.Id)
                {
                    AddRemoteUser(user);
                }
            }

            StartNetworkCoroutines();
            OnSessionJoined?.Invoke(CurrentSession);

            Debug.Log($"[VRCollaborationManager] Connecté à la session: {CurrentSession.Name}");
        }

        /// <summary>
        /// Gère l'arrivée d'un nouvel utilisateur.
        /// </summary>
        private void HandleUserJoined(NetworkMessage message)
        {
            CollaborationUser user = (CollaborationUser)message.Data;
            
            if (user.Id != LocalUser.Id)
            {
                AddRemoteUser(user);
                OnUserJoined?.Invoke(user);
                
                Debug.Log($"[VRCollaborationManager] Utilisateur rejoint: {user.Name}");
            }
        }

        /// <summary>
        /// Gère le départ d'un utilisateur.
        /// </summary>
        private void HandleUserLeft(NetworkMessage message)
        {
            CollaborationUser user = (CollaborationUser)message.Data;
            
            if (connectedUsers.ContainsKey(user.Id))
            {
                RemoveRemoteUser(user.Id);
                OnUserLeft?.Invoke(user);
                
                Debug.Log($"[VRCollaborationManager] Utilisateur parti: {user.Name}");
            }
        }

        /// <summary>
        /// Gère la mise à jour d'un utilisateur.
        /// </summary>
        private void HandleUserUpdate(NetworkMessage message)
        {
            CollaborationUser user = (CollaborationUser)message.Data;
            
            if (connectedUsers.ContainsKey(user.Id))
            {
                UpdateRemoteUser(user);
            }
        }

        /// <summary>
        /// Gère les messages de chat.
        /// </summary>
        private void HandleChatMessage(NetworkMessage message)
        {
            ChatMessage chatMessage = (ChatMessage)message.Data;
            
            if (connectedUsers.ContainsKey(chatMessage.SenderId))
            {
                CollaborationUser sender = connectedUsers[chatMessage.SenderId];
                OnMessageReceived?.Invoke(chatMessage.Content, sender);
                
                Debug.Log($"[VRCollaborationManager] Message de {sender.Name}: {chatMessage.Content}");
            }
        }

        /// <summary>
        /// Gère les données vocales.
        /// </summary>
        private void HandleVoiceData(NetworkMessage message)
        {
            VoiceData voiceData = (VoiceData)message.Data;
            
            if (enableVoiceChat && connectedUsers.ContainsKey(voiceData.SenderId))
            {
                PlayVoiceData(voiceData);
            }
        }

        /// <summary>
        /// Gère les données de synchronisation.
        /// </summary>
        private void HandleSyncData(NetworkMessage message)
        {
            SyncData syncData = (SyncData)message.Data;
            ApplySyncData(syncData);
        }

        /// <summary>
        /// Gère les erreurs réseau.
        /// </summary>
        private void HandleError(NetworkMessage message)
        {
            NetworkError error = (NetworkError)message.Data;
            OnNetworkError?.Invoke(error);
            
            Debug.LogError($"[VRCollaborationManager] Erreur réseau: {error.Message}");
        }

        /// <summary>
        /// Ajoute un utilisateur distant.
        /// </summary>
        private void AddRemoteUser(CollaborationUser user)
        {
            connectedUsers[user.Id] = user;
            RemoteUsers.Add(user);
            
            // Création de l'avatar
            CreateUserAvatar(user);
        }

        /// <summary>
        /// Supprime un utilisateur distant.
        /// </summary>
        private void RemoveRemoteUser(string userId)
        {
            if (connectedUsers.ContainsKey(userId))
            {
                CollaborationUser user = connectedUsers[userId];
                connectedUsers.Remove(userId);
                RemoteUsers.Remove(user);
                
                // Suppression de l'avatar
                DestroyUserAvatar(userId);
            }
        }

        /// <summary>
        /// Met à jour un utilisateur distant.
        /// </summary>
        private void UpdateRemoteUser(CollaborationUser user)
        {
            connectedUsers[user.Id] = user;
            
            // Mise à jour de l'avatar
            UpdateUserAvatar(user);
        }

        /// <summary>
        /// Crée l'avatar d'un utilisateur.
        /// </summary>
        private void CreateUserAvatar(CollaborationUser user)
        {
            GameObject avatar;
            
            if (userAvatarPrefab != null)
            {
                avatar = Instantiate(userAvatarPrefab);
            }
            else
            {
                // Avatar par défaut
                avatar = GameObject.CreatePrimitive(PrimitiveType.Capsule);
                avatar.transform.localScale = new Vector3(0.5f, 1f, 0.5f);
            }

            avatar.name = $"Avatar_{user.Name}";
            avatar.transform.position = user.Position;
            avatar.transform.rotation = user.Rotation;

            // Configuration de la couleur
            Renderer renderer = avatar.GetComponent<Renderer>();
            if (renderer != null)
            {
                Material material = new Material(Shader.Find("Standard"));
                material.color = user.Color;
                renderer.material = material;
            }

            // Ajout du nom d'utilisateur
            if (showUserNames)
            {
                CreateUserNameLabel(avatar, user.Name);
            }

            userAvatars[user.Id] = avatar;
        }

        /// <summary>
        /// Met à jour l'avatar d'un utilisateur.
        /// </summary>
        private void UpdateUserAvatar(CollaborationUser user)
        {
            if (userAvatars.ContainsKey(user.Id))
            {
                GameObject avatar = userAvatars[user.Id];
                avatar.transform.position = user.Position;
                avatar.transform.rotation = user.Rotation;
            }
        }

        /// <summary>
        /// Détruit l'avatar d'un utilisateur.
        /// </summary>
        private void DestroyUserAvatar(string userId)
        {
            if (userAvatars.ContainsKey(userId))
            {
                DestroyImmediate(userAvatars[userId]);
                userAvatars.Remove(userId);
            }
        }

        /// <summary>
        /// Crée un label de nom d'utilisateur.
        /// </summary>
        private void CreateUserNameLabel(GameObject avatar, string userName)
        {
            GameObject labelObj = new GameObject("UserNameLabel");
            labelObj.transform.SetParent(avatar.transform);
            labelObj.transform.localPosition = Vector3.up * 1.2f;

            Canvas canvas = labelObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;

            UnityEngine.UI.Text label = labelObj.AddComponent<UnityEngine.UI.Text>();
            label.text = userName;
            label.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            label.fontSize = 24;
            label.color = Color.white;
            label.alignment = TextAnchor.MiddleCenter;

            RectTransform rectTransform = labelObj.GetComponent<RectTransform>();
            rectTransform.sizeDelta = new Vector2(200, 50);
        }

        /// <summary>
        /// Lit les données vocales.
        /// </summary>
        private void PlayVoiceData(VoiceData voiceData)
        {
            // Implémentation de la lecture audio
            if (voiceChatSource != null && voiceData.AudioClip != null)
            {
                voiceChatSource.PlayOneShot(voiceData.AudioClip);
            }
        }

        /// <summary>
        /// Applique les données de synchronisation.
        /// </summary>
        private void ApplySyncData(SyncData syncData)
        {
            switch (syncData.Type)
            {
                case SyncType.Measurement:
                    ApplyMeasurementSync(syncData);
                    break;
                case SyncType.Annotation:
                    ApplyAnnotationSync(syncData);
                    break;
                case SyncType.ModelTransform:
                    ApplyModelTransformSync(syncData);
                    break;
                case SyncType.Viewpoint:
                    ApplyViewpointSync(syncData);
                    break;
            }
        }

        /// <summary>
        /// Applique la synchronisation des mesures.
        /// </summary>
        private void ApplyMeasurementSync(SyncData syncData)
        {
            // Implémentation de la synchronisation des mesures
            Debug.Log("[VRCollaborationManager] Synchronisation de mesure reçue.");
        }

        /// <summary>
        /// Applique la synchronisation des annotations.
        /// </summary>
        private void ApplyAnnotationSync(SyncData syncData)
        {
            // Implémentation de la synchronisation des annotations
            Debug.Log("[VRCollaborationManager] Synchronisation d'annotation reçue.");
        }

        /// <summary>
        /// Applique la synchronisation des transformations de modèle.
        /// </summary>
        private void ApplyModelTransformSync(SyncData syncData)
        {
            // Implémentation de la synchronisation des transformations
            Debug.Log("[VRCollaborationManager] Synchronisation de transformation reçue.");
        }

        /// <summary>
        /// Applique la synchronisation des points de vue.
        /// </summary>
        private void ApplyViewpointSync(SyncData syncData)
        {
            // Implémentation de la synchronisation des points de vue
            Debug.Log("[VRCollaborationManager] Synchronisation de point de vue reçue.");
        }

        /// <summary>
        /// Envoie un message réseau.
        /// </summary>
        private void SendNetworkMessage(NetworkMessage message)
        {
            if (webSocketClient != null && webSocketClient.IsConnected)
            {
                string json = JsonUtility.ToJson(message);
                webSocketClient.SendMessage(json);
            }
        }

        /// <summary>
        /// Envoie un message de chat.
        /// </summary>
        public void SendChatMessage(string content)
        {
            if (!IsConnected || !enableTextChat) return;

            ChatMessage chatMessage = new ChatMessage
            {
                SenderId = LocalUser.Id,
                Content = content,
                Timestamp = System.DateTime.Now
            };

            SendNetworkMessage(new NetworkMessage
            {
                Type = MessageType.ChatMessage,
                SenderId = LocalUser.Id,
                Data = chatMessage
            });
        }

        /// <summary>
        /// Enregistre l'état de la session.
        /// </summary>
        private void RecordSessionState()
        {
            if (!enableSessionRecording) return;

            SessionState state = new SessionState
            {
                Timestamp = System.DateTime.Now,
                Users = new List<CollaborationUser>(connectedUsers.Values),
                ModelState = GetCurrentModelState(),
                Measurements = analysisTools?.Measurements,
                Annotations = analysisTools?.Annotations
            };

            // Sauvegarde de l'état
            string json = JsonUtility.ToJson(state);
            string filename = $"Session_{CurrentSession.Id}_{state.Timestamp:yyyyMMdd_HHmmss}.json";
            string path = Path.Combine(Application.persistentDataPath, filename);
            File.WriteAllText(path, json);
        }

        /// <summary>
        /// Obtient l'état actuel du modèle.
        /// </summary>
        private ModelState GetCurrentModelState()
        {
            if (model3DViewer?.CurrentModel != null)
            {
                Transform modelTransform = model3DViewer.CurrentModel.transform;
                return new ModelState
                {
                    Position = modelTransform.position,
                    Rotation = modelTransform.rotation,
                    Scale = modelTransform.localScale
                };
            }
            return null;
        }

        /// <summary>
        /// Nettoie la session.
        /// </summary>
        private void CleanupSession()
        {
            IsConnected = false;
            ConnectionState = NetworkState.Disconnected;

            // Arrêt des coroutines
            if (networkUpdateCoroutine != null)
            {
                StopCoroutine(networkUpdateCoroutine);
                networkUpdateCoroutine = null;
            }

            if (sessionRecordingCoroutine != null)
            {
                StopCoroutine(sessionRecordingCoroutine);
                sessionRecordingCoroutine = null;
            }

            // Nettoyage des avatars
            foreach (GameObject avatar in userAvatars.Values)
            {
                if (avatar != null)
                {
                    DestroyImmediate(avatar);
                }
            }
            userAvatars.Clear();

            // Nettoyage des utilisateurs
            connectedUsers.Clear();
            RemoteUsers.Clear();

            // Déconnexion WebSocket
            if (webSocketClient != null)
            {
                webSocketClient.Disconnect();
            }

            CurrentSession = null;
            IsSessionHost = false;
        }

        // Gestionnaires d'événements des outils
        private void OnMeasurementCompleted(MeasurementResult measurement)
        {
            if (syncMeasurements)
            {
                SyncData syncData = new SyncData
                {
                    Type = SyncType.Measurement,
                    Data = measurement,
                    Timestamp = System.DateTime.Now,
                    SenderId = LocalUser.Id
                };
                pendingSyncData.Add(syncData);
            }
        }

        private void OnAnnotationCreated(AnnotationData annotation)
        {
            if (syncAnnotations)
            {
                SyncData syncData = new SyncData
                {
                    Type = SyncType.Annotation,
                    Data = annotation,
                    Timestamp = System.DateTime.Now,
                    SenderId = LocalUser.Id
                };
                pendingSyncData.Add(syncData);
            }
        }

        private void OnToolChanged(AnalysisTool tool)
        {
            if (syncToolStates)
            {
                SyncData syncData = new SyncData
                {
                    Type = SyncType.ToolState,
                    Data = tool,
                    Timestamp = System.DateTime.Now,
                    SenderId = LocalUser.Id
                };
                pendingSyncData.Add(syncData);
            }
        }

        private void OnModelLoaded(GameObject model)
        {
            if (syncModelTransforms)
            {
                ModelState modelState = new ModelState
                {
                    Position = model.transform.position,
                    Rotation = model.transform.rotation,
                    Scale = model.transform.localScale
                };

                SyncData syncData = new SyncData
                {
                    Type = SyncType.ModelTransform,
                    Data = modelState,
                    Timestamp = System.DateTime.Now,
                    SenderId = LocalUser.Id
                };
                pendingSyncData.Add(syncData);
            }
        }

        private void OnWaypointReached(TourWaypoint waypoint)
        {
            if (syncViewpoints)
            {
                ViewpointData viewpoint = new ViewpointData
                {
                    Position = waypoint.Position,
                    Rotation = waypoint.Rotation,
                    Name = waypoint.Name
                };

                SyncData syncData = new SyncData
                {
                    Type = SyncType.Viewpoint,
                    Data = viewpoint,
                    Timestamp = System.DateTime.Now,
                    SenderId = LocalUser.Id
                };
                pendingSyncData.Add(syncData);
            }
        }

        private void OnTourStarted(VirtualTour tour)
        {
            // Synchronisation du démarrage de visite
            SyncData syncData = new SyncData
            {
                Type = SyncType.TourState,
                Data = tour,
                Timestamp = System.DateTime.Now,
                SenderId = LocalUser.Id
            };
            pendingSyncData.Add(syncData);
        }

        // Gestionnaires d'événements WebSocket
        private void OnWebSocketConnected()
        {
            Debug.Log("[VRCollaborationManager] WebSocket connecté.");
        }

        private void OnWebSocketDisconnected()
        {
            Debug.Log("[VRCollaborationManager] WebSocket déconnecté.");
            ConnectionState = NetworkState.Disconnected;
        }

        private void OnWebSocketMessageReceived(string message)
        {
            try
            {
                NetworkMessage networkMessage = JsonUtility.FromJson<NetworkMessage>(message);
                messageQueue.Enqueue(networkMessage);
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[VRCollaborationManager] Erreur de parsing du message: {e.Message}");
            }
        }

        private void OnWebSocketError(string error)
        {
            Debug.LogError($"[VRCollaborationManager] Erreur WebSocket: {error}");
            ConnectionState = NetworkState.Error;
            OnNetworkError?.Invoke(new NetworkError { Message = error });
        }

        /// <summary>
        /// Met à jour la synchronisation réseau.
        /// </summary>
        private void UpdateNetworkSync()
        {
            if (Time.time - lastNetworkUpdate >= networkUpdateInterval)
            {
                lastNetworkUpdate = Time.time;
                // Logique de synchronisation périodique
            }
        }

        private void OnDestroy()
        {
            LeaveSession();
        }
    }

    // Classes de données pour la collaboration
    [System.Serializable]
    public class CollaborationSession
    {
        public string Id;
        public string Name;
        public string Password;
        public string HostId;
        public System.DateTime CreatedAt;
        public int MaxUsers;
        public List<string> UserIds;
    }

    [System.Serializable]
    public class CollaborationUser
    {
        public string Id;
        public string Name;
        public Color Color;
        public Vector3 Position;
        public Quaternion Rotation;
        public bool IsLocal;
        public System.DateTime JoinTime;
        public Dictionary<string, object> CustomData;
    }

    [System.Serializable]
    public class NetworkMessage
    {
        public MessageType Type;
        public string SenderId;
        public object Data;
        public System.DateTime Timestamp;
    }

    [System.Serializable]
    public class SyncData
    {
        public SyncType Type;
        public object Data;
        public System.DateTime Timestamp;
        public string SenderId;
    }

    [System.Serializable]
    public class ChatMessage
    {
        public string SenderId;
        public string Content;
        public System.DateTime Timestamp;
    }

    [System.Serializable]
    public class VoiceData
    {
        public string SenderId;
        public AudioClip AudioClip;
        public float Duration;
    }

    [System.Serializable]
    public class NetworkError
    {
        public string Message;
        public int Code;
        public System.DateTime Timestamp;
    }

    [System.Serializable]
    public class SessionState
    {
        public System.DateTime Timestamp;
        public List<CollaborationUser> Users;
        public ModelState ModelState;
        public List<MeasurementResult> Measurements;
        public List<AnnotationData> Annotations;
    }

    [System.Serializable]
    public class ModelState
    {
        public Vector3 Position;
        public Quaternion Rotation;
        public Vector3 Scale;
    }

    [System.Serializable]
    public class ViewpointData
    {
        public Vector3 Position;
        public Quaternion Rotation;
        public string Name;
    }

    [System.Serializable]
    public class JoinSessionRequest
    {
        public string SessionId;
        public string Password;
        public CollaborationUser User;
    }

    [System.Serializable]
    public class CreateSessionRequest
    {
        public CollaborationSession Session;
        public CollaborationUser Host;
    }

    [System.Serializable]
    public class SessionJoinedResponse
    {
        public CollaborationSession Session;
        public List<CollaborationUser> ExistingUsers;
    }

    public enum MessageType
    {
        JoinSession,
        CreateSession,
        SessionJoined,
        UserJoined,
        UserLeft,
        UserUpdate,
        ChatMessage,
        VoiceData,
        SyncData,
        Error
    }

    public enum SyncType
    {
        Measurement,
        Annotation,
        ModelTransform,
        Viewpoint,
        ToolState,
        TourState
    }
}
