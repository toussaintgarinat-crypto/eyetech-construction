from rest_framework.routers import DefaultRouter
from .views import MesureViewSet, ZoneMesureViewSet

router = DefaultRouter()
router.register('mesures', MesureViewSet, basename='mesure')
router.register('zones', ZoneMesureViewSet, basename='zone-mesure')

urlpatterns = router.urls
