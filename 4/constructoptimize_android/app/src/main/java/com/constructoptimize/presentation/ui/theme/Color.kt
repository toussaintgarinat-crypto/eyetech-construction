package com.constructoptimize.presentation.ui.theme

import androidx.compose.ui.graphics.Color

// Couleurs principales de ConstructOptimize
val ConstructOptimizeBlue = Color(0xFF1976D2)
val ConstructOptimizeLightBlue = Color(0xFF63A4FF)
val ConstructOptimizeDarkBlue = Color(0xFF004BA0)

val ConstructOptimizeOrange = Color(0xFFFF9800)
val ConstructOptimizeLightOrange = Color(0xFFFFCC02)
val ConstructOptimizeDarkOrange = Color(0xFFC66900)

val ConstructOptimizeGreen = Color(0xFF4CAF50)
val ConstructOptimizeLightGreen = Color(0xFF80E27E)
val ConstructOptimizeDarkGreen = Color(0xFF087F23)

// Couleurs neutres
val White = Color(0xFFFFFFFF)
val Black = Color(0xFF000000)
val LightGray = Color(0xFFF5F5F5)
val MediumGray = Color(0xFF9E9E9E)
val DarkGray = Color(0xFF424242)

// Couleurs d'état
val ErrorRed = Color(0xFFD32F2F)
val LightErrorRed = Color(0xFFFFCDD2)
val DarkErrorRed = Color(0xFF9A0007)

val WarningAmber = Color(0xFFFFC107)
val LightWarningAmber = Color(0xFFFFF8E1)
val DarkWarningAmber = Color(0xFFFF8F00)

val SuccessGreen = Color(0xFF388E3C)
val LightSuccessGreen = Color(0xFFC8E6C9)
val DarkSuccessGreen = Color(0xFF1B5E20)

val InfoBlue = Color(0xFF1976D2)
val LightInfoBlue = Color(0xFFBBDEFB)
val DarkInfoBlue = Color(0xFF0D47A1)

// Couleurs spécifiques aux fonctionnalités
val PriceGreen = Color(0xFF2E7D32)
val PriceRed = Color(0xFFD32F2F)
val DiscountOrange = Color(0xFFFF6F00)
val AvailableGreen = Color(0xFF4CAF50)
val UnavailableRed = Color(0xFFF44336)

// Couleurs pour les graphiques et visualisations
val ChartColors = listOf(
    Color(0xFF1976D2), // Bleu
    Color(0xFFFF9800), // Orange
    Color(0xFF4CAF50), // Vert
    Color(0xFF9C27B0), // Violet
    Color(0xFFFF5722), // Rouge-orange
    Color(0xFF607D8B), // Bleu-gris
    Color(0xFF795548), // Marron
    Color(0xFFE91E63)  // Rose
)

// Couleurs pour les types de fournisseurs
val SupplierTypeColors = mapOf(
    "DISTRIBUTEUR" to Color(0xFF1976D2),
    "FABRICANT" to Color(0xFF388E3C),
    "GROSSISTE" to Color(0xFFFF9800),
    "DETAILLANT" to Color(0xFF9C27B0),
    "MARKETPLACE" to Color(0xFFFF5722),
    "LOCAL" to Color(0xFF607D8B)
)

// Couleurs pour les statuts
val StatusColors = mapOf(
    "EN_COURS" to WarningAmber,
    "TERMINEE" to SuccessGreen,
    "ERREUR" to ErrorRed,
    "EXPIREE" to MediumGray
)

// Couleurs pour les recommandations
val RecommendationColors = mapOf(
    "MEILLEUR_PRIX" to SuccessGreen,
    "MEILLEUR_RAPPORT" to InfoBlue,
    "LIVRAISON_RAPIDE" to WarningAmber,
    "FOURNISSEUR_LOCAL" to Color(0xFF9C27B0),
    "ACHAT_GROUPE" to Color(0xFF3F51B5),
    "ALTERNATIVE" to Color(0xFF009688)
)
