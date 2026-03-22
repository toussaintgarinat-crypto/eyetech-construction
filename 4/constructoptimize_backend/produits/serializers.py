from rest_framework import serializers
from .models import (
    Categorie,
    Marque,
    Produit,
    ImageProduit,
    CaracteristiqueProduit,
    AvisProduit,
    ListeSouhaits,
    ElementListeSouhaits,
)


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'


class MarqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marque
        fields = '__all__'


class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = '__all__'


class ImageProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageProduit
        fields = '__all__'


class CaracteristiqueProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaracteristiqueProduit
        fields = '__all__'


class AvisProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvisProduit
        fields = '__all__'


class ListeSouhaitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListeSouhaits
        fields = '__all__'


class ElementListeSouhaitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElementListeSouhaits
        fields = '__all__'
