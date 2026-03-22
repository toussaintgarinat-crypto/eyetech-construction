from django.db import models
from django.contrib.auth.models import User
import uuid
import json

class CorpsMetier(models.Model):
    """
    Représente un corps de métier du BTP (placo, électricité, plomberie, etc.)
    """
    CORPS_METIER_CHOICES = [
        ('placo', 'Placo'),
        ('electricite', 'Électricité'),
        ('plomberie', 'Plomberie'),
        ('cvc', 'CVC (Chauffage, Ventilation, Climatisation)'),
        ('peinture', 'Peinture'),
        ('carrelage', 'Carrelage'),
        ('menuiserie', 'Menuiserie'),
        ('maconnerie', 'Maçonnerie'),
        ('isolation', 'Isolation'),
        ('couverture', 'Couverture'),
        ('charpente', 'Charpente'),
        ('cloisons', 'Cloisons'),
        ('revetement_sol', 'Revêtement de sol'),
        ('etancheite', 'Étanchéité'),
        ('metallerie', 'Métallerie'),
        ('vitrerie', 'Vitrerie'),
        ('ascenseur', 'Ascenseur'),
        ('securite', 'Sécurité'),
        ('domotique', 'Domotique'),
        ('autre', 'Autre'),
    ]
    
    nom = models.CharField(max_length=50, choices=CORPS_METIER_CHOICES, unique=True)
    nom_affichage = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    couleur_principale = models.CharField(max_length=7, default='#3B82F6')  # Couleur hex
    icone = models.CharField(max_length=50, default='tool')  # Nom de l'icône
    actif = models.BooleanField(default=True)
    ordre_affichage = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Corps de métier"
        verbose_name_plural = "Corps de métiers"
        ordering = ['ordre_affichage', 'nom_affichage']
    
    def __str__(self):
        return self.nom_affichage

class Projet(models.Model):
    """
    Représente un projet de construction
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    adresse = models.CharField(max_length=500, blank=True)
    
    # Coordonnées géographiques
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Métadonnées du projet
    surface_totale = models.FloatField(null=True, blank=True, help_text="Surface en m²")
    nombre_etages = models.IntegerField(null=True, blank=True)
    type_batiment = models.CharField(max_length=100, blank=True)
    
    # Gestion des utilisateurs
    proprietaire = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projets_proprietaire')
    collaborateurs = models.ManyToManyField(User, blank=True, related_name='projets_collaborateur')
    
    # Statut du projet
    STATUT_CHOICES = [
        ('planification', 'Planification'),
        ('en_cours', 'En cours'),
        ('suspendu', 'Suspendu'),
        ('termine', 'Terminé'),
        ('archive', 'Archivé'),
    ]
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='planification')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Projet"
        verbose_name_plural = "Projets"
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.nom

class CalqueMetier(models.Model):
    """
    Représente un calque spécifique à un corps de métier pour un projet
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Relations
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='calques')
    corps_metier = models.ForeignKey(CorpsMetier, on_delete=models.CASCADE, related_name='calques')
    
    # Propriétés visuelles
    couleur = models.CharField(max_length=7, blank=True)  # Hérite du corps de métier si vide
    opacite = models.FloatField(default=0.8, help_text="Opacité entre 0 et 1")
    style_ligne = models.CharField(max_length=20, default='solid', choices=[
        ('solid', 'Solide'),
        ('dashed', 'Tirets'),
        ('dotted', 'Pointillés'),
    ])
    epaisseur_ligne = models.FloatField(default=2.0)
    
    # Gestion de l'affichage
    visible = models.BooleanField(default=True)
    verrouille = models.BooleanField(default=False)
    priorite_affichage = models.IntegerField(default=0)
    
    # Métadonnées
    version = models.IntegerField(default=1)
    auteur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calques_crees')
    derniere_modification_par = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calques_modifies')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Calque métier"
        verbose_name_plural = "Calques métiers"
        ordering = ['priorite_affichage', '-updated_at']
        unique_together = ['projet', 'nom']
    
    def __str__(self):
        return f"{self.nom} ({self.corps_metier.nom_affichage})"
    
    def save(self, *args, **kwargs):
        # Hériter de la couleur du corps de métier si non définie
        if not self.couleur:
            self.couleur = self.corps_metier.couleur_principale
        super().save(*args, **kwargs)

class ElementCalque(models.Model):
    """
    Représente un élément graphique dans un calque métier
    """
    TYPE_ELEMENT_CHOICES = [
        ('point', 'Point'),
        ('ligne', 'Ligne'),
        ('polygone', 'Polygone'),
        ('rectangle', 'Rectangle'),
        ('cercle', 'Cercle'),
        ('texte', 'Texte'),
        ('symbole', 'Symbole'),
        ('modele_3d', 'Modèle 3D'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    calque = models.ForeignKey(CalqueMetier, on_delete=models.CASCADE, related_name='elements')
    
    # Type et propriétés de l'élément
    type_element = models.CharField(max_length=20, choices=TYPE_ELEMENT_CHOICES)
    nom = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    
    # Données géométriques (stockées en JSON)
    geometrie = models.JSONField(help_text="Coordonnées et propriétés géométriques")
    
    # Propriétés visuelles spécifiques
    couleur = models.CharField(max_length=7, blank=True)
    opacite = models.FloatField(default=1.0)
    taille = models.FloatField(default=1.0)
    rotation = models.FloatField(default=0.0, help_text="Rotation en degrés")
    
    # Métadonnées métier
    proprietes_metier = models.JSONField(default=dict, blank=True, 
                                       help_text="Propriétés spécifiques au métier")
    
    # Gestion
    visible = models.BooleanField(default=True)
    verrouille = models.BooleanField(default=False)
    auteur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='elements_crees')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Élément de calque"
        verbose_name_plural = "Éléments de calque"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.nom or self.type_element} - {self.calque.nom}"

