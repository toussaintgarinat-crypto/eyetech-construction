from django.contrib import admin
from .models import ChantierScan, FichierScan, SessionScan


@admin.register(ChantierScan)
class ChantierScanAdmin(admin.ModelAdmin):
    list_display = ['nom', 'adresse', 'statut', 'created_by', 'created_at']
    list_filter = ['statut', 'created_at']
    search_fields = ['nom', 'adresse']
    ordering = ['-created_at']


@admin.register(FichierScan)
class FichierScanAdmin(admin.ModelAdmin):
    list_display = ['nom_fichier', 'chantier', 'format_fichier', 'taille_fichier', 'nb_points', 'uploaded_at']
    list_filter = ['format_fichier', 'uploaded_at']
    search_fields = ['nom_fichier', 'chantier__nom']
    ordering = ['-uploaded_at']


@admin.register(SessionScan)
class SessionScanAdmin(admin.ModelAdmin):
    list_display = ['chantier', 'operateur', 'methode', 'device_utilise', 'surface_scannee_m2', 'statut', 'date_session']
    list_filter = ['methode', 'statut', 'date_session']
    search_fields = ['chantier__nom', 'notes']
    ordering = ['-date_session']
