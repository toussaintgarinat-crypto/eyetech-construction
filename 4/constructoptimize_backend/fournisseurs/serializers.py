from rest_framework import serializers
from .models import (
    Fournisseur,
    PrixProduit,
    HistoriquePrix,
    AlertePrix,
    EvaluationFournisseur,
    ConfigurationScraping,
)


class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = '__all__'


class PrixProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrixProduit
        fields = '__all__'


class HistoriquePrixSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriquePrix
        fields = '__all__'


class AlertePrixSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertePrix
        fields = '__all__'


class EvaluationFournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationFournisseur
        fields = '__all__'


class ConfigurationScrapingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigurationScraping
        fields = '__all__'
