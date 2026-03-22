package com.constructoptimize

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

/**
 * Classe Application principale pour ConstructOptimize.
 * Configurée avec Hilt pour l'injection de dépendances.
 */
@HiltAndroidApp
class ConstructOptimizeApplication : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    override fun onCreate() {
        super.onCreate()
        
        // Configuration de l'application
        setupApplication()
    }

    override fun getWorkManagerConfiguration(): Configuration {
        return Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
    }

    private fun setupApplication() {
        // Configuration des logs en mode debug
        if (BuildConfig.DEBUG) {
            // Configuration des logs de debug
            android.util.Log.d("ConstructOptimize", "Application démarrée en mode debug")
        }
        
        // Configuration des préférences par défaut
        setupDefaultPreferences()
    }

    private fun setupDefaultPreferences() {
        // Configuration des préférences par défaut de l'application
        val sharedPrefs = getSharedPreferences("construct_optimize_prefs", MODE_PRIVATE)
        
        // Première installation
        if (!sharedPrefs.getBoolean("first_launch_completed", false)) {
            sharedPrefs.edit()
                .putBoolean("first_launch_completed", true)
                .putBoolean("notifications_enabled", true)
                .putBoolean("location_enabled", false)
                .putString("default_currency", "EUR")
                .putInt("default_search_radius", 50)
                .apply()
        }
    }
}
