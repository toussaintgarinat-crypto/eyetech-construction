from django.contrib import admin
from .models import JumeauNumerique


@admin.register(JumeauNumerique)
class JumeauNumeriqueAdmin(admin.ModelAdmin):
    list_display = ['nom', 'version', 'format_modele', 'statut', 'exporte_tradelayer', 'nb_elements', 'precision_globale_cm', 'created_at']
    list_filter = ['statut', 'format_modele', 'exporte_tradelayer', 'created_at']
    search_fields = ['nom', 'chantier__nom']
    ordering = ['-created_at']
