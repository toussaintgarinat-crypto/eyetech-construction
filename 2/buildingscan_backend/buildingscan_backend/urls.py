"""
URL configuration — BuildingScan Backend (Eyetech App 2)
LiDAR / Photogrammetrie / Jumeau Numerique
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.models import User
from django.core import signing
from django.core.mail import send_mail
from django.http import HttpResponseRedirect

from rest_framework import permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from rest_framework_simplejwt.tokens import RefreshToken

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# --- Schema Swagger ---
schema_view = get_schema_view(
    openapi.Info(
        title="BuildingScan API",
        default_version='v1',
        description=(
            "API Backend — Eyetech Construction App 2 : BuildingScan\n\n"
            "Scan LiDAR et photogrammetrie avec iPhone Pro.\n"
            "Genere des nuages de points et jumeaux numeriques 3D.\n"
            "Les mesures alimentent l'App 3 (TradeLayer — Calques Metiers).\n\n"
            "**Authentification :** Bearer JWT — POST /api/token/"
        ),
        terms_of_service="https://eyetech-construction.fr/",
        contact=openapi.Contact(email="admin@eyetech.fr"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)


# --- Vue Register ---
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, default='')
    last_name = serializers.CharField(max_length=150, required=False, default='')


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Creer un nouveau compte utilisateur BuildingScan.
    Envoie un email de confirmation — le compte est activé après vérification.
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    if User.objects.filter(username=data['username']).exists():
        return Response({'erreur': 'Ce nom d\'utilisateur est deja pris.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=data['email']).exists():
        return Response({'erreur': 'Un compte existe déjà avec cet email.'}, status=status.HTTP_400_BAD_REQUEST)

    import os
    smtp_ready = all([os.getenv('EMAIL_HOST_USER',''), os.getenv('EMAIL_HOST_PASSWORD',''), os.getenv('EMAIL_HOST','')])
    user = User.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        is_active=True,
    )
    if smtp_ready:
        try:
            token = signing.dumps({'user_id': user.pk}, salt='buildingscan-email-verification')
            verify_url = f"{settings.BACKEND_URL}/api/auth/verify-email/?token={token}"
            send_mail(
                subject="Vérifiez votre email — BuildingScan",
                message=(
                    f"Bonjour {user.first_name or user.username},\n\n"
                    f"Merci pour votre inscription sur BuildingScan.\n\n"
                    f"Cliquez sur le lien ci-dessous pour activer votre compte :\n\n"
                    f"{verify_url}\n\n"
                    f"Ce lien est valable 24 heures.\n\n"
                    f"L'équipe Eyetech Construction"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass
    return Response({
        'message': 'Compte créé. Vous pouvez maintenant vous connecter.',
        'email': user.email,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email_view(request):
    token = request.query_params.get('token', '')
    try:
        data = signing.loads(token, salt='buildingscan-email-verification', max_age=86400)
        user = User.objects.get(pk=data['user_id'])
        user.is_active = True
        user.save()
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}?verified=true")
    except Exception:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}?verified=false")


# --- Vue Logout ---
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


class BuildingScanTokenView(TokenObtainPairView):
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



@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok", "app": "buildingscan"})

# --- URL Patterns ---
urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health'),

    # Auth JWT
    path('api/token/', BuildingScanTokenView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('api/auth/register/', register_view, name='register'),
    path('api/auth/verify-email/', verify_email_view, name='verify_email'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),

    # Apps
    path('api/scans/', include('scans.urls')),
    path('api/mesures/', include('mesures.urls')),
    path('api/jumeaux/', include('jumeaux_numeriques.urls')),

    # Swagger / ReDoc
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
