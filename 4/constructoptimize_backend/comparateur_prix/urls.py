from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    RechercheComparaisonViewSet,
    ElementRechercheViewSet,
    ResultatComparaisonViewSet,
    RecommandationAchatViewSet,
    AnalyseMarcheViewSet,
    ConfigurationUtilisateurViewSet,
    StatistiqueUtilisationViewSet,
)

router = DefaultRouter()
router.register(r'recherches', RechercheComparaisonViewSet, basename='recherchecomparaison')
router.register(r'elements-recherche', ElementRechercheViewSet, basename='elementrecherche')
router.register(r'resultats', ResultatComparaisonViewSet, basename='resultatcomparaison')
router.register(r'recommandations', RecommandationAchatViewSet, basename='recommandationachat')
router.register(r'analyses-marche', AnalyseMarcheViewSet, basename='analysemarche')
router.register(r'config-utilisateur', ConfigurationUtilisateurViewSet, basename='configurationutilisateur')
router.register(r'statistiques', StatistiqueUtilisationViewSet, basename='statistiqueutilisation')

urlpatterns = [
    path('', include(router.urls)),
]
