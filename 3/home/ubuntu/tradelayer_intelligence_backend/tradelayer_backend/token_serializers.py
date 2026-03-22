from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth.models import User


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["email"] = user.email
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        from django.core import signing
        from django.core.mail import send_mail
        from django.conf import settings
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_active=False,
        )
        user.set_password(validated_data['password'])
        user.save()
        token = signing.dumps({'user_id': user.pk}, salt='tradelayer-email-verification')
        verify_url = f"{settings.BACKEND_URL}/api/auth/verify-email/?token={token}"
        send_mail(
            subject="Vérifiez votre email — TradeLayer Intelligence",
            message=(
                f"Bonjour {user.first_name or user.username},\n\n"
                f"Merci pour votre inscription sur TradeLayer Intelligence.\n\n"
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
