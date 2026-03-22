from django.contrib import admin
from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from accounts.views import (
    EyetechLoginView,
    RegisterView,
    LogoutView,
    MeView,
    ChangePasswordView,
    VerifyTokenView,
)

schema_view = get_schema_view(
    openapi.Info(
        title="Eyetech Auth Service",
        default_version="v1",
        description="Service d'authentification centralise pour les 4 applications Eyetech Construction",
        contact=openapi.Contact(email="admin@eyetech.fr"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', EyetechLoginView.as_view(), name='login'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/me/', MeView.as_view(), name='me'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/auth/verify/', VerifyTokenView.as_view(), name='verify-token'),

    # JWT
    path('api/token/', EyetechLoginView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # Swagger
    re_path(r'^api/docs(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
