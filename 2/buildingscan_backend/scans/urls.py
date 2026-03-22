from rest_framework.routers import DefaultRouter
from .views import ChantierScanViewSet, FichierScanViewSet, SessionScanViewSet

router = DefaultRouter()
router.register('chantiers', ChantierScanViewSet, basename='chantier-scan')
router.register('fichiers', FichierScanViewSet, basename='fichier-scan')
router.register('sessions', SessionScanViewSet, basename='session-scan')

urlpatterns = router.urls
