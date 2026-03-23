from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.core import signing
from django.core.mail import send_mail
from django.http import HttpResponseRedirect, JsonResponse
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


from django.views.decorators.csrf import csrf_exempt as _csrf_exempt

@_csrf_exempt
def register_view(request):
    import json as _json, traceback as _tb
    if request.method != 'POST':
        return JsonResponse({'erreur': 'Méthode non autorisée.'}, status=405)
    try:
        try:
            body = _json.loads(request.body)
        except Exception:
            body = {}
        username = str(body.get('username', '')).strip()
        email = str(body.get('email', '')).strip()
        password = str(body.get('password', ''))
        password2 = str(body.get('password2', ''))
        if not username or not email or not password:
            return JsonResponse({'erreur': 'username, email et password sont requis.'}, status=400)
        if len(password) < 8:
            return JsonResponse({'erreur': 'Le mot de passe doit contenir au moins 8 caractères.'}, status=400)
        if password2 and password != password2:
            return JsonResponse({'erreur': 'Les mots de passe ne correspondent pas.'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'erreur': "Ce nom d'utilisateur est déjà pris."}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'erreur': 'Un compte existe déjà avec cet email.'}, status=400)
        User.objects.create_user(username=username, email=email, password=password, is_active=True)
        return JsonResponse({'message': 'Compte créé. Vous pouvez maintenant vous connecter.'}, status=201)
    except Exception as e:
        return JsonResponse({'erreur': str(e), 'detail': _tb.format_exc()}, status=500)


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


@api_view(["POST"])
@dpc3([AllowAny])
def test_register(request):
    """Endpoint de debug temporaire — crée un utilisateur minimal."""
    from django.contrib.auth.models import User as DjangoUser
    import traceback
    try:
        username = request.data.get("username", "testminimal")
        email = request.data.get("email", "testminimal@test.com")
        password = request.data.get("password", "TestPass123")
        if DjangoUser.objects.filter(username=username).exists():
            return HealthResponse({"ok": False, "reason": "exists"})
        u = DjangoUser.objects.create_user(username=username, email=email, password=password, is_active=True)
        return HealthResponse({"ok": True, "id": u.pk, "username": u.username})
    except Exception as e:
        return HealthResponse({"ok": False, "error": str(e), "trace": traceback.format_exc()}, status=500)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

@csrf_exempt
@require_POST
def raw_test_register(request):
    """Vue Django pure (sans DRF) pour isoler le problème."""
    import traceback
    try:
        body = json.loads(request.body)
        from django.contrib.auth.models import User as DjangoUser
        username = body.get("username", "rawtest")
        email = body.get("email", "rawtest@test.com")
        password = body.get("password", "TestPass123")
        if DjangoUser.objects.filter(username=username).exists():
            return JsonResponse({"ok": False, "reason": "exists"})
        u = DjangoUser.objects.create_user(username=username, email=email, password=password, is_active=True)
        return JsonResponse({"ok": True, "id": u.pk, "username": u.username})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e), "trace": traceback.format_exc()}, status=500)

urlpatterns = [
    path("health/", health_check, name="health"),
    path("api/test-register/", test_register, name="test_register"),
    path("api/raw-register/", raw_test_register, name="raw_register"),
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
