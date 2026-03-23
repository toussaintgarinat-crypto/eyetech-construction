from rest_framework import serializers
from .models import User, Project, DrillingPoint, ARMeasurement, Photo, PrintPlan
import uuid
from django.core.mail import send_mail
from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
        )
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        import os
        # En dev local (pas de config SMTP), on vérifie automatiquement l'email
        email_configured = bool(os.getenv('EMAIL_HOST_USER', ''))
        token = uuid.uuid4() if email_configured else None
        user = User.objects.create_user(
            username=validated_data.get("username", validated_data["email"]),
            email=validated_data["email"],
            password=validated_data["password"],
            is_email_verified=not email_configured,
            email_verification_token=token,
        )
        if email_configured:
            verify_url = f"{settings.BACKEND_URL}/api/verify-email/?token={token}"
            send_mail(
                subject="Vérifiez votre email — Perce-Mur",
                message=(
                    f"Bonjour,\n\n"
                    f"Merci pour votre inscription sur Perce-Mur.\n\n"
                    f"Cliquez sur le lien ci-dessous pour activer votre compte :\n\n"
                    f"{verify_url}\n\n"
                    f"Ce lien est valable 24 heures.\n\n"
                    f"L'équipe Eyetech Construction"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        return user


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="user.email")

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "location",
            "created_at",
            "updated_at",
            "owner",
        )


class DrillingPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrillingPoint
        fields = (
            "id",
            "project",
            "x",
            "y",
            "z",
            "description",
            "created_at",
        )


class ARMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARMeasurement
        fields = (
            "id",
            "project",
            "data",
            "created_at",
        )


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ("id", "project", "image", "description", "created_at")


class PrintPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrintPlan
        fields = (
            "id",
            "project",
            "plan_file",
            "plan_type",
            "created_at",
        )


