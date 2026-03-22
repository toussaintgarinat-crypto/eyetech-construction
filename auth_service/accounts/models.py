from django.db import models
from django.contrib.auth.models import User


class EyetechProfile(models.Model):
    """Profil utilisateur Eyetech - lie a un User Django standard."""

    ROLES = [
        ('admin', 'Administrateur'),
        ('chef_projet', 'Chef de projet'),
        ('conducteur', 'Conducteur de travaux'),
        ('ouvrier', 'Ouvrier'),
        ('bureau_etudes', "Bureau d'etudes"),
        ('fournisseur', 'Fournisseur'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='eyetech_profile')
    role = models.CharField(max_length=30, choices=ROLES, default='ouvrier')
    entreprise = models.CharField(max_length=200, blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    avatar = models.URLField(blank=True)

    # Acces aux 4 applications
    acces_perce_mur = models.BooleanField(default=True)
    acces_building_scan = models.BooleanField(default=True)
    acces_tradelayer = models.BooleanField(default=True)
    acces_constructoptimize = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profil Eyetech"
        verbose_name_plural = "Profils Eyetech"

    def __str__(self):
        return f"{self.user.username} ({self.role})"

    @property
    def apps_autorisees(self):
        apps = []
        if self.acces_perce_mur:
            apps.append('perce_mur')
        if self.acces_building_scan:
            apps.append('building_scan')
        if self.acces_tradelayer:
            apps.append('tradelayer')
        if self.acces_constructoptimize:
            apps.append('constructoptimize')
        return apps
