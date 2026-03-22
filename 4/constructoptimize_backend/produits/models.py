from django.db import models
import uuid
from django.contrib.auth.models import User

class Categorie(models.Model):
    """
    Modèle pour les catégories de produits BTP.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent_categorie = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='sous_categories'
    )
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    ordre_affichage = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['ordre_affichage', 'nom']

    def __str__(self):
        return self.nom

    def get_full_path(self):
        """Retourne le chemin complet de la catégorie."""
        if self.parent_categorie:
            return f"{self.parent_categorie.get_full_path()} > {self.nom}"
        return self.nom


class Marque(models.Model):
    """
    Modèle pour les marques de produits.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='marques/', blank=True, null=True)
    site_web = models.URLField(blank=True)
    active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Marque"
        verbose_name_plural = "Marques"
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Produit(models.Model):
    """
    Modèle principal pour les produits BTP.
    """
    UNITE_CHOICES = [
        ('piece', 'Pièce'),
        ('m', 'Mètre'),
        ('m2', 'Mètre carré'),
        ('m3', 'Mètre cube'),
        ('kg', 'Kilogramme'),
        ('tonne', 'Tonne'),
        ('litre', 'Litre'),
        ('sac', 'Sac'),
        ('palette', 'Palette'),
        ('lot', 'Lot'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=200)
    description = models.TextField()
    description_courte = models.CharField(max_length=500, blank=True)
    
    # Classification
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE, related_name='produits')
    marque = models.ForeignKey(Marque, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Identifiants produit
    sku = models.CharField(max_length=50, unique=True, null=True, blank=True)
    ean = models.CharField(max_length=13, unique=True, null=True, blank=True)
    reference_fabricant = models.CharField(max_length=100, blank=True)
    
    # Caractéristiques
    unite_mesure = models.CharField(max_length=20, choices=UNITE_CHOICES, default='piece')
    poids = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    dimensions_longueur = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dimensions_largeur = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dimensions_hauteur = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Images et médias
    image_principale = models.ImageField(upload_to='produits/', blank=True, null=True)
    fiche_technique = models.FileField(upload_to='fiches_techniques/', blank=True, null=True)
    
    # Évaluations
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    nombre_avis = models.IntegerField(default=0)
    
    # Métadonnées
    active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    derniere_maj_prix = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ['-date_modification']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['ean']),
            models.Index(fields=['categorie']),
            models.Index(fields=['marque']),
        ]

    def __str__(self):
        return f"{self.nom} ({self.sku or 'Sans SKU'})"

    def get_prix_min(self):
        """Retourne le prix minimum parmi tous les fournisseurs."""
        from fournisseurs.models import PrixProduit
        prix_min = PrixProduit.objects.filter(
            produit=self, 
            fournisseur__active=True
        ).aggregate(models.Min('prix'))['prix__min']
        return prix_min

    def get_prix_max(self):
        """Retourne le prix maximum parmi tous les fournisseurs."""
        from fournisseurs.models import PrixProduit
        prix_max = PrixProduit.objects.filter(
            produit=self, 
            fournisseur__active=True
        ).aggregate(models.Max('prix'))['prix__max']
        return prix_max

    def get_nombre_fournisseurs(self):
        """Retourne le nombre de fournisseurs actifs pour ce produit."""
        from fournisseurs.models import PrixProduit
        return PrixProduit.objects.filter(
            produit=self, 
            fournisseur__active=True
        ).values('fournisseur').distinct().count()


class ImageProduit(models.Model):
    """
    Modèle pour les images supplémentaires des produits.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='produits/images/')
    alt_text = models.CharField(max_length=200, blank=True)
    ordre = models.IntegerField(default=0)
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Image de produit"
        verbose_name_plural = "Images de produits"
        ordering = ['ordre', 'date_ajout']

    def __str__(self):
        return f"Image {self.ordre} - {self.produit.nom}"


class CaracteristiqueProduit(models.Model):
    """
    Modèle pour les caractéristiques techniques des produits.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='caracteristiques')
    nom = models.CharField(max_length=100)
    valeur = models.CharField(max_length=200)
    unite = models.CharField(max_length=20, blank=True)
    ordre = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Caractéristique de produit"
        verbose_name_plural = "Caractéristiques de produits"
        ordering = ['ordre', 'nom']
        unique_together = ['produit', 'nom']

    def __str__(self):
        unite_str = f" {self.unite}" if self.unite else ""
        return f"{self.nom}: {self.valeur}{unite_str}"


class AvisProduit(models.Model):
    """
    Modèle pour les avis clients sur les produits.
    """
    NOTES_CHOICES = [
        (1, '1 étoile'),
        (2, '2 étoiles'),
        (3, '3 étoiles'),
        (4, '4 étoiles'),
        (5, '5 étoiles'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='avis')
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    nom_utilisateur = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    note = models.IntegerField(choices=NOTES_CHOICES)
    titre = models.CharField(max_length=200, blank=True)
    commentaire = models.TextField()
    verifie = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Avis produit"
        verbose_name_plural = "Avis produits"
        ordering = ['-date_creation']

    def __str__(self):
        return f"Avis {self.note}/5 - {self.produit.nom}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Mettre à jour la note moyenne du produit
        self.produit.mettre_a_jour_note_moyenne()

    def delete(self, *args, **kwargs):
        produit = self.produit
        super().delete(*args, **kwargs)
        # Mettre à jour la note moyenne du produit
        produit.mettre_a_jour_note_moyenne()


# Ajouter une méthode à Produit pour mettre à jour la note moyenne
def mettre_a_jour_note_moyenne(self):
    """Met à jour la note moyenne et le nombre d'avis du produit."""
    avis = self.avis.filter(verifie=True)
    if avis.exists():
        self.note_moyenne = avis.aggregate(models.Avg('note'))['note__avg']
        self.nombre_avis = avis.count()
    else:
        self.note_moyenne = 0.0
        self.nombre_avis = 0
    self.save(update_fields=['note_moyenne', 'nombre_avis'])

# Ajouter la méthode à la classe Produit
Produit.mettre_a_jour_note_moyenne = mettre_a_jour_note_moyenne


class ListeSouhaits(models.Model):
    """
    Modèle pour les listes de souhaits des utilisateurs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100, default="Ma liste de souhaits")
    produits = models.ManyToManyField(Produit, through='ElementListeSouhaits')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Liste de souhaits"
        verbose_name_plural = "Listes de souhaits"
        ordering = ['-date_modification']

    def __str__(self):
        return f"{self.nom} - {self.utilisateur.username}"


class ElementListeSouhaits(models.Model):
    """
    Modèle intermédiaire pour les éléments des listes de souhaits.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    liste_souhaits = models.ForeignKey(ListeSouhaits, on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField(default=1)
    notes = models.TextField(blank=True)
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Élément de liste de souhaits"
        verbose_name_plural = "Éléments de listes de souhaits"
        unique_together = ['liste_souhaits', 'produit']
        ordering = ['-date_ajout']

    def __str__(self):
        return f"{self.produit.nom} x{self.quantite}"
