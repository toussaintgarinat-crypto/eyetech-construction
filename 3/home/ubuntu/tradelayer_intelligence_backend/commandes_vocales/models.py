from django.db import models
from django.contrib.auth.models import User
from calques_metiers.models import Projet
import uuid

class CommandeVocale(models.Model):
    """
    Représente une commande vocale enregistrée et son interprétation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commandes_vocales')
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='commandes_vocales', null=True, blank=True)
    
    # Données audio
    fichier_audio = models.FileField(upload_to='commandes_vocales/')
    duree_audio = models.FloatField(help_text="Durée en secondes")
    
    # Transcription et interprétation
    transcription_brute = models.TextField(blank=True)
    transcription_corrigee = models.TextField(blank=True)
    intention_detectee = models.CharField(max_length=100, blank=True)
    entites_extraites = models.JSONField(default=dict, blank=True)
    
    # Contexte et exécution
    contexte = models.JSONField(default=dict, blank=True, help_text="Contexte de l'application au moment de la commande")
    action_resultante = models.CharField(max_length=200, blank=True)
    succes_execution = models.BooleanField(null=True)
    reponse_generee = models.TextField(blank=True)
    
    # Métadonnées
    horodatage = models.DateTimeField(auto_now_add=True)
    traitee = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Commande vocale"
        verbose_name_plural = "Commandes vocales"
        ordering = ['-horodatage']

    def __str__(self):
        return f"Commande de {self.utilisateur.username} à {self.horodatage.strftime('%Y-%m-%d %H:%M')}"

class LogInteractionVocale(models.Model):
    """
    Journalise chaque interaction vocale pour l'analyse et l'amélioration.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=100, help_text="Identifiant de la session d'interaction")
    commande = models.ForeignKey(CommandeVocale, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Informations sur l'interaction
    type_interaction = models.CharField(max_length=50, choices=[
        ('demande', 'Demande utilisateur'),
        ('reponse', 'Réponse système'),
        ('clarification', 'Demande de clarification'),
        ('erreur', 'Erreur de traitement'),
    ])
    contenu = models.TextField()
    
    # Métriques de performance
    temps_reponse = models.FloatField(null=True, blank=True, help_text="Temps de traitement en secondes")
    score_confiance = models.FloatField(null=True, blank=True, help_text="Score de confiance de l'interprétation")
    
    # Feedback utilisateur
    feedback_utilisateur = models.IntegerField(null=True, blank=True, choices=[
        (1, 'Très pertinent'),
        (0, 'Neutre'),
        (-1, 'Non pertinent'),
    ])
    
    horodatage = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Log d'interaction vocale"
        verbose_name_plural = "Logs d'interactions vocales"
        ordering = ['horodatage']

    def __str__(self):
        return f"{self.type_interaction} - {self.session_id}"
