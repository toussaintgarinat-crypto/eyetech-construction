package com.tradelayer.intelligence.data.api

import com.tradelayer.intelligence.auth.AuthService
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Intercepteur pour ajouter automatiquement le token d'authentification
 * aux requêtes API et gérer le rafraîchissement des tokens.
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val authService: AuthService
) : Interceptor {
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Exclure les endpoints d'authentification
        val url = originalRequest.url.toString()
        if (url.contains("/auth/token/") || url.contains("/auth/register/")) {
            return chain.proceed(originalRequest)
        }
        
        // Ajouter le token d'authentification si disponible
        val accessToken = authService.getAccessToken()
        val request = if (accessToken != null) {
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer $accessToken")
                .build()
        } else {
            originalRequest
        }
        
        val response = chain.proceed(request)
        
        // Si la réponse est 401 (Unauthorized), essayer de rafraîchir le token
        if (response.code == 401 && accessToken != null) {
            response.close()
            
            // Essayer de rafraîchir le token
            val refreshSuccess = runBlocking {
                authService.refreshToken()
            }
            
            if (refreshSuccess) {
                // Réessayer la requête avec le nouveau token
                val newAccessToken = authService.getAccessToken()
                val newRequest = originalRequest.newBuilder()
                    .addHeader("Authorization", "Bearer $newAccessToken")
                    .build()
                return chain.proceed(newRequest)
            } else {
                // Le rafraîchissement a échoué, l'utilisateur sera déconnecté par AuthService
                return response
            }
        }
        
        return response
    }
}
