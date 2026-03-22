from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChantierScan, FichierScan, SessionScan


class UserLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class FichierScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = FichierScan
        fields = '__all__'
        read_only_fields = ['uploaded_at', 'taille_fichier']

    def create(self, validated_data):
        fichier = validated_data.get('fichier')
        if fichier:
            validated_data['taille_fichier'] = fichier.size
            if not validated_data.get('nom_fichier'):
                validated_data['nom_fichier'] = fichier.name
        return super().create(validated_data)


class SessionScanSerializer(serializers.ModelSerializer):
    operateur_detail = UserLiteSerializer(source='operateur', read_only=True)

    class Meta:
        model = SessionScan
        fields = '__all__'
        read_only_fields = ['date_session']


class ChantierScanSerializer(serializers.ModelSerializer):
    created_by_detail = UserLiteSerializer(source='created_by', read_only=True)
    nb_sessions = serializers.SerializerMethodField()
    nb_fichiers = serializers.SerializerMethodField()

    class Meta:
        model = ChantierScan
        fields = '__all__'
        read_only_fields = ['created_at', 'created_by']

    def get_nb_sessions(self, obj):
        return obj.sessions.count()

    def get_nb_fichiers(self, obj):
        return obj.fichiers.count()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class ChantierScanDetailSerializer(ChantierScanSerializer):
    sessions = SessionScanSerializer(many=True, read_only=True)
    fichiers = FichierScanSerializer(many=True, read_only=True)
