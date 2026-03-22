from django.db import models
import uuid
from django.contrib.auth.models import User
from produits.models import Produit
from fournisseurs.models import Fournisseur, PrixProduit

class RechercheComparaison(models.Model):
    """
    Modèle pour enregistrer les recherches de comparaison des utilisateurs.
    """
    STATUT_CHOICES = [
        ('en_cours', 'En cours'),
        ('terminee', 'Terminée'),
        ('erreur', 'Erreur'),
        ('expiree', 'Expirée'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, blank=True)  # Pour les utilisateurs non connectés
    
    # Critères de recherche
    terme_recherche = models.CharField(max_length=200)
    produits = models.ManyToManyField(Produit, through='ElementRecherche')
    
    # Filtres appliqués
    prix_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    prix_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fournisseurs_inclus = models.ManyToManyField(Fournisseur, blank=True)
    rayon_recherche = models.IntegerField(null=True, blank=True, help_text="Rayon en km")
    latitude_recherche = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude_recherche = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Préférences de tri
    tri_par = models.CharField(max_length=50, default='prix', choices=[
        ('prix', 'Prix croissant'),
        ('prix_desc', 'Prix décroissant'),
        ('delai', 'Délai de livraison'),
        ('note', 'Note fournisseur'),
        ('distance', 'Distance'),
        ('disponibilite', 'Disponibilité'),
    ])
    
    # Statut et métadonnées
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_cours')
    nombre_resultats = models.IntegerField(default=0)
    temps_execution = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_expiration = models.DateTimeField(null=True, blank=True)
    
    # Sauvegarde et partage
    sauvegardee = models.BooleanField(default=False)
    partageable = models.BooleanField(default=False)
    lien_partage = models.CharField(max_length=100, unique=True, null=True, blank=True)

    class Meta:
        verbose_name = "Recherche de comparaison"
        verbose_name_plural = "Recherches de comparaison"
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['utilisateur', 'date_creation']),
            models.Index(fields=['session_id']),
            models.Index(fields=['statut']),
        ]

    def __str__(self):
        user_info = self.utilisateur.username if self.utilisateur else f"Session {self.session_id[:8]}"
        return f"Recherche {user_info}: {self.terme_recherche}"

    def get_prix_moyen(self):
        """Calcule le prix moyen des résultats."""
        resultats = self.resultats.filter(disponible=True)
        if resultats.exists():
            return resultats.aggregate(models.Avg('prix_unitaire'))['prix_unitaire__avg']
        return None

    def get_economie_potentielle(self):
        """Calcule l'économie potentielle entre le prix le plus bas et le plus élevé."""
        resultats = self.resultats.filter(disponible=True)
        if resultats.count() >= 2:
            prix_min = resultats.aggregate(models.Min('prix_unitaire'))['prix_unitaire__min']
            prix_max = resultats.aggregate(models.Max('prix_unitaire'))['prix_unitaire__max']
            return prix_max - prix_min if prix_min and prix_max else None
        return None


