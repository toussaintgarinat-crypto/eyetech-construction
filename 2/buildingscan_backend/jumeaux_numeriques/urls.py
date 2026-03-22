from rest_framework.routers import DefaultRouter
from .views import JumeauNumeriqueViewSet

router = DefaultRouter()
router.register('jumeaux', JumeauNumeriqueViewSet, basename='jumeau-numerique')

urlpatterns = router.urls
