from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Créer le routeur pour les ViewSets
router = DefaultRouter()
router.register(r'corps-metiers', views.CorpsMetierViewSet, basename='corps-metier')
router.register(r'projets', views.ProjetViewSet, basename='projet')
router.register(r'calques', views.CalqueMetierViewSet, basename='calque')
router.register(r'elements', views.ElementCalqueViewSet, basename='element')
router.register(r'annotations', views.AnnotationViewSet, basename='annotation')
router.register(r'conflits', views.ConflitCalqueViewSet, basename='conflit')
router.register(r'symboles', views.BibliothequeSymbolesViewSet, basename='symbole')

app_name = 'calques_metiers'

urlpatterns = [
    path('api/', include(router.urls)),
]
