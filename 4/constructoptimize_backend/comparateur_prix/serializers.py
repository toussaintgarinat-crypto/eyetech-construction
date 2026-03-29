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
    fournisseur_nom = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    unite = serializers.SerializerMethodField()
    ville = serializers.SerializerMethodField()
    produit_nom = serializers.SerializerMethodField()

    def get_fournisseur_nom(self, obj):
        return obj.prix_produit.fournisseur.nom if obj.prix_produit_id else None

    def get_distance_km(self, obj):
        return float(obj.distance_fournisseur) if obj.distance_fournisseur is not None else None

    def get_unite(self, obj):
        return obj.prix_produit.produit.unite_mesure if obj.prix_produit_id else None

    def get_ville(self, obj):
        return obj.prix_produit.fournisseur.ville if obj.prix_produit_id else None

    def get_produit_nom(self, obj):
        return obj.prix_produit.produit.nom if obj.prix_produit_id else None

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
