from rest_framework import serializers
from .models import Mesure, ZoneMesure


class MesureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mesure
        fields = '__all__'
        read_only_fields = ['created_at']


class ZoneMesureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZoneMesure
        fields = '__all__'
