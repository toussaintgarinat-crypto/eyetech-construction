from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from rest_framework_simplejwt.views import TokenObtainPairView
from constructoptimize_backend.logout_view import LogoutView
from constructoptimize_backend.throttles import AuthRateThrottle, DemoTokenThrottle
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
import os


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login avec rate limiting : 5 tentatives/minute par IP."""
    throttle_classes = [AuthRateThrottle]


class DemoTokenView(APIView):
    """Token démo read-only pour explorer le catalogue sans compte."""
    permission_classes = [AllowAny]
    throttle_classes = [DemoTokenThrottle]

    def get(self, request):
        username = os.getenv('DEMO_USER_USERNAME', 'demo')
        email = os.getenv('DEMO_USER_EMAIL', 'demo@eyetech.fr')
        password = os.getenv('DEMO_USER_PASSWORD', 'DemoEyetech2026!')
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email, 'first_name': 'Demo', 'last_name': 'Eyetech'},
        )
        if created:
            user.set_password(password)
            user.save()
        token = AccessToken.for_user(user)
        token['is_demo'] = True
        return Response({
            'access': str(token),
            'demo': True,
            'message': 'Token démo ConstructOptimize — catalogue 20 produits BTP + 8 fournisseurs',
            'expires_in': 900,
        })


schema_view = get_schema_view(
    openapi.Info(
        title="ConstructOptimize API",
        default_version="v1",
        description="Comparateur de prix BTP — Eyetech Construction",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/demo/token/', DemoTokenView.as_view(), name='demo_token'),
    path('api/produits/', include('produits.urls')),
    path('api/fournisseurs/', include('fournisseurs.urls')),
    path('api/comparateur/', include('comparateur_prix.urls')),
    re_path(r'^api/docs(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