class Annotation(models.Model):
    """
    Représente une annotation liée à un élément ou une position dans un calque
    """
    TYPE_ANNOTATION_CHOICES = [
        ('note', 'Note'),
        ('question', 'Question'),
        ('probleme', 'Problème'),
        ('validation', 'Validation'),
        ('mesure', 'Mesure'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    calque = models.ForeignKey(CalqueMetier, on_delete=models.CASCADE, related_name='annotations')
    element = models.ForeignKey(ElementCalque, on_delete=models.CASCADE, null=True, blank=True, 
                               related_name='annotations')
    
    # Contenu de l'annotation
    type_annotation = models.CharField(max_length=20, choices=TYPE_ANNOTATION_CHOICES)
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    
    # Position (si non liée à un élément)
    position_x = models.FloatField(null=True, blank=True)
    position_y = models.FloatField(null=True, blank=True)
    position_z = models.FloatField(null=True, blank=True)
    
    # Gestion des tâches
    assigne_a = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                 related_name='annotations_assignees')
    STATUT_CHOICES = [
        ('ouvert', 'Ouvert'),
        ('en_cours', 'En cours'),
        ('resolu', 'Résolu'),
        ('ferme', 'Fermé'),
    ]
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='ouvert')
    priorite = models.IntegerField(default=1, choices=[
        (1, 'Basse'),
        (2, 'Normale'),
        (3, 'Haute'),
        (4, 'Critique'),
    ])
    
    # Métadonnées
    auteur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='annotations_creees')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Annotation"
        verbose_name_plural = "Annotations"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.titre} ({self.type_annotation})"

class ConflitCalque(models.Model):
    """
    Représente un conflit détecté entre éléments de différents calques
    """
    TYPE_CONFLIT_CHOICES = [
        ('intersection', 'Intersection physique'),
        ('proximite', 'Proximité problématique'),
        ('acces', "Problème d'accès"),
        ('norme', 'Non-conformité aux normes'),
        ('sequence', 'Problème de séquence de travaux'),
    ]
    
    GRAVITE_CHOICES = [
        (1, 'Mineure'),
        (2, 'Modérée'),
        (3, 'Majeure'),
        (4, 'Critique'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Éléments en conflit
    element_1 = models.ForeignKey(ElementCalque, on_delete=models.CASCADE, related_name='conflits_element_1')
    element_2 = models.ForeignKey(ElementCalque, on_delete=models.CASCADE, related_name='conflits_element_2')
    
    # Description du conflit
    type_conflit = models.CharField(max_length=20, choices=TYPE_CONFLIT_CHOICES)
    gravite = models.IntegerField(choices=GRAVITE_CHOICES)
    description = models.TextField()
    
    # Position du conflit
    position_conflit = models.JSONField(help_text="Coordonnées du point de conflit")
    
    # Suggestions de résolution
    suggestions_resolution = models.JSONField(default=list, blank=True)
    
    # Gestion du conflit
    STATUT_CHOICES = [
        ('detecte', 'Détecté'),
        ('en_cours', 'En cours de résolution'),
        ('resolu', 'Résolu'),
        ('ignore', 'Ignoré'),
    ]
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='detecte')
    resolu_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                  related_name='conflits_resolus')
    solution_appliquee = models.TextField(blank=True)
    
    # Métadonnées
    detecte_automatiquement = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Conflit de calque"
        verbose_name_plural = "Conflits de calques"
        ordering = ['-gravite', '-created_at']
    
    def __str__(self):
        return f"Conflit {self.type_conflit} - {self.element_1.calque.nom} vs {self.element_2.calque.nom}"

class BibliothequeSymboles(models.Model):
    """
    Bibliothèque de symboles standards pour chaque corps de métier
    """
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    corps_metier = models.ForeignKey(CorpsMetier, on_delete=models.CASCADE, related_name='symboles')
    
    # Données du symbole
    fichier_symbole = models.FileField(upload_to='symboles/', null=True, blank=True)
    donnees_svg = models.TextField(blank=True, help_text="Code SVG du symbole")
    proprietes_defaut = models.JSONField(default=dict, blank=True)
    
    # Métadonnées
    standard = models.BooleanField(default=False, help_text="Symbole standard de l'industrie")
    version = models.CharField(max_length=20, default='1.0')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Symbole de bibliothèque"
        verbose_name_plural = "Bibliothèque de symboles"
        ordering = ['corps_metier', 'nom']
    
    def __str__(self):
        return f"{self.nom} ({self.corps_metier.nom_affichage})"
