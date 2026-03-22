from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.contrib.auth.models import User
from .token_serializers import MyTokenObtainPairSerializer, RegisterSerializer, UserSerializer
from .throttles import AuthRateThrottle, DemoTokenThrottle
import os


class MyTokenObtainPairView(TokenObtainPairView):
    """Login avec rate limiting : 5 tentatives/minute par IP."""
    serializer_class = MyTokenObtainPairSerializer
    throttle_classes = [AuthRateThrottle]


class DemoTokenView(APIView):
    """
    Token démo read-only pour tester TradeLayer sans compte.
    Donne accès au projet démo Eyetech pré-chargé.
    """
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
            'message': 'Token démo TradeLayer — accès lecture au projet Chantier Démo Eyetech',
            'expires_in': 900,
        })


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Deconnexion reussie"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Token invalide"}, status=status.HTTP_400_BAD_REQUEST)
