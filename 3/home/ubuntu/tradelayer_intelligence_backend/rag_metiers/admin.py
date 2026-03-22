from django.contrib import admin
from .models import InstanceRAG, QuestionRAG


@admin.register(InstanceRAG)
class InstanceRAGAdmin(admin.ModelAdmin):
    list_display = ['corps_metier', 'url_openrag', 'actif', 'updated_at']
    list_editable = ['actif']
    list_filter = ['actif', 'corps_metier']


@admin.register(QuestionRAG)
class QuestionRAGAdmin(admin.ModelAdmin):
    list_display = ['corps_metier', 'utilisateur', 'question', 'statut', 'temps_reponse_ms', 'created_at']
    list_filter = ['statut', 'corps_metier']
    readonly_fields = ['reponse', 'sources', 'temps_reponse_ms', 'created_at']
