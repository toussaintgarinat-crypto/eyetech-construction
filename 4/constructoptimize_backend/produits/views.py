from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
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
from .serializers import (
    CategorieSerializer,
    MarqueSerializer,
    ProduitSerializer,
    ImageProduitSerializer,
    CaracteristiqueProduitSerializer,
    AvisProduitSerializer,
    ListeSouhaitsSerializer,
    ElementListeSouhaitsSerializer,
)


class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class MarqueViewSet(viewsets.ModelViewSet):
    queryset = Marque.objects.all()
    serializer_class = MarqueSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ImageProduitViewSet(viewsets.ModelViewSet):
    queryset = ImageProduit.objects.all()
    serializer_class = ImageProduitSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CaracteristiqueProduitViewSet(viewsets.ModelViewSet):
    queryset = CaracteristiqueProduit.objects.all()
    serializer_class = CaracteristiqueProduitSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class AvisProduitViewSet(viewsets.ModelViewSet):
    queryset = AvisProduit.objects.all()
    serializer_class = AvisProduitSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ListeSouhaitsViewSet(viewsets.ModelViewSet):
    queryset = ListeSouhaits.objects.all()
    serializer_class = ListeSouhaitsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ElementListeSouhaitsViewSet(viewsets.ModelViewSet):
    queryset = ElementListeSouhaits.objects.all()
    serializer_class = ElementListeSouhaitsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
