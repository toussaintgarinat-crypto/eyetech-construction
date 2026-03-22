from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommandeVocaleViewSet, LogInteractionVocaleViewSet

router = DefaultRouter()
router.register(r'commandes-vocales', CommandeVocaleViewSet)
router.register(r'logs-interactions-vocales', LogInteractionVocaleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