class ElementRecherche(models.Model):
    """
    Modèle intermédiaire pour les produits dans une recherche.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recherche = models.ForeignKey(RechercheComparaison, on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite_demandee = models.IntegerField(default=1)
    priorite = models.IntegerField(default=1)  # 1 = haute, 5 = basse
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Élément de recherche"
        verbose_name_plural = "Éléments de recherche"
        unique_together = ['recherche', 'produit']

    def __str__(self):
        return f"{self.produit.nom} x{self.quantite_demandee}"


class ResultatComparaison(models.Model):
    """
    Modèle pour stocker les résultats de comparaison de prix.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recherche = models.ForeignKey(RechercheComparaison, on_delete=models.CASCADE, related_name='resultats')
    prix_produit = models.ForeignKey(PrixProduit, on_delete=models.CASCADE)
    
    # Prix calculés pour la quantité demandée
    quantite = models.IntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=4)
    prix_total_ht = models.DecimalField(max_digits=12, decimal_places=2)
    prix_total_ttc = models.DecimalField(max_digits=12, decimal_places=2)
    frais_livraison = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)
    
    # Informations contextuelles
    disponible = models.BooleanField(default=True)
    stock_disponible = models.IntegerField(null=True, blank=True)
    delai_livraison_estime = models.IntegerField()  # en jours
    distance_fournisseur = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    # Scores et classements
    score_prix = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)  # 0-100
    score_qualite = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)  # 0-100
    score_global = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)  # 0-100
    rang_prix = models.IntegerField(null=True, blank=True)
    rang_global = models.IntegerField(null=True, blank=True)
    
    # Métadonnées
    date_creation = models.DateTimeField(auto_now_add=True)
    source_donnees = models.CharField(max_length=50)  # api, scraping, manual
    fiabilite_donnees = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)  # 0-1

    class Meta:
        verbose_name = "Résultat de comparaison"
        verbose_name_plural = "Résultats de comparaison"
        ordering = ['rang_global', 'prix_total_ttc']
        indexes = [
            models.Index(fields=['recherche', 'rang_global']),
            models.Index(fields=['prix_total_ttc']),
            models.Index(fields=['score_global']),
        ]

    def __str__(self):
        return f"{self.prix_produit.produit.nom} - {self.prix_produit.fournisseur.nom}: {self.prix_total_ttc}€"

    def get_economie_vs_plus_cher(self):
        """Calcule l'économie par rapport au résultat le plus cher de la même recherche."""
        prix_max = self.recherche.resultats.aggregate(
            models.Max('prix_total_ttc')
        )['prix_total_ttc__max']
        if prix_max and prix_max > self.prix_total_ttc:
            return prix_max - self.prix_total_ttc
        return 0

    def get_pourcentage_economie(self):
        """Calcule le pourcentage d'économie par rapport au prix le plus élevé."""
        economie = self.get_economie_vs_plus_cher()
        prix_max = self.recherche.resultats.aggregate(
            models.Max('prix_total_ttc')
        )['prix_total_ttc__max']
        if prix_max and prix_max > 0:
            return (economie / prix_max) * 100
        return 0


