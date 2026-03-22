from rest_framework import serializers
from .models import User, Project, DrillingPoint, ARMeasurement, Photo, PrintPlan

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
            "company",
            "role",
            "password",
        )
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get("username", validated_data["email"]),
            email=validated_data["email"],
            password=validated_data["password"]
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


