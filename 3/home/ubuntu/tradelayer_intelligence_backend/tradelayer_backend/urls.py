from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
    TokenBlacklistView,
)
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from .auth_views import MyTokenObtainPairView, RegisterView, UserDetailView, LogoutView, DemoTokenView

# Configuration de la documentation API avec Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="Tradelayer Intelligence API",
        default_version='v1',
        description="API pour l'application Tradelayer Intelligence - Modules Calques Métiers, Commandes Vocales et Analyse Spatiale",
        terms_of_service="https://www.tradelayer.com/terms/",
        contact=openapi.Contact(email="contact@tradelayer.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Administration Django
    path('admin/', admin.site.urls),

    # Authentification JWT personnalisée
    path('api/auth/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/user/', UserDetailView.as_view(), name='auth_user_detail'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('api/demo/token/', DemoTokenView.as_view(), name='demo_token'),

    # Modules de l'application
    path('api/calques-metiers/', include('calques_metiers.urls')),
    path('api/commandes-vocales/', include('commandes_vocales.urls')),
    path('api/analyse-spatiale/', include('analyse_spatiale.urls')),
    path('api/rag/', include('rag_metiers.urls')),

    # Documentation API
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema-json'),

    # API Root
    path('api/', include('rest_framework.urls')),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
