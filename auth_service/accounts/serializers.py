from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import EyetechProfile


class EyetechTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer JWT enrichi — inclut le role et les apps autorisees dans le token."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Claims personnalises dans le JWT
        token['username'] = user.username
        token['email'] = user.email
        try:
            profile = user.eyetech_profile
            token['role'] = profile.role
            token['apps'] = profile.apps_autorisees
            token['entreprise'] = profile.entreprise
        except EyetechProfile.DoesNotExist:
            token['role'] = 'ouvrier'
            token['apps'] = ['perce_mur', 'building_scan', 'tradelayer', 'constructoptimize']
            token['entreprise'] = ''
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Ajoute les infos utilisateur dans la reponse
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        try:
            profile = user.eyetech_profile
            data['user']['role'] = profile.role
            data['user']['apps'] = profile.apps_autorisees
            data['user']['entreprise'] = profile.entreprise
        except EyetechProfile.DoesNotExist:
            data['user']['role'] = 'ouvrier'
            data['user']['apps'] = ['perce_mur', 'building_scan', 'tradelayer', 'constructoptimize']
        return data


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EyetechProfile
        fields = ['role', 'entreprise', 'telephone', 'avatar',
                  'acces_perce_mur', 'acces_building_scan',
                  'acces_tradelayer', 'acces_constructoptimize', 'apps_autorisees']
        read_only_fields = ['apps_autorisees']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(source='eyetech_profile', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, default='ouvrier')
    entreprise = serializers.CharField(required=False, default='')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2',
                  'first_name', 'last_name', 'role', 'entreprise']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        return data

    def create(self, validated_data):
        role = validated_data.pop('role', 'ouvrier')
        entreprise = validated_data.pop('entreprise', '')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        EyetechProfile.objects.create(user=user, role=role, entreprise=entreprise)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Ancien mot de passe incorrect.")
        return value
