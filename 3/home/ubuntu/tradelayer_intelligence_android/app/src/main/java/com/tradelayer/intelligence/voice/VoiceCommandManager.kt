package com.tradelayer.intelligence.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.tradelayer.intelligence.data.repository.VoiceCommandRepository
import com.tradelayer.intelligence.domain.VoiceCommandState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Gestionnaire pour les commandes vocales dans l'application Android.
 * Utilise l'API de reconnaissance vocale Android et communique avec le backend.
 */
@Singleton
class VoiceCommandManager @Inject constructor(
    private val context: Context,
    private val voiceCommandRepository: VoiceCommandRepository
) {
    private var speechRecognizer: SpeechRecognizer? = null
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    private val _voiceCommandState = MutableLiveData(VoiceCommandState())
    val voiceCommandState: LiveData<VoiceCommandState> = _voiceCommandState
    
    private var currentProjectId: String? = null
    
    companion object {
        private const val TAG = "VoiceCommandManager"
    }
    
    /**
     * Initialise le gestionnaire de commandes vocales.
     */
    fun initialize() {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
            speechRecognizer?.setRecognitionListener(recognitionListener)
            Log.d(TAG, "Reconnaissance vocale initialisée")
        } else {
            Log.e(TAG, "Reconnaissance vocale non disponible sur cet appareil")
            updateState { it.copy(error = "Reconnaissance vocale non disponible") }
        }
    }
    
    /**
     * Définit l'ID du projet actuel pour associer les commandes vocales.
     */
    fun setCurrentProject(projectId: String) {
        this.currentProjectId = projectId
        Log.d(TAG, "Projet actuel défini: $projectId")
    }
    
    /**
     * Démarre l'écoute des commandes vocales.
     */
    fun startListening() {
        if (speechRecognizer == null) {
            initialize()
        }
        
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Dites votre commande...")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }
        
        updateState { it.copy(isListening = true, error = null) }
        speechRecognizer?.startListening(intent)
        Log.d(TAG, "Démarrage de l'écoute vocale")
    }
    
    /**
     * Arrête l'écoute des commandes vocales.
     */
    fun stopListening() {
        speechRecognizer?.stopListening()
        updateState { it.copy(isListening = false) }
        Log.d(TAG, "Arrêt de l'écoute vocale")
    }
    
    /**
     * Traite une commande vocale transcrite.
     */
    private fun processVoiceCommand(transcription: String) {
        if (currentProjectId == null) {
            Log.w(TAG, "Aucun projet défini pour la commande vocale")
            updateState { it.copy(error = "Aucun projet sélectionné") }
            return
        }
        
        updateState { 
            it.copy(
                isProcessing = true, 
                lastTranscription = transcription,
                error = null
            ) 
        }
        
        coroutineScope.launch {
            try {
                val response = voiceCommandRepository.sendVoiceCommand(
                    transcription = transcription,
                    projectId = currentProjectId!!
                )
                
                updateState { 
                    it.copy(
                        isProcessing = false,
                        lastResponse = response.reponseGeneree ?: "Commande traitée avec succès"
                    ) 
                }
                
                Log.d(TAG, "Commande vocale traitée: $transcription")
                
            } catch (e: Exception) {
                Log.e(TAG, "Erreur lors du traitement de la commande vocale", e)
                updateState { 
                    it.copy(
                        isProcessing = false,
                        error = "Erreur: ${e.message}"
                    ) 
                }
            }
        }
    }
    
    private val recognitionListener = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            Log.d(TAG, "Prêt pour la reconnaissance vocale")
        }
        
        override fun onBeginningOfSpeech() {
            Log.d(TAG, "Début de la parole détecté")
        }
        
        override fun onRmsChanged(rmsdB: Float) {
            // Niveau sonore - peut être utilisé pour l'interface utilisateur
        }
        
        override fun onBufferReceived(buffer: ByteArray?) {
            // Données audio brutes - non utilisées ici
        }
        
        override fun onEndOfSpeech() {
            Log.d(TAG, "Fin de la parole détectée")
            updateState { it.copy(isListening = false) }
        }
        
        override fun onError(error: Int) {
            val errorMessage = when (error) {
                SpeechRecognizer.ERROR_AUDIO -> "Erreur audio"
                SpeechRecognizer.ERROR_CLIENT -> "Erreur client"
                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Permissions insuffisantes"
                SpeechRecognizer.ERROR_NETWORK -> "Erreur réseau"
                SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Timeout réseau"
                SpeechRecognizer.ERROR_NO_MATCH -> "Aucune correspondance trouvée"
                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Reconnaissance occupée"
                SpeechRecognizer.ERROR_SERVER -> "Erreur serveur"
                SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Timeout de parole"
                else -> "Erreur inconnue: $error"
            }
            
            Log.e(TAG, "Erreur de reconnaissance vocale: $errorMessage")
            updateState { 
                it.copy(
                    isListening = false,
                    isProcessing = false,
                    error = errorMessage
                ) 
            }
        }
        
        override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            if (!matches.isNullOrEmpty()) {
                val transcription = matches[0]
                Log.d(TAG, "Transcription reçue: $transcription")
                processVoiceCommand(transcription)
            }
        }
        
        override fun onPartialResults(partialResults: Bundle?) {
            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            if (!matches.isNullOrEmpty()) {
                val partialTranscription = matches[0]
                updateState { it.copy(lastTranscription = partialTranscription) }
            }
        }
        
        override fun onEvent(eventType: Int, params: Bundle?) {
            // Événements supplémentaires - non utilisés ici
        }
    }
    
    /**
     * Met à jour l'état des commandes vocales.
     */
    private fun updateState(update: (VoiceCommandState) -> VoiceCommandState) {
        _voiceCommandState.value = update(_voiceCommandState.value ?: VoiceCommandState())
    }
    
    /**
     * Libère les ressources du gestionnaire.
     */
    fun release() {
        speechRecognizer?.destroy()
        speechRecognizer = null
        Log.d(TAG, "Ressources de reconnaissance vocale libérées")
    }
    
    /**
     * Vérifie si la reconnaissance vocale est disponible.
     */
    fun isRecognitionAvailable(): Boolean {
        return SpeechRecognizer.isRecognitionAvailable(context)
    }
    
    /**
     * Traite les commandes vocales prédéfinies localement.
     */
    fun processLocalCommand(command: String): Boolean {
        return when (command.lowercase()) {
            "afficher tous les calques", "montrer tous les calques" -> {
                // Logique pour afficher tous les calques
                updateState { it.copy(lastResponse = "Affichage de tous les calques") }
                true
            }
            "masquer tous les calques", "cacher tous les calques" -> {
                // Logique pour masquer tous les calques
                updateState { it.copy(lastResponse = "Masquage de tous les calques") }
                true
            }
            "zoom avant", "agrandir" -> {
                // Logique pour le zoom
                updateState { it.copy(lastResponse = "Zoom avant appliqué") }
                true
            }
            "zoom arrière", "réduire" -> {
                // Logique pour le zoom arrière
                updateState { it.copy(lastResponse = "Zoom arrière appliqué") }
                true
            }
            "aide", "help" -> {
                updateState { 
                    it.copy(lastResponse = "Commandes disponibles: afficher/masquer calques, zoom avant/arrière, aide") 
                }
                true
            }
            else -> false
        }
    }
}
