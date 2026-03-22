from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    CategorieViewSet,
    MarqueViewSet,
    ProduitViewSet,
    ImageProduitViewSet,
    CaracteristiqueProduitViewSet,
    AvisProduitViewSet,
    ListeSouhaitsViewSet,
    ElementListeSouhaitsViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategorieViewSet, basename='categorie')
router.register(r'marques', MarqueViewSet, basename='marque')
router.register(r'produits', ProduitViewSet, basename='produit')
router.register(r'images', ImageProduitViewSet, basename='imageproduit')
router.register(r'caracteristiques', CaracteristiqueProduitViewSet, basename='caracteristiqueproduit')
router.register(r'avis', AvisProduitViewSet, basename='avisproduit')
router.register(r'listes-souhaits', ListeSouhaitsViewSet, basename='listesouhaits')
router.register(r'elements-listes-souhaits', ElementListeSouhaitsViewSet, basename='elementlistesouhaits')

urlpatterns = [
    path('', include(router.urls)),
]
