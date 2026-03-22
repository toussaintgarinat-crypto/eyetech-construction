from django.db import models
from django.contrib.auth.models import User
from calques_metiers.models import Projet, CalqueMetier, ElementCalque
import uuid

class ZoneAnalyse(models.Model):
    """
    Définit une zone géographique ou spatiale pour l'analyse.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='zones_analyse')
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Géométrie de la zone (peut être un polygone, un cercle, etc.)
    # Stocké en GeoJSON ou format similaire pour flexibilité
    geometrie_zone = models.JSONField(help_text="Définition géométrique de la zone (GeoJSON)")
    
    # Paramètres d'analyse spécifiques à la zone
    parametres_analyse = models.JSONField(default=dict, blank=True)
    
    # Visibilité et gestion
    visible = models.BooleanField(default=True)
    createur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='zones_creees')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Zone d'analyse"
        verbose_name_plural = "Zones d'analyse"
        ordering = ['nom']

    def __str__(self):
        return f"Zone {self.nom} ({self.projet.nom})"

class PointInteret(models.Model):
    """
    Représente un point d'intérêt spécifique dans l'espace du projet.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='points_interet')
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Coordonnées spatiales (x, y, z)
    position_x = models.FloatField()
    position_y = models.FloatField()
    position_z = models.FloatField()
    
    # Type de point d'intérêt (ex: capteur, défaut, point de mesure)
    TYPE_CHOICES = [
        ('capteur', 'Capteur'),
        ('defaut', 'Défaut'),
        ('mesure', 'Point de mesure'),
        ('reference', 'Point de référence'),
        ('autre', 'Autre'),
    ]
    type_point = models.CharField(max_length=50, choices=TYPE_CHOICES, default='reference')
    
    # Liens éventuels avec des éléments de calques
    element_lie = models.ForeignKey(ElementCalque, on_delete=models.SET_NULL, null=True, blank=True, related_name='points_interet')
    
    # Métadonnées additionnelles
    metadata = models.JSONField(default=dict, blank=True)
    
    createur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='points_interet_crees')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Point d'intérêt"
        verbose_name_plural = "Points d'intérêt"
        ordering = ['nom']

    def __str__(self):
        return f"POI {self.nom} ({self.projet.nom})"

class MesureSpatiale(models.Model):
    """
    Enregistre une mesure spatiale (distance, angle, volume, etc.) effectuée dans le projet.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='mesures_spatiales')
    calque = models.ForeignKey(CalqueMetier, on_delete=models.CASCADE, related_name='mesures_spatiales', null=True, blank=True)
    
    # Type de mesure
    TYPE_MESURE_CHOICES = [
        ('distance', 'Distance'),
        ('angle', 'Angle'),
        ('surface', 'Surface'),
        ('volume', 'Volume'),
        ('hauteur', 'Hauteur'),
        ('autre', 'Autre'),
    ]
    type_mesure = models.CharField(max_length=50, choices=TYPE_MESURE_CHOICES)
    
    # Valeur de la mesure
    valeur = models.FloatField()
    unite = models.CharField(max_length=20, help_text="Unité de la mesure (ex: m, cm, degrés, m²)")
    
    # Points ou éléments impliqués dans la mesure
    elements_impliques = models.ManyToManyField(ElementCalque, blank=True, related_name='mesures_spatiales_impliquees')
    points_references = models.JSONField(default=list, blank=True, help_text="Liste de coordonnées ou IDs de points de référence")
    
    # Description et contexte
    description = models.TextField(blank=True)
    contexte_mesure = models.JSONField(default=dict, blank=True)
    
    realisee_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='mesures_realisees')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Mesure spatiale"
        verbose_name_plural = "Mesures spatiales"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type_mesure} : {self.valeur} {self.unite} ({self.projet.nom})"
