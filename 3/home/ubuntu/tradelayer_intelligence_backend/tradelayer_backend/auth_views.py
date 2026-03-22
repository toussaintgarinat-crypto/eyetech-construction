from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.contrib.auth.models import User
from django.core import signing
from django.http import HttpResponseRedirect
from django.conf import settings
from .token_serializers import MyTokenObtainPairSerializer, RegisterSerializer, UserSerializer
from .throttles import AuthRateThrottle, DemoTokenThrottle
import os


class MyTokenObtainPairView(TokenObtainPairView):
    """Login avec rate limiting : 5 tentatives/minute par IP."""
    serializer_class = MyTokenObtainPairSerializer
    throttle_classes = [AuthRateThrottle]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '')
        try:
            user = User.objects.get(username=username)
            if not user.is_active:
                return Response(
                    {"detail": "Votre email n'a pas encore été vérifié. Consultez votre boîte mail et cliquez sur le lien d'activation."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            pass
        return super().post(request, *args, **kwargs)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get('token', '')
        try:
            data = signing.loads(token, salt='tradelayer-email-verification', max_age=86400)
            user = User.objects.get(pk=data['user_id'])
            user.is_active = True
            user.save()
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}?verified=true")
        except Exception:
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}?verified=false")


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
