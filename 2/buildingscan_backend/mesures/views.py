from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Mesure, ZoneMesure
from .serializers import MesureSerializer, ZoneMesureSerializer


class MesureViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les mesures extraites des scans LiDAR.
    Types : distance, surface, volume, angle, hauteur.
    Ces mesures alimentent l'App 3 (TradeLayer — Calques Metiers).
    """
    queryset = Mesure.objects.all()
    serializer_class = MesureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['label', 'type_mesure']
    ordering_fields = ['created_at', 'valeur', 'type_mesure']

    @action(detail=False, methods=['get'])
    def par_type(self, request):
        """Statistiques des mesures par type."""
        from django.db.models import Avg, Count, Max, Min
        stats = (
            Mesure.objects
            .values('type_mesure')
            .annotate(
                nb=Count('id'),
                moyenne=Avg('valeur'),
                maximum=Max('valeur'),
                minimum=Min('valeur'),
            )
        )
        return Response(list(stats))

    @action(detail=False, methods=['get'])
    def pour_tradelayer(self, request):
        """
        Exporter les mesures formatees pour l'App 3 (TradeLayer).
        Retourne distances, surfaces et volumes prets a l'emploi.
        """
        types_utiles = ['distance', 'surface', 'volume', 'hauteur']
        mesures = Mesure.objects.filter(type_mesure__in=types_utiles)
        serializer = MesureSerializer(mesures, many=True)
        return Response({
            'source': 'BuildingScan App 2',
            'destination': 'TradeLayer App 3',
            'nb_mesures': mesures.count(),
            'mesures': serializer.data,
        })


class ZoneMesureViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les zones de mesure (pieces, couloirs, facades, toiture).
    Contient surface, volume, hauteur et perimetre de chaque zone.
    """
    queryset = ZoneMesure.objects.all()
    serializer_class = ZoneMesureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'type_zone']
    ordering_fields = ['nom', 'surface_m2', 'volume_m3']
