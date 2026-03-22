from django.db import models


class JumeauNumerique(models.Model):
    FORMAT_CHOICES = [
        ('GLB', 'GLB'),
        ('OBJ', 'OBJ'),
        ('IFC', 'IFC'),
    ]
    STATUT_CHOICES = [
        ('generation', 'En generation'),
        ('pret', 'Pret'),
        ('archive', 'Archive'),
    ]

    chantier = models.ForeignKey('scans.ChantierScan', on_delete=models.CASCADE, related_name='jumeaux')
    nom = models.CharField(max_length=200)
    version = models.CharField(max_length=20, default='1.0')
    fichier_modele = models.FileField(upload_to='jumeaux/', blank=True, null=True)
    format_modele = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='GLB')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='generation')
    nb_elements = models.IntegerField(default=0)
    precision_globale_cm = models.FloatField(default=1.0)
    # Export vers App 3 (TradeLayer)
    exporte_tradelayer = models.BooleanField(default=False)
    url_tradelayer = models.URLField(blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Jumeau Numerique'
        verbose_name_plural = 'Jumeaux Numeriques'

    def __str__(self):
        return f"{self.nom} v{self.version} — {self.chantier.nom} [{self.statut}]"
