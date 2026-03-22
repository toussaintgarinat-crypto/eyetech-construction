from django.contrib import admin
from .models import CommandeVocale, LogInteractionVocale

@admin.register(CommandeVocale)
class CommandeVocaleAdmin(admin.ModelAdmin):
    list_display = (
        "utilisateur", "projet", "intention_detectee", "horodatage", "traitee", "succes_execution"
    )
    list_filter = ("traitee", "succes_execution", "intention_detectee", "projet")
    search_fields = ("transcription_brute", "transcription_corrigee", "intention_detectee")
    raw_id_fields = ("utilisateur", "projet")
    date_hierarchy = "horodatage"

@admin.register(LogInteractionVocale)
class LogInteractionVocaleAdmin(admin.ModelAdmin):
    list_display = (
        "session_id", "type_interaction", "horodatage", "temps_reponse", "score_confiance", "feedback_utilisateur"
    )
    list_filter = ("type_interaction", "feedback_utilisateur")
    search_fields = ("session_id", "contenu")
    raw_id_fields = ("commande",)
    date_hierarchy = "horodatage"

