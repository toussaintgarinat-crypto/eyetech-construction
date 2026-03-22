from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_email_verified:
            raise serializers.ValidationError(
                "Veuillez vérifier votre email avant de vous connecter. "
                "Consultez votre boîte mail et cliquez sur le lien d'activation."
            )
        return data

