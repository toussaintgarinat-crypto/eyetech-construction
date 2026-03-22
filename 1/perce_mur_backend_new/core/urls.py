from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProjectViewSet, DrillingPointViewSet, ARMeasurementViewSet, PhotoViewSet, PrintPlanViewSet, VerifyEmailView

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"projects", ProjectViewSet)
router.register(r"drilling-points", DrillingPointViewSet)
router.register(r"ar-measurements", ARMeasurementViewSet)
router.register(r"photos", PhotoViewSet)
router.register(r"print-plans", PrintPlanViewSet)

urlpatterns = [
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("", include(router.urls)),
]

