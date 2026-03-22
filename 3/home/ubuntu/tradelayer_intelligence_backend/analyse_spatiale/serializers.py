from rest_framework import serializers
from .models import ZoneAnalyse, PointInteret, MesureSpatiale

class ZoneAnalyseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZoneAnalyse
        fields = '__all__'

class PointInteretSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointInteret
        fields = '__all__'

class MesureSpatialeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MesureSpatiale
        fields = '__all__'

