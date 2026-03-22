package com.tradelayer.intelligence.data.api

import com.tradelayer.intelligence.domain.TokenResponse
import com.tradelayer.intelligence.domain.User
import retrofit2.http.*

/**
 * Interface API pour l'authentification avec le backend Django.
 */
interface AuthApi {
    
    /**
     * Connecte un utilisateur avec nom d'utilisateur et mot de passe.
     */
    @FormUrlEncoded
    @POST("auth/token/")
    suspend fun login(
        @Field("username") username: String,
        @Field("password") password: String
    ): TokenResponse
    
    /**
     * Inscrit un nouvel utilisateur.
     */
    @FormUrlEncoded
    @POST("auth/register/")
    suspend fun register(
        @Field("username") username: String,
        @Field("email") email: String,
        @Field("password") password: String,
        @Field("password2") password2: String,
        @Field("first_name") firstName: String,
        @Field("last_name") lastName: String
    ): User
    
    /**
     * Rafraîchit le token d'accès.
     */
    @FormUrlEncoded
    @POST("auth/token/refresh/")
    suspend fun refreshToken(
        @Field("refresh") refreshToken: String
    ): TokenResponse
    
    /**
     * Vérifie la validité d'un token.
     */
    @FormUrlEncoded
    @POST("auth/token/verify/")
    suspend fun verifyToken(
        @Field("token") token: String
    ): Map<String, Any>
    
    /**
     * Récupère les informations de l'utilisateur connecté.
     */
    @GET("auth/user/")
    suspend fun getUserInfo(): User
}
