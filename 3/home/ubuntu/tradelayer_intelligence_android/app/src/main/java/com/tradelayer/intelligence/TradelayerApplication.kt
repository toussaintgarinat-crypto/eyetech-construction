package com.tradelayer.intelligence

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

/**
 * Classe Application principale pour Tradelayer Intelligence.
 * Utilise Hilt pour l'injection de dépendances.
 */
@HiltAndroidApp
class TradelayerApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialisation de l'application
        initializeLogging()
        initializeNetworking()
    }
    
    private fun initializeLogging() {
        // Configuration du logging pour le debug
        // En production, ceci serait configuré différemment
    }
    
    private fun initializeNetworking() {
        // Configuration réseau globale si nécessaire
    }
}
