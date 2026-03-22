from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ZoneAnalyseViewSet, PointInteretViewSet, MesureSpatialeViewSet

router = DefaultRouter()
router.register(r'zones-analyse', ZoneAnalyseViewSet)
router.register(r'points-interet', PointInteretViewSet)
router.register(r'mesures-spatiales', MesureSpatialeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

