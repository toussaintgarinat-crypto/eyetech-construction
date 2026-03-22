from rest_framework import serializers
from .models import (
    RechercheComparaison,
    ElementRecherche,
    ResultatComparaison,
    RecommandationAchat,
    AnalyseMarche,
    ConfigurationUtilisateur,
    StatistiqueUtilisation,
)


class RechercheComparaisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = RechercheComparaison
        fields = '__all__'


class ElementRechercheSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElementRecherche
        fields = '__all__'


class ResultatComparaisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultatComparaison
        fields = '__all__'


class RecommandationAchatSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommandationAchat
        fields = '__all__'


class AnalyseMarcheSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyseMarche
        fields = '__all__'


class ConfigurationUtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigurationUtilisateur
        fields = '__all__'


class StatistiqueUtilisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatistiqueUtilisation
        fields = '__all__'
