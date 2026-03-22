from django.db import models
from django.contrib.auth.models import User


class InstanceRAG(models.Model):
    """Represente une instance OpenRAG dediee a un corps de metier."""

    CORPS_METIER = [
        ('plomberie', 'Plomberie'),
        ('electricite', 'Electricite'),
        ('placo', 'Placo / Cloisons'),
        ('charpente', 'Charpente / Bois'),
        ('cvc', 'CVC / Climatisation'),
        ('peinture', 'Peinture / Revetements'),
        ('maconnerie', 'Maconnerie / Gros oeuvre'),
        ('menuiserie', 'Menuiserie'),
        ('carrelage', 'Carrelage / Sols'),
        ('toiture', 'Toiture / Etancheite'),
    ]

    corps_metier = models.CharField(max_length=30, choices=CORPS_METIER, unique=True)
    url_openrag = models.URLField(help_text="URL de l'instance OpenRAG pour ce metier")
    api_key = models.CharField(max_length=200, blank=True)
    actif = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    normes_disponibles = models.JSONField(default=list, help_text="Liste des normes chargees (DTU, NF, EN...)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Instance RAG"
        verbose_name_plural = "Instances RAG"

    def __str__(self):
        return f"RAG {self.corps_metier} -> {self.url_openrag}"


class QuestionRAG(models.Model):
    """Historique des questions posees au RAG."""

    STATUTS = [
        ('en_attente', 'En attente'),
        ('traitee', 'Traitee'),
        ('erreur', 'Erreur'),
    ]

    utilisateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='questions_rag')
    instance_rag = models.ForeignKey(InstanceRAG, on_delete=models.SET_NULL, null=True, related_name='questions')
    corps_metier = models.CharField(max_length=30)
    question = models.TextField()
    reponse = models.TextField(blank=True)
    sources = models.JSONField(default=list, help_text="Sources citees par le RAG")
    statut = models.CharField(max_length=20, choices=STATUTS, default='en_attente')
    temps_reponse_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Question RAG"
        verbose_name_plural = "Questions RAG"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.corps_metier} - {self.question[:50]}"
