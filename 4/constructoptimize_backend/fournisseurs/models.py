from django.db import models
import uuid
from django.contrib.auth.models import User
from produits.models import Produit

class Fournisseur(models.Model):
    """
    Modèle pour les fournisseurs de matériaux BTP.
    """
    TYPE_FOURNISSEUR_CHOICES = [
        ('distributeur', 'Distributeur'),
        ('fabricant', 'Fabricant'),
        ('grossiste', 'Grossiste'),
        ('detaillant', 'Détaillant'),
        ('marketplace', 'Marketplace'),
        ('local', 'Fournisseur local'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=200)
    nom_commercial = models.CharField(max_length=200, blank=True)
    type_fournisseur = models.CharField(max_length=20, choices=TYPE_FOURNISSEUR_CHOICES)
    
    # Informations de contact
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    site_web = models.URLField(blank=True)
    
    # Adresse
    adresse = models.TextField(blank=True)
    ville = models.CharField(max_length=100, blank=True)
    code_postal = models.CharField(max_length=10, blank=True)
    pays = models.CharField(max_length=100, default='France')
    
    # Coordonnées GPS pour la proximité
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Informations commerciales
    siret = models.CharField(max_length=14, blank=True)
    tva_intracommunautaire = models.CharField(max_length=20, blank=True)
    
    # Configuration API/Scraping
    api_url = models.URLField(blank=True, help_text="URL de l'API du fournisseur")
    api_key = models.CharField(max_length=200, blank=True)
    scraping_url = models.URLField(blank=True, help_text="URL de base pour le scraping")
    scraping_config = models.JSONField(default=dict, blank=True)
    
    # Métadonnées
    logo = models.ImageField(upload_to='fournisseurs/logos/', blank=True, null=True)
    description = models.TextField(blank=True)
    note_qualite = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    nombre_evaluations = models.IntegerField(default=0)
    
    # Paramètres opérationnels
    delai_livraison_moyen = models.IntegerField(default=7, help_text="Délai en jours")
    frais_livraison_gratuite = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    accepte_commandes_en_ligne = models.BooleanField(default=False)
    
    # Statut
    active = models.BooleanField(default=True)
    verifie = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    derniere_synchronisation = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Fournisseur"
        verbose_name_plural = "Fournisseurs"
        ordering = ['nom']
        indexes = [
            models.Index(fields=['type_fournisseur']),
            models.Index(fields=['ville']),
            models.Index(fields=['active']),
        ]

    def __str__(self):
        return f"{self.nom} ({self.get_type_fournisseur_display()})"

    def get_distance_from(self, latitude, longitude):
        """Calcule la distance depuis un point donné (en km)."""
        if not self.latitude or not self.longitude:
            return None
        
        from math import radians, cos, sin, asin, sqrt
        
        # Formule de Haversine
        lat1, lon1 = radians(float(self.latitude)), radians(float(self.longitude))
        lat2, lon2 = radians(latitude), radians(longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371  # Rayon de la Terre en km
        
        return c * r

    def get_nombre_produits(self):
        """Retourne le nombre de produits disponibles chez ce fournisseur."""
        return self.prix_produits.filter(disponible=True).count()


class PrixProduit(models.Model):
    """
    Modèle pour les prix des produits chez les fournisseurs.
    """
    DEVISE_CHOICES = [
        ('EUR', 'Euro'),
        ('USD', 'Dollar US'),
        ('GBP', 'Livre Sterling'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='prix_fournisseurs')
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE, related_name='prix_produits')
    
    # Prix et conditions
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    devise = models.CharField(max_length=3, choices=DEVISE_CHOICES, default='EUR')
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    quantite_minimale = models.IntegerField(default=1)
    quantite_maximale = models.IntegerField(null=True, blank=True)
    
    # Remises par quantité
    remise_10_pieces = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    remise_50_pieces = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    remise_100_pieces = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    # Disponibilité et livraison
    disponible = models.BooleanField(default=True)
    stock_disponible = models.IntegerField(null=True, blank=True)
    delai_livraison = models.IntegerField(default=7, help_text="Délai en jours")
    frais_livraison = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)
    
    # Référence chez le fournisseur
    reference_fournisseur = models.CharField(max_length=100, blank=True)
    url_produit = models.URLField(blank=True)
    
    # Métadonnées
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    derniere_verification = models.DateTimeField(auto_now=True)
    source_donnees = models.CharField(max_length=50, default='manual')  # manual, api, scraping

    class Meta:
        verbose_name = "Prix produit"
        verbose_name_plural = "Prix produits"
        unique_together = ['produit', 'fournisseur']
        ordering = ['prix']
        indexes = [
            models.Index(fields=['produit', 'prix']),
            models.Index(fields=['fournisseur', 'disponible']),
            models.Index(fields=['derniere_verification']),
        ]

    def __str__(self):
        return f"{self.produit.nom} - {self.fournisseur.nom}: {self.prix}€"

    def get_prix_avec_remise(self, quantite):
        """Calcule le prix avec remise selon la quantité."""
        prix_base = self.prix
        
        if quantite >= 100 and self.remise_100_pieces > 0:
            return prix_base * (1 - self.remise_100_pieces / 100)
        elif quantite >= 50 and self.remise_50_pieces > 0:
            return prix_base * (1 - self.remise_50_pieces / 100)
        elif quantite >= 10 and self.remise_10_pieces > 0:
            return prix_base * (1 - self.remise_10_pieces / 100)
        
        return prix_base

    def get_prix_total(self, quantite):
        """Calcule le prix total incluant les frais de livraison."""
        prix_unitaire = self.get_prix_avec_remise(quantite)
        prix_total = prix_unitaire * quantite
        
        # Ajouter les frais de livraison si pas de seuil de gratuité
        if (self.fournisseur.frais_livraison_gratuite is None or 
            prix_total < self.fournisseur.frais_livraison_gratuite):
            prix_total += self.frais_livraison
            
        return prix_total


class HistoriquePrix(models.Model):
    """
    Modèle pour l'historique des prix des produits.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prix_produit = models.ForeignKey(PrixProduit, on_delete=models.CASCADE, related_name='historique')
    prix_precedent = models.DecimalField(max_digits=10, decimal_places=2)
    prix_nouveau = models.DecimalField(max_digits=10, decimal_places=2)
    variation_pourcentage = models.DecimalField(max_digits=6, decimal_places=2)
    date_changement = models.DateTimeField(auto_now_add=True)
    raison_changement = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "Historique de prix"
        verbose_name_plural = "Historiques de prix"
        ordering = ['-date_changement']

    def __str__(self):
        signe = "+" if self.variation_pourcentage > 0 else ""
        return f"{self.prix_produit} : {signe}{self.variation_pourcentage}%"

    def save(self, *args, **kwargs):
        # Calculer la variation en pourcentage
        if self.prix_precedent > 0:
            self.variation_pourcentage = ((self.prix_nouveau - self.prix_precedent) / self.prix_precedent) * 100
        super().save(*args, **kwargs)


class AlertePrix(models.Model):
    """
    Modèle pour les alertes de prix des utilisateurs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE, null=True, blank=True)
    
    # Conditions d'alerte
    prix_cible = models.DecimalField(max_digits=10, decimal_places=2)
    type_alerte = models.CharField(max_length=20, choices=[
        ('prix_baisse', 'Prix en baisse'),
        ('prix_seuil', 'Prix sous un seuil'),
        ('disponibilite', 'Retour en stock'),
    ], default='prix_seuil')
    
    # Statut
    active = models.BooleanField(default=True)
    declenchee = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_declenchement = models.DateTimeField(null=True, blank=True)
    
    # Notifications
    notification_email = models.BooleanField(default=True)
    notification_push = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Alerte de prix"
        verbose_name_plural = "Alertes de prix"
        ordering = ['-date_creation']

    def __str__(self):
        return f"Alerte {self.utilisateur.username} - {self.produit.nom} < {self.prix_cible}€"


