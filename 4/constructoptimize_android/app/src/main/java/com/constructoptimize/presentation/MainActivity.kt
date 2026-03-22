package com.constructoptimize.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.constructoptimize.presentation.navigation.ConstructOptimizeNavigation
import com.constructoptimize.presentation.ui.theme.ConstructOptimizeTheme
import dagger.hilt.android.AndroidEntryPoint

/**
 * Activité principale de l'application ConstructOptimize.
 * Point d'entrée de l'application avec navigation Compose.
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // Installation du splash screen
        val splashScreen = installSplashScreen()
        
        super.onCreate(savedInstanceState)
        
        // Configuration de l'affichage edge-to-edge
        enableEdgeToEdge()
        
        setContent {
            ConstructOptimizeTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ConstructOptimizeNavigation()
                }
            }
        }
    }
}
