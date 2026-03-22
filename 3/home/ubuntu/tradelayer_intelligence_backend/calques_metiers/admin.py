from django.contrib import admin
from .models import (
    CorpsMetier, Projet, CalqueMetier, ElementCalque,
    Annotation, ConflitCalque, BibliothequeSymboles
)

@admin.register(CorpsMetier)
class CorpsMetierAdmin(admin.ModelAdmin):
    list_display = ['nom_affichage', 'nom', 'couleur_principale', 'actif', 'ordre_affichage']
    list_filter = ['actif', 'nom']
    search_fields = ['nom_affichage', 'description']
    ordering = ['ordre_affichage', 'nom_affichage']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'nom_affichage', 'description')
        }),
        ('Apparence', {
            'fields': ('couleur_principale', 'icone')
        }),
        ('Configuration', {
            'fields': ('actif', 'ordre_affichage')
        }),
    )

@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    list_display = ['nom', 'proprietaire', 'statut', 'created_at', 'updated_at']
    list_filter = ['statut', 'created_at', 'type_batiment']
    search_fields = ['nom', 'description', 'adresse']
    filter_horizontal = ['collaborateurs']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'description', 'adresse')
        }),
        ('Localisation', {
            'fields': ('latitude', 'longitude')
        }),
        ('Métadonnées', {
            'fields': ('surface_totale', 'nombre_etages', 'type_batiment')
        }),
        ('Gestion', {
            'fields': ('proprietaire', 'collaborateurs', 'statut')
        }),
        ('Horodatage', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(CalqueMetier)
class CalqueMetierAdmin(admin.ModelAdmin):
    list_display = ['nom', 'projet', 'corps_metier', 'visible', 'verrouille', 'auteur']
    list_filter = ['corps_metier', 'visible', 'verrouille', 'created_at']
    search_fields = ['nom', 'description', 'projet__nom']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'description', 'projet', 'corps_metier')
        }),
        ('Propriétés visuelles', {
            'fields': ('couleur', 'opacite', 'style_ligne', 'epaisseur_ligne')
        }),
        ("Gestion de l'affichage", {
            'fields': ('visible', 'verrouille', 'priorite_affichage')
        }),
        ('Métadonnées', {
            'fields': ('version', 'auteur', 'derniere_modification_par')
        }),
        ('Horodatage', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ElementCalque)
class ElementCalqueAdmin(admin.ModelAdmin):
    list_display = ['nom', 'type_element', 'calque', 'visible', 'auteur']
    list_filter = ['type_element', 'visible', 'verrouille', 'created_at']
    search_fields = ['nom', 'description', 'calque__nom']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('calque', 'type_element', 'nom', 'description')
        }),
        ('Géométrie', {
            'fields': ('geometrie',)
        }),
        ('Propriétés visuelles', {
            'fields': ('couleur', 'opacite', 'taille', 'rotation')
        }),
        ('Propriétés métier', {
            'fields': ('proprietes_metier',)
        }),
        ('Gestion', {
            'fields': ('visible', 'verrouille', 'auteur')
        }),
        ('Horodatage', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ['titre', 'type_annotation', 'calque', 'statut', 'priorite', 'auteur']
    list_filter = ['type_annotation', 'statut', 'priorite', 'created_at']
    search_fields = ['titre', 'contenu', 'calque__nom']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('calque', 'element', 'type_annotation', 'titre', 'contenu')
        }),
        ('Position', {
            'fields': ('position_x', 'position_y', 'position_z')
        }),
        ('Gestion des tâches', {
            'fields': ('assigne_a', 'statut', 'priorite')
        }),
        ('Métadonnées', {
            'fields': ('auteur',)
        }),
        ('Horodatage', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ConflitCalque)
class ConflitCalqueAdmin(admin.ModelAdmin):
    list_display = ['type_conflit', 'gravite', 'statut', 'element_1', 'element_2']
    list_filter = ['type_conflit', 'gravite', 'statut', 'detecte_automatiquement', 'created_at']
    search_fields = ['description', 'element_1__nom', 'element_2__nom']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Éléments en conflit', {
            'fields': ('element_1', 'element_2')
        }),
        ('Description du conflit', {
            'fields': ('type_conflit', 'gravite', 'description', 'position_conflit')
        }),
        ('Résolution', {
            'fields': ('suggestions_resolution', 'statut', 'resolu_par', 'solution_appliquee')
        }),
        ('Métadonnées', {
            'fields': ('detecte_automatiquement',)
        }),
        ('Horodatage', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(BibliothequeSymboles)
class BibliothequeSymbolesAdmin(admin.ModelAdmin):
    list_display = ['nom', 'corps_metier', 'standard', 'version']
    list_filter = ['corps_metier', 'standard', 'created_at']
    search_fields = ['nom', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'description', 'corps_metier')
        }),
        ('Données du symbole', {
            'fields': ('fichier_symbole', 'donnees_svg', 'proprietes_defaut')
        }),
        ('Métadonnées', {
            'fields': ('standard', 'version')
        }),
        ('Horodatage', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

# Configuration de l'interface d'administration
admin.site.site_header = "Administration Tradelayer Intelligence"
admin.site.site_title = "Tradelayer Intelligence"
admin.site.index_title = "Gestion des modules"
