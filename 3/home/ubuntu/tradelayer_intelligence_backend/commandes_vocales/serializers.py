from rest_framework import serializers
from .models import CommandeVocale, LogInteractionVocale

class CommandeVocaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommandeVocale
        fields = '__all__'

class LogInteractionVocaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogInteractionVocale
        fields = '__all__'

