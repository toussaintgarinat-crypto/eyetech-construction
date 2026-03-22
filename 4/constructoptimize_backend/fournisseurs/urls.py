from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    FournisseurViewSet,
    PrixProduitViewSet,
    HistoriquePrixViewSet,
    AlertePrixViewSet,
    EvaluationFournisseurViewSet,
    ConfigurationScrapingViewSet,
)

router = DefaultRouter()
router.register(r'fournisseurs', FournisseurViewSet, basename='fournisseur')
router.register(r'prix-produits', PrixProduitViewSet, basename='prixproduit')
router.register(r'historique-prix', HistoriquePrixViewSet, basename='historiqueprix')
router.register(r'alertes-prix', AlertePrixViewSet, basename='alerteprix')
router.register(r'evaluations', EvaluationFournisseurViewSet, basename='evaluationfournisseur')
router.register(r'config-scraping', ConfigurationScrapingViewSet, basename='configurationscraping')

urlpatterns = [
    path('', include(router.urls)),
]