class RecommandationAchat(models.Model):
    """
    Modèle pour les recommandations d'achat générées par l'IA.
    """
    TYPE_RECOMMANDATION_CHOICES = [
        ('meilleur_prix', 'Meilleur prix'),
        ('meilleur_rapport', 'Meilleur rapport qualité/prix'),
        ('livraison_rapide', 'Livraison la plus rapide'),
        ('fournisseur_local', 'Fournisseur local'),
        ('achat_groupe', 'Achat groupé'),
        ('alternative', 'Produit alternatif'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recherche = models.ForeignKey(RechercheComparaison, on_delete=models.CASCADE, related_name='recommandations')
    type_recommandation = models.CharField(max_length=20, choices=TYPE_RECOMMANDATION_CHOICES)
    
    # Recommandation principale
    resultat_recommande = models.ForeignKey(ResultatComparaison, on_delete=models.CASCADE, null=True, blank=True)
    produit_alternatif = models.ForeignKey(Produit, on_delete=models.CASCADE, null=True, blank=True)
    
    # Détails de la recommandation
    titre = models.CharField(max_length=200)
    description = models.TextField()
    economie_estimee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    pourcentage_economie = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Scoring et confiance
    score_confiance = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)  # 0-1
    priorite = models.IntegerField(default=1)  # 1 = haute, 5 = basse
    
    # Métadonnées
    date_creation = models.DateTimeField(auto_now_add=True)
    vue_par_utilisateur = models.BooleanField(default=False)
    acceptee_par_utilisateur = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Recommandation d'achat"
        verbose_name_plural = "Recommandations d'achat"
        ordering = ['priorite', '-score_confiance']

    def __str__(self):
        return f"{self.get_type_recommandation_display()}: {self.titre}"


class AnalyseMarche(models.Model):
    """
    Modèle pour l'analyse de marché des produits.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='analyses_marche')
    
    # Statistiques de prix
    prix_moyen_marche = models.DecimalField(max_digits=10, decimal_places=2)
    prix_median = models.DecimalField(max_digits=10, decimal_places=2)
    prix_min_marche = models.DecimalField(max_digits=10, decimal_places=2)
    prix_max_marche = models.DecimalField(max_digits=10, decimal_places=2)
    ecart_type_prix = models.DecimalField(max_digits=10, decimal_places=4)
    
    # Analyse de la concurrence
    nombre_fournisseurs = models.IntegerField()
    nombre_fournisseurs_stock = models.IntegerField()
    delai_moyen_livraison = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Tendances
    tendance_prix = models.CharField(max_length=20, choices=[
        ('hausse', 'En hausse'),
        ('baisse', 'En baisse'),
        ('stable', 'Stable'),
        ('volatile', 'Volatile'),
    ], default='stable')
    variation_prix_7j = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    variation_prix_30j = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    
    # Recommandations temporelles
    meilleur_moment_achat = models.CharField(max_length=100, blank=True)
    alerte_prix_recommande = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Métadonnées
    date_analyse = models.DateTimeField(auto_now_add=True)
    periode_analyse_debut = models.DateTimeField()
    periode_analyse_fin = models.DateTimeField()
    fiabilite_analyse = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)

    class Meta:
        verbose_name = "Analyse de marché"
        verbose_name_plural = "Analyses de marché"
        ordering = ['-date_analyse']

    def __str__(self):
        return f"Analyse marché {self.produit.nom} - {self.date_analyse.strftime('%d/%m/%Y')}"


class ConfigurationUtilisateur(models.Model):
    """
    Modèle pour les préférences de comparaison des utilisateurs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.OneToOneField(User, on_delete=models.CASCADE, related_name='config_comparateur')
    
    # Préférences de recherche
    rayon_recherche_defaut = models.IntegerField(default=50, help_text="Rayon en km")
    adresse_defaut = models.TextField(blank=True)
    latitude_defaut = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude_defaut = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Préférences de tri et filtrage
    tri_defaut = models.CharField(max_length=50, default='prix')
    fournisseurs_preferes = models.ManyToManyField(Fournisseur, blank=True)
    fournisseurs_exclus = models.ManyToManyField(Fournisseur, related_name='exclus_par', blank=True)
    
    # Seuils et alertes
    seuil_alerte_prix = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)  # %
    notifications_email = models.BooleanField(default=True)
    notifications_push = models.BooleanField(default=False)
    
    # Préférences d'affichage
    nombre_resultats_par_page = models.IntegerField(default=20)
    afficher_frais_livraison = models.BooleanField(default=True)
    afficher_notes_fournisseurs = models.BooleanField(default=True)
    afficher_historique_prix = models.BooleanField(default=False)
    
    # Métadonnées
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuration utilisateur"
        verbose_name_plural = "Configurations utilisateur"

    def __str__(self):
        return f"Config {self.utilisateur.username}"


class StatistiqueUtilisation(models.Model):
    """
    Modèle pour les statistiques d'utilisation du comparateur.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Identification
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    adresse_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Action effectuée
    action = models.CharField(max_length=50, choices=[
        ('recherche', 'Recherche'),
        ('comparaison', 'Comparaison'),
        ('clic_fournisseur', 'Clic fournisseur'),
        ('sauvegarde', 'Sauvegarde'),
        ('partage', 'Partage'),
        ('alerte_creation', 'Création alerte'),
    ])
    
    # Détails de l'action
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, null=True, blank=True)
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE, null=True, blank=True)
    recherche = models.ForeignKey(RechercheComparaison, on_delete=models.CASCADE, null=True, blank=True)
    
    # Métadonnées
    date_action = models.DateTimeField(auto_now_add=True)
    duree_session = models.IntegerField(null=True, blank=True, help_text="Durée en secondes")
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(blank=True)

    class Meta:
        verbose_name = "Statistique d'utilisation"
        verbose_name_plural = "Statistiques d'utilisation"
        ordering = ['-date_action']
        indexes = [
            models.Index(fields=['action', 'date_action']),
            models.Index(fields=['utilisateur', 'date_action']),
        ]

    def __str__(self):
        user_info = self.utilisateur.username if self.utilisateur else f"Anonyme ({self.session_id[:8]})"
        return f"{self.get_action_display()} - {user_info} - {self.date_action.strftime('%d/%m/%Y %H:%M')}"
