from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.core import signing
from django.core.mail import send_mail
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from rest_framework_simplejwt.views import TokenObtainPairView
from constructoptimize_backend.logout_view import LogoutView
from constructoptimize_backend.throttles import AuthRateThrottle, DemoTokenThrottle
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
import os


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    if User.objects.filter(username=data['username']).exists():
        return Response({'erreur': 'Ce nom d\'utilisateur est déjà pris.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=data['email']).exists():
        return Response({'erreur': 'Un compte existe déjà avec cet email.'}, status=status.HTTP_400_BAD_REQUEST)
    email_configured = bool(os.getenv('EMAIL_HOST_USER', ''))
    user = User.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        is_active=True if not email_configured else False,
    )
    if email_configured:
        token = signing.dumps({'user_id': user.pk}, salt='constructoptimize-email-verification')
        verify_url = f"{settings.BACKEND_URL}/api/auth/verify-email/?token={token}"
        send_mail(
            subject="Vérifiez votre email — ConstructOptimize",
            message=(
                f"Bonjour {user.username},\n\n"
                f"Merci pour votre inscription sur ConstructOptimize.\n\n"
                f"Cliquez sur le lien ci-dessous pour activer votre compte :\n\n"
                f"{verify_url}\n\n"
                f"Ce lien est valable 24 heures.\n\n"
                f"L'équipe Eyetech Construction"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    return Response({'message': 'Compte créé. Vous pouvez maintenant vous connecter.' if not email_configured else 'Compte créé. Un email de confirmation a été envoyé à votre adresse.'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email_view(request):
    token = request.query_params.get('token', '')
    try:
        data = signing.loads(token, salt='constructoptimize-email-verification', max_age=86400)
        user = User.objects.get(pk=data['user_id'])
        user.is_active = True
        user.save()
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}?verified=true")
    except Exception:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}?verified=false")


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login avec rate limiting : 5 tentatives/minute par IP."""
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


from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes as dpc3
from rest_framework.response import Response as HealthResponse

@api_view(["GET"])
@dpc3([AllowAny])
def health_check(request):
    return HealthResponse({"status": "ok", "app": "constructoptimize"})

urlpatterns = [
    path("health/", health_check, name="health"),
    path('admin/', admin.site.urls),
    path('api/token/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('api/auth/register/', register_view, name='register'),
    path('api/auth/verify-email/', verify_email_view, name='verify_email'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/demo/token/', DemoTokenView.as_view(), name='demo_token'),
    path('api/produits/', include('produits.urls')),
    path('api/fournisseurs/', include('fournisseurs.urls')),
    path('api/comparateur/', include('comparateur_prix.urls')),
    re_path(r'^api/docs(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
