from django.contrib import admin
from .models import Mesure, ZoneMesure


@admin.register(Mesure)
class MesureAdmin(admin.ModelAdmin):
    list_display = ['type_mesure', 'valeur', 'unite', 'label', 'session', 'created_at']
    list_filter = ['type_mesure', 'created_at']
    search_fields = ['label', 'session__chantier__nom']
    ordering = ['-created_at']


@admin.register(ZoneMesure)
class ZoneMesureAdmin(admin.ModelAdmin):
    list_display = ['nom', 'type_zone', 'surface_m2', 'volume_m3', 'hauteur_m', 'perimetre_m', 'chantier']
    list_filter = ['type_zone']
    search_fields = ['nom', 'chantier__nom']
    ordering = ['nom']
