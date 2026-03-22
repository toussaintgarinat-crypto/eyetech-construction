package com.tradelayer.intelligence.auth

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.tradelayer.intelligence.data.api.AuthApi
import com.tradelayer.intelligence.domain.TokenResponse
import com.tradelayer.intelligence.domain.User
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Service d'authentification pour l'application Android.
 * Gère la connexion, l'inscription et la persistance des tokens JWT.
 */
@Singleton
class AuthService @Inject constructor(
    private val context: Context,
    private val authApi: AuthApi
) {
    private val sharedPreferences: SharedPreferences = 
        context.getSharedPreferences("tradelayer_auth", Context.MODE_PRIVATE)
    
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    private val _isAuthenticated = MutableLiveData<Boolean>()
    val isAuthenticated: LiveData<Boolean> = _isAuthenticated
    
    private val _currentUser = MutableLiveData<User?>()
    val currentUser: LiveData<User?> = _currentUser
    
    private val _authError = MutableLiveData<String?>()
    val authError: LiveData<String?> = _authError
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    companion object {
        private const val TAG = "AuthService"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USERNAME = "username"
        private const val KEY_EMAIL = "email"
        private const val KEY_FIRST_NAME = "first_name"
        private const val KEY_LAST_NAME = "last_name"
    }
    
    init {
        // Vérifier si l'utilisateur est déjà connecté au démarrage
        checkAuthenticationStatus()
    }
    
    /**
     * Vérifie le statut d'authentification au démarrage de l'application.
     */
    private fun checkAuthenticationStatus() {
        val accessToken = getAccessToken()
        if (accessToken != null) {
            // Restaurer les informations utilisateur depuis les préférences
            val user = getUserFromPreferences()
            if (user != null) {
                _currentUser.value = user
                _isAuthenticated.value = true
                Log.d(TAG, "Utilisateur restauré depuis les préférences: ${user.username}")
            } else {
                // Token présent mais pas d'informations utilisateur, déconnecter
                logout()
            }
        } else {
            _isAuthenticated.value = false
        }
    }
    
    /**
     * Connecte un utilisateur avec nom d'utilisateur et mot de passe.
     */
    fun login(username: String, password: String) {
        _isLoading.value = true
        _authError.value = null
        
        coroutineScope.launch {
            try {
                val response = authApi.login(username, password)
                
                // Sauvegarder les tokens
                saveTokens(response.access, response.refresh)
                
                // Récupérer les informations utilisateur
                fetchUserInfo()
                
                Log.d(TAG, "Connexion réussie pour l'utilisateur: $username")
                
            } catch (e: Exception) {
                Log.e(TAG, "Erreur lors de la connexion", e)
                _authError.value = "Erreur de connexion: ${e.message}"
                _isAuthenticated.value = false
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * Inscrit un nouvel utilisateur.
     */
    fun register(
        username: String,
        email: String,
        password: String,
        firstName: String,
        lastName: String
    ) {
        _isLoading.value = true
        _authError.value = null
        
        coroutineScope.launch {
            try {
                authApi.register(username, email, password, password, firstName, lastName)
                
                // Après inscription réussie, connecter automatiquement
                login(username, password)
                
                Log.d(TAG, "Inscription réussie pour l'utilisateur: $username")
                
            } catch (e: Exception) {
                Log.e(TAG, "Erreur lors de l'inscription", e)
                _authError.value = "Erreur d'inscription: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * Récupère les informations de l'utilisateur connecté.
     */
    private suspend fun fetchUserInfo() {
        try {
            val user = authApi.getUserInfo()
            _currentUser.value = user
            _isAuthenticated.value = true
            
            // Sauvegarder les informations utilisateur
            saveUserToPreferences(user)
            
            Log.d(TAG, "Informations utilisateur récupérées: ${user.username}")
            
        } catch (e: Exception) {
            Log.e(TAG, "Erreur lors de la récupération des informations utilisateur", e)
            _authError.value = "Erreur lors de la récupération du profil utilisateur"
        }
    }
    
    /**
     * Déconnecte l'utilisateur actuel.
     */
    fun logout() {
        clearTokens()
        clearUserFromPreferences()
        _currentUser.value = null
        _isAuthenticated.value = false
        _authError.value = null
        
        Log.d(TAG, "Utilisateur déconnecté")
    }
    
    /**
     * Rafraîchit le token d'accès en utilisant le token de rafraîchissement.
     */
    suspend fun refreshToken(): Boolean {
        val refreshToken = getRefreshToken()
        if (refreshToken == null) {
            logout()
            return false
        }
        
        return try {
            val response = authApi.refreshToken(refreshToken)
            saveTokens(response.access, response.refresh)
            Log.d(TAG, "Token rafraîchi avec succès")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Erreur lors du rafraîchissement du token", e)
            logout()
            false
        }
    }
    
    /**
     * Obtient le token d'accès actuel.
     */
    fun getAccessToken(): String? {
        return sharedPreferences.getString(KEY_ACCESS_TOKEN, null)
    }
    
    /**
     * Obtient le token de rafraîchissement actuel.
     */
    private fun getRefreshToken(): String? {
        return sharedPreferences.getString(KEY_REFRESH_TOKEN, null)
    }
    
    /**
     * Sauvegarde les tokens dans les préférences partagées.
     */
    private fun saveTokens(accessToken: String, refreshToken: String) {
        sharedPreferences.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .apply()
    }
    
    /**
     * Efface les tokens des préférences partagées.
     */
    private fun clearTokens() {
        sharedPreferences.edit()
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .apply()
    }
    
    /**
     * Sauvegarde les informations utilisateur dans les préférences partagées.
     */
    private fun saveUserToPreferences(user: User) {
        sharedPreferences.edit()
            .putString(KEY_USER_ID, user.id)
            .putString(KEY_USERNAME, user.username)
            .putString(KEY_EMAIL, user.email)
            .putString(KEY_FIRST_NAME, user.firstName)
            .putString(KEY_LAST_NAME, user.lastName)
            .apply()
    }
    
    /**
     * Récupère les informations utilisateur depuis les préférences partagées.
     */
    private fun getUserFromPreferences(): User? {
        val userId = sharedPreferences.getString(KEY_USER_ID, null)
        val username = sharedPreferences.getString(KEY_USERNAME, null)
        val email = sharedPreferences.getString(KEY_EMAIL, null)
        val firstName = sharedPreferences.getString(KEY_FIRST_NAME, null)
        val lastName = sharedPreferences.getString(KEY_LAST_NAME, null)
        
        return if (userId != null && username != null && email != null && 
                   firstName != null && lastName != null) {
            User(userId, username, email, firstName, lastName)
        } else {
            null
        }
    }
    
    /**
     * Efface les informations utilisateur des préférences partagées.
     */
    private fun clearUserFromPreferences() {
        sharedPreferences.edit()
            .remove(KEY_USER_ID)
            .remove(KEY_USERNAME)
            .remove(KEY_EMAIL)
            .remove(KEY_FIRST_NAME)
            .remove(KEY_LAST_NAME)
            .apply()
    }
    
    /**
     * Vérifie si l'utilisateur est actuellement connecté.
     */
    fun isUserLoggedIn(): Boolean {
        return getAccessToken() != null && _currentUser.value != null
    }
    
    /**
     * Obtient l'ID de l'utilisateur connecté.
     */
    fun getCurrentUserId(): String? {
        return _currentUser.value?.id
    }
    
    /**
     * Obtient le nom d'utilisateur de l'utilisateur connecté.
     */
    fun getCurrentUsername(): String? {
        return _currentUser.value?.username
    }
    
    /**
     * Efface les erreurs d'authentification.
     */
    fun clearAuthError() {
        _authError.value = null
    }
    
    /**
     * Valide le format d'un email.
     */
    fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
    
    /**
     * Valide la force d'un mot de passe.
     */
    fun isValidPassword(password: String): Boolean {
        // Minimum 8 caractères, au moins une lettre et un chiffre
        val passwordPattern = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@\$!%*?&]{8,}\$"
        return password.matches(passwordPattern.toRegex())
    }
    
    /**
     * Valide un nom d'utilisateur.
     */
    fun isValidUsername(username: String): Boolean {
        // 3-20 caractères, lettres, chiffres et underscores uniquement
        val usernamePattern = "^[a-zA-Z0-9_]{3,20}\$"
        return username.matches(usernamePattern.toRegex())
    }
}
