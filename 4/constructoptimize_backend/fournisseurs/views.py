from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import (
    Fournisseur,
    PrixProduit,
    HistoriquePrix,
    AlertePrix,
    EvaluationFournisseur,
    ConfigurationScraping,
)
from .serializers import (
    FournisseurSerializer,
    PrixProduitSerializer,
    HistoriquePrixSerializer,
    AlertePrixSerializer,
    EvaluationFournisseurSerializer,
    ConfigurationScrapingSerializer,
)


class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PrixProduitViewSet(viewsets.ModelViewSet):
    queryset = PrixProduit.objects.all()
    serializer_class = PrixProduitSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class HistoriquePrixViewSet(viewsets.ModelViewSet):
    queryset = HistoriquePrix.objects.all()
    serializer_class = HistoriquePrixSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class AlertePrixViewSet(viewsets.ModelViewSet):
    queryset = AlertePrix.objects.all()
    serializer_class = AlertePrixSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class EvaluationFournisseurViewSet(viewsets.ModelViewSet):
    queryset = EvaluationFournisseur.objects.all()
    serializer_class = EvaluationFournisseurSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ConfigurationScrapingViewSet(viewsets.ModelViewSet):
    queryset = ConfigurationScraping.objects.all()
    serializer_class = ConfigurationScrapingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
