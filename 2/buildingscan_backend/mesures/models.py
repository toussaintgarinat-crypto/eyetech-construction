from django.db import models


class Mesure(models.Model):
    TYPE_CHOICES = [
        ('distance', 'Distance'),
        ('surface', 'Surface'),
        ('volume', 'Volume'),
        ('angle', 'Angle'),
        ('hauteur', 'Hauteur'),
    ]

    session = models.ForeignKey('scans.SessionScan', on_delete=models.CASCADE, related_name='mesures')
    type_mesure = models.CharField(max_length=20, choices=TYPE_CHOICES)
    valeur = models.FloatField()
    unite = models.CharField(max_length=10, default='m')
    point_depart_x = models.FloatField(default=0)
    point_depart_y = models.FloatField(default=0)
    point_depart_z = models.FloatField(default=0)
    point_arrivee_x = models.FloatField(default=0)
    point_arrivee_y = models.FloatField(default=0)
    point_arrivee_z = models.FloatField(default=0)
    label = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mesure'
        verbose_name_plural = 'Mesures'

    def __str__(self):
        return f"{self.type_mesure} : {self.valeur} {self.unite} — {self.label}"


class ZoneMesure(models.Model):
    TYPE_ZONE_CHOICES = [
        ('piece', 'Piece'),
        ('couloir', 'Couloir'),
        ('escalier', 'Escalier'),
        ('facade', 'Facade'),
        ('toiture', 'Toiture'),
    ]

    chantier = models.ForeignKey('scans.ChantierScan', on_delete=models.CASCADE, related_name='zones')
    nom = models.CharField(max_length=200)
    type_zone = models.CharField(max_length=20, choices=TYPE_ZONE_CHOICES)
    surface_m2 = models.FloatField(default=0)
    volume_m3 = models.FloatField(default=0)
    hauteur_m = models.FloatField(default=0)
    perimetre_m = models.FloatField(default=0)

    class Meta:
        ordering = ['nom']
        verbose_name = 'Zone Mesure'
        verbose_name_plural = 'Zones Mesure'

    def __str__(self):
        return f"{self.nom} ({self.type_zone}) — {self.surface_m2} m2"