class EvaluationFournisseur(models.Model):
    """
    Modèle pour les évaluations des fournisseurs par les utilisateurs.
    """
    NOTES_CHOICES = [
        (1, '1 étoile'),
        (2, '2 étoiles'),
        (3, '3 étoiles'),
        (4, '4 étoiles'),
        (5, '5 étoiles'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE, related_name='evaluations')
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Évaluations détaillées
    note_globale = models.IntegerField(choices=NOTES_CHOICES)
    note_qualite_produits = models.IntegerField(choices=NOTES_CHOICES)
    note_delai_livraison = models.IntegerField(choices=NOTES_CHOICES)
    note_service_client = models.IntegerField(choices=NOTES_CHOICES)
    note_rapport_qualite_prix = models.IntegerField(choices=NOTES_CHOICES)
    
    # Commentaires
    commentaire = models.TextField(blank=True)
    recommande = models.BooleanField(default=True)
    
    # Métadonnées
    date_creation = models.DateTimeField(auto_now_add=True)
    verifie = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Évaluation de fournisseur"
        verbose_name_plural = "Évaluations de fournisseurs"
        unique_together = ['fournisseur', 'utilisateur']
        ordering = ['-date_creation']

    def __str__(self):
        return f"Évaluation {self.note_globale}/5 - {self.fournisseur.nom}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Mettre à jour la note du fournisseur
        self.fournisseur.mettre_a_jour_note_qualite()

    def delete(self, *args, **kwargs):
        fournisseur = self.fournisseur
        super().delete(*args, **kwargs)
        # Mettre à jour la note du fournisseur
        fournisseur.mettre_a_jour_note_qualite()


# Ajouter une méthode à Fournisseur pour mettre à jour la note de qualité
def mettre_a_jour_note_qualite(self):
    """Met à jour la note de qualité moyenne du fournisseur."""
    evaluations = self.evaluations.filter(verifie=True)
    if evaluations.exists():
        self.note_qualite = evaluations.aggregate(models.Avg('note_globale'))['note_globale__avg']
        self.nombre_evaluations = evaluations.count()
    else:
        self.note_qualite = 0.0
        self.nombre_evaluations = 0
    self.save(update_fields=['note_qualite', 'nombre_evaluations'])

# Ajouter la méthode à la classe Fournisseur
Fournisseur.mettre_a_jour_note_qualite = mettre_a_jour_note_qualite


class ConfigurationScraping(models.Model):
    """
    Modèle pour la configuration du scraping par fournisseur.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fournisseur = models.OneToOneField(Fournisseur, on_delete=models.CASCADE, related_name='config_scraping')
    
    # Sélecteurs CSS/XPath
    selecteur_prix = models.CharField(max_length=200, blank=True)
    selecteur_disponibilite = models.CharField(max_length=200, blank=True)
    selecteur_stock = models.CharField(max_length=200, blank=True)
    selecteur_delai = models.CharField(max_length=200, blank=True)
    
    # Configuration avancée
    headers_http = models.JSONField(default=dict, blank=True)
    cookies_requis = models.JSONField(default=dict, blank=True)
    delai_entre_requetes = models.IntegerField(default=1, help_text="Délai en secondes")
    
    # Gestion des erreurs
    max_tentatives = models.IntegerField(default=3)
    timeout_requete = models.IntegerField(default=10, help_text="Timeout en secondes")
    
    # Statut
    active = models.BooleanField(default=True)
    derniere_execution = models.DateTimeField(null=True, blank=True)
    derniere_erreur = models.TextField(blank=True)

    class Meta:
        verbose_name = "Configuration de scraping"
        verbose_name_plural = "Configurations de scraping"

    def __str__(self):
        return f"Config scraping - {self.fournisseur.nom}"
