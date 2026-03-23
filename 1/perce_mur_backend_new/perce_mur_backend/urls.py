
from rest_framework.decorators import api_view, permission_classes as dpc
from rest_framework.permissions import AllowAny

@api_view(["GET"])
@dpc([AllowAny])
def health_check(request):
    return Response({"status": "ok", "app": "perce-mur"})

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from core.token_serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework import status
from core.throttles import AuthRateThrottle, DemoTokenThrottle
from django.contrib.auth import get_user_model
import os

User = get_user_model()


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Deconnexion reussie'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Token invalide'}, status=status.HTTP_400_BAD_REQUEST)


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login avec rate limiting : 5 tentatives/minute par IP."""
    throttle_classes = [AuthRateThrottle]
    serializer_class = CustomTokenObtainPairSerializer


class DemoTokenView(APIView):
    """
    Retourne un access token read-only pour l'utilisateur démo.
    Permet de tester l'API sans créer de compte.
    Limité à 30 requêtes/minute.
    """
    permission_classes = [AllowAny]
    throttle_classes = [DemoTokenThrottle]

    def get(self, request):
        email = os.getenv('DEMO_USER_EMAIL', 'demo@eyetech.fr')
        password = os.getenv('DEMO_USER_PASSWORD', 'DemoEyetech2026!')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = User.objects.create_user(
                username='demo',
                email=email,
                password=password,
                first_name='Demo',
                last_name='Eyetech',
                is_email_verified=True,
            )
        token = AccessToken.for_user(user)
        token['is_demo'] = True
        return Response({
            'access': str(token),
            'demo': True,
            'message': 'Token démo valable 15 minutes — lecture seule',
            'expires_in': 900,
        })


urlpatterns = [
    path("health/", health_check, name="health"),
    path("admin/", admin.site.urls),
    path("api/token/", ThrottledTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),
    path("api/demo/token/", DemoTokenView.as_view(), name="demo_token"),
    path("api/", include("core.urls")),
]
