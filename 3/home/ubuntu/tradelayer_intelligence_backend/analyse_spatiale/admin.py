from django.contrib import admin
from .models import ZoneAnalyse, PointInteret, MesureSpatiale

@admin.register(ZoneAnalyse)
class ZoneAnalyseAdmin(admin.ModelAdmin):
    list_display = (
        "nom", "projet", "visible", "createur", "created_at"
    )
    list_filter = ("visible", "projet", "createur")
    search_fields = ("nom", "description")
    raw_id_fields = ("projet", "createur")

@admin.register(PointInteret)
class PointInteretAdmin(admin.ModelAdmin):
    list_display = (
        "nom", "projet", "type_point", "position_x", "position_y", "position_z", "createur", "created_at"
    )
    list_filter = ("type_point", "projet", "createur")
    search_fields = ("nom", "description")
    raw_id_fields = ("projet", "element_lie", "createur")

@admin.register(MesureSpatiale)
class MesureSpatialeAdmin(admin.ModelAdmin):
    list_display = (
        "type_mesure", "valeur", "unite", "projet", "calque", "realisee_par", "created_at"
    )
    list_filter = ("type_mesure", "unite", "projet", "calque", "realisee_par")
    search_fields = ("description",)
    raw_id_fields = ("projet", "calque", "realisee_par")

