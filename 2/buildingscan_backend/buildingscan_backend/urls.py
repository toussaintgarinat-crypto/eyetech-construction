"""
URL configuration — BuildingScan Backend (Eyetech App 2)
LiDAR / Photogrammetrie / Jumeau Numerique
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.models import User

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
    Retourne un message de confirmation (se connecter via /api/token/).
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    if User.objects.filter(username=data['username']).exists():
        return Response({'erreur': 'Ce nom d\'utilisateur est deja pris.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
    )
    return Response({
        'message': 'Compte cree avec succes.',
        'username': user.username,
        'email': user.email,
        'id': user.id,
    }, status=status.HTTP_201_CREATED)


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


# --- URL Patterns ---
urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('api/auth/register/', register_view, name='register'),
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
