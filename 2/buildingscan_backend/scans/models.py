from django.db import models
from django.contrib.auth.models import User


class ChantierScan(models.Model):
    STATUT_CHOICES = [
        ('en_cours', 'En cours'),
        ('termine', 'Termine'),
        ('archive', 'Archive'),
    ]

    nom = models.CharField(max_length=200)
    adresse = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='chantiers_scan')
    created_at = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_cours')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Chantier Scan'
        verbose_name_plural = 'Chantiers Scan'

    def __str__(self):
        return f"{self.nom} — {self.adresse}"


class FichierScan(models.Model):
    FORMAT_CHOICES = [
        ('PLY', 'PLY'),
        ('LAS', 'LAS'),
        ('OBJ', 'OBJ'),
        ('GLB', 'GLB'),
        ('IFC', 'IFC'),
        ('E57', 'E57'),
    ]

    chantier = models.ForeignKey(ChantierScan, on_delete=models.CASCADE, related_name='fichiers')
    nom_fichier = models.CharField(max_length=200)
    fichier = models.FileField(upload_to='scans/')
    format_fichier = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    taille_fichier = models.BigIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    nb_points = models.BigIntegerField(default=0)
    precision_cm = models.FloatField(default=1.0)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Fichier Scan'
        verbose_name_plural = 'Fichiers Scan'

    def __str__(self):
        return f"{self.nom_fichier} ({self.format_fichier}) — {self.chantier.nom}"


class SessionScan(models.Model):
    METHODE_CHOICES = [
        ('lidar', 'LiDAR'),
        ('photogrammetrie', 'Photogrammetrie'),
        ('mixte', 'Mixte'),
    ]
    STATUT_CHOICES = [
        ('en_cours', 'En cours'),
        ('traitement', 'En traitement'),
        ('termine', 'Termine'),
        ('erreur', 'Erreur'),
    ]

    chantier = models.ForeignKey(ChantierScan, on_delete=models.CASCADE, related_name='sessions')
    operateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sessions_scan')
    date_session = models.DateTimeField(auto_now_add=True)
    device_utilise = models.CharField(max_length=100, default='iPhone Pro')
    methode = models.CharField(max_length=20, choices=METHODE_CHOICES)
    duree_minutes = models.IntegerField(default=0)
    surface_scannee_m2 = models.FloatField(default=0)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_cours')
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date_session']
        verbose_name = 'Session Scan'
        verbose_name_plural = 'Sessions Scan'

    def __str__(self):
        return f"Session {self.methode} — {self.chantier.nom}"
