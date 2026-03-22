import logging
from django.contrib.auth.models import User
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    EyetechTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
)
from .models import EyetechProfile

logger = logging.getLogger('accounts')


class LoginRateThrottle(AnonRateThrottle):
    rate = '10/minute'


class EyetechLoginView(TokenObtainPairView):
    """Connexion - retourne access + refresh + infos utilisateur."""
    serializer_class = EyetechTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            logger.info("Connexion reussie : %s", request.data.get('username', 'inconnu'))
        else:
            logger.warning("Echec connexion : %s", request.data.get('username', 'inconnu'))
        return response


class RegisterView(generics.CreateAPIView):
    """Inscription - cree un User + EyetechProfile."""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info("Nouvel utilisateur cree : %s", user.username)
        return Response(
            {'message': "Compte cree avec succes.", 'username': user.username},
            status=status.HTTP_201_CREATED
        )


class LogoutView(APIView):
    """Deconnexion - blackliste le refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response({'error': 'refresh_token requis'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info("Deconnexion : %s", request.user.username)
            return Response({'message': 'Deconnexion reussie'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.warning("Erreur deconnexion : %s", str(e))
            return Response({'error': 'Token invalide'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """Infos de l'utilisateur connecte."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """Changement de mot de passe."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                RefreshToken(refresh_token).blacklist()
        except Exception:
            pass
        logger.warning("Mot de passe change : %s", user.username)
        return Response({'message': 'Mot de passe modifie. Reconnectez-vous.'}, status=status.HTTP_200_OK)


class VerifyTokenView(APIView):
    """
    Verification de token pour les autres apps.
    Avec JWT partageant la meme cle de signature, la validation est locale.
    Cet endpoint est utile pour les apps qui veulent verifier les permissions.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'valid': True,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
        }
        try:
            profile = user.eyetech_profile
            data['role'] = profile.role
            data['apps'] = profile.apps_autorisees
            data['entreprise'] = profile.entreprise
        except EyetechProfile.DoesNotExist:
            data['role'] = 'ouvrier'
            data['apps'] = []
        return Response(data)
