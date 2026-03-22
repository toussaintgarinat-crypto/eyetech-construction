package com.constructoptimize.presentation.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Couleurs pour le thème clair
private val LightColorScheme = lightColorScheme(
    primary = ConstructOptimizeBlue,
    onPrimary = White,
    primaryContainer = ConstructOptimizeLightBlue,
    onPrimaryContainer = ConstructOptimizeDarkBlue,
    secondary = ConstructOptimizeOrange,
    onSecondary = White,
    secondaryContainer = ConstructOptimizeLightOrange,
    onSecondaryContainer = ConstructOptimizeDarkOrange,
    tertiary = ConstructOptimizeGreen,
    onTertiary = White,
    tertiaryContainer = ConstructOptimizeLightGreen,
    onTertiaryContainer = ConstructOptimizeDarkGreen,
    error = ErrorRed,
    onError = White,
    errorContainer = LightErrorRed,
    onErrorContainer = DarkErrorRed,
    background = LightGray,
    onBackground = DarkGray,
    surface = White,
    onSurface = DarkGray,
    surfaceVariant = LightGray,
    onSurfaceVariant = MediumGray,
    outline = MediumGray,
    outlineVariant = LightGray,
    scrim = Black,
    inverseSurface = DarkGray,
    inverseOnSurface = White,
    inversePrimary = ConstructOptimizeLightBlue
)

// Couleurs pour le thème sombre
private val DarkColorScheme = darkColorScheme(
    primary = ConstructOptimizeLightBlue,
    onPrimary = ConstructOptimizeDarkBlue,
    primaryContainer = ConstructOptimizeDarkBlue,
    onPrimaryContainer = ConstructOptimizeLightBlue,
    secondary = ConstructOptimizeLightOrange,
    onSecondary = ConstructOptimizeDarkOrange,
    secondaryContainer = ConstructOptimizeDarkOrange,
    onSecondaryContainer = ConstructOptimizeLightOrange,
    tertiary = ConstructOptimizeLightGreen,
    onTertiary = ConstructOptimizeDarkGreen,
    tertiaryContainer = ConstructOptimizeDarkGreen,
    onTertiaryContainer = ConstructOptimizeLightGreen,
    error = LightErrorRed,
    onError = DarkErrorRed,
    errorContainer = DarkErrorRed,
    onErrorContainer = LightErrorRed,
    background = Black,
    onBackground = White,
    surface = DarkGray,
    onSurface = White,
    surfaceVariant = MediumGray,
    onSurfaceVariant = LightGray,
    outline = MediumGray,
    outlineVariant = DarkGray,
    scrim = Black,
    inverseSurface = LightGray,
    inverseOnSurface = DarkGray,
    inversePrimary = ConstructOptimizeBlue
)

@Composable
fun ConstructOptimizeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
