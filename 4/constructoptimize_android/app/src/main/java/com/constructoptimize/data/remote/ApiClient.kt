package com.constructoptimize.data.remote

import com.constructoptimize.BuildConfig
import com.constructoptimize.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Interface API pour ConstructOptimize.
 * Définit tous les endpoints disponibles pour l'application.
 */
interface ConstructOptimizeApi {
    
    // MARK: - Authentification
    @POST("auth/login/")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register/")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/refresh/")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<AuthResponse>
    
    @POST("auth/logout/")
    suspend fun logout(): Response<Unit>
    
    // MARK: - Produits
    @GET("produits/")
    suspend fun searchProducts(
        @Query("search") searchTerm: String? = null,
        @Query("page") page: Int = 1,
        @Query("prix_min") prixMin: Double? = null,
        @Query("prix_max") prixMax: Double? = null,
        @Query("rayon") rayon: Int? = null,
        @Query("disponible") disponible: Boolean? = null,
        @Query("verifies") verifies: Boolean? = null,
        @Query("categorie") categorieId: String? = null,
        @Query("marque") marqueId: String? = null
    ): Response<PaginatedResponse<ProduitDto>>
    
    @GET("produits/{id}/")
    suspend fun getProduct(@Path("id") productId: String): Response<ProduitDto>
    
    @GET("produits/categories/")
    suspend fun getCategories(): Response<List<CategorieDto>>
    
    @GET("produits/marques/")
    suspend fun getBrands(): Response<List<MarqueDto>>
    
    @GET("produits/{id}/prix/")
    suspend fun getProductPrices(@Path("id") productId: String): Response<List<PrixProduitDto>>
    
    // MARK: - Fournisseurs
    @GET("fournisseurs/")
    suspend fun getSuppliers(
        @Query("page") page: Int = 1,
        @Query("type") type: String? = null,
        @Query("verifie") verifie: Boolean? = null
    ): Response<PaginatedResponse<FournisseurDto>>
    
    @GET("fournisseurs/{id}/")
    suspend fun getSupplier(@Path("id") supplierId: String): Response<FournisseurDto>
    
    @GET("fournisseurs/proximite/")
    suspend fun getNearbySuppliers(
        @Query("lat") latitude: Double,
        @Query("lng") longitude: Double,
        @Query("rayon") radius: Int
    ): Response<List<FournisseurDto>>
    
    // MARK: - Comparaison de prix
    @POST("comparateur/recherches/")
    suspend fun createComparison(@Body request: CreerRechercheRequest): Response<RechercheComparaisonDto>
    
    @GET("comparateur/recherches/{id}/resultats/")
    suspend fun getComparisonResults(@Path("id") searchId: String): Response<List<ResultatComparaisonDto>>
    
    @GET("comparateur/recherches/{id}/recommandations/")
    suspend fun getRecommendations(@Path("id") searchId: String): Response<List<RecommandationAchatDto>>
    
    @POST("comparateur/recherches/{id}/sauvegarder/")
    suspend fun saveSearch(@Path("id") searchId: String): Response<RechercheComparaisonDto>
    
    @GET("comparateur/recherches/")
    suspend fun getUserSearches(
        @Query("page") page: Int = 1,
        @Query("sauvegardee") saved: Boolean? = null
    ): Response<PaginatedResponse<RechercheComparaisonDto>>
    
    @DELETE("comparateur/recherches/{id}/")
    suspend fun deleteSearch(@Path("id") searchId: String): Response<Unit>
    
    // MARK: - Analyse de marché
    @GET("comparateur/analyses-marche/{produit_id}/")
    suspend fun getMarketAnalysis(@Path("produit_id") productId: String): Response<AnalyseMarcheDto>
    
    // MARK: - Configuration utilisateur
    @GET("comparateur/configuration/")
    suspend fun getUserConfiguration(): Response<ConfigurationUtilisateurDto>
    
    @PUT("comparateur/configuration/")
    suspend fun updateUserConfiguration(@Body config: ConfigurationUtilisateurDto): Response<ConfigurationUtilisateurDto>
    
    // MARK: - Alertes de prix
    @GET("comparateur/alertes/")
    suspend fun getPriceAlerts(@Query("page") page: Int = 1): Response<PaginatedResponse<AlertePrixDto>>
    
    @POST("comparateur/alertes/")
    suspend fun createPriceAlert(@Body request: CreerAlertePrixRequest): Response<AlertePrixDto>
    
    @DELETE("comparateur/alertes/{id}/")
    suspend fun deletePriceAlert(@Path("id") alertId: String): Response<Unit>
    
    // MARK: - Statistiques
    @GET("comparateur/statistiques/")
    suspend fun getStatistics(): Response<StatistiquesUtilisateurDto>
    
    companion object {
        const val BASE_URL = BuildConfig.API_BASE_URL
    }
}

/**
 * Classe utilitaire pour créer des instances de l'API client.
 */
object ApiClient {
    
    /**
     * Crée une instance de l'API ConstructOptimize avec la configuration par défaut.
     */
    fun create(): ConstructOptimizeApi {
        return RetrofitClient.create(ConstructOptimizeApi::class.java)
    }
}
