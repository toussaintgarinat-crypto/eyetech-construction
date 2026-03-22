from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import JumeauNumerique
from .serializers import JumeauNumeriqueSerializer


class JumeauNumeriqueViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les jumeaux numeriques 3D.
    Un jumeau numerique = modele 3D complet genere depuis un scan LiDAR/photogrammetrie.
    Peut etre exporte vers l'App 3 (TradeLayer) pour superposer les calques metiers.
    """
    queryset = JumeauNumerique.objects.all()
    serializer_class = JumeauNumeriqueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'version', 'format_modele']
    ordering_fields = ['created_at', 'updated_at', 'statut']

    @action(detail=True, methods=['post'])
    def marquer_pret(self, request, pk=None):
        """Marquer un jumeau numerique comme pret a l'utilisation."""
        jumeau = self.get_object()
        jumeau.statut = 'pret'
        jumeau.save()
        serializer = self.get_serializer(jumeau)
        return Response({'message': 'Jumeau numerique marque comme pret.', 'jumeau': serializer.data})

    @action(detail=True, methods=['post'])
    def exporter_tradelayer(self, request, pk=None):
        """
        Exporter le jumeau numerique vers l'App 3 (TradeLayer — Calques Metiers).
        Enregistre l'URL TradeLayer et marque le jumeau comme exporte.
        """
        jumeau = self.get_object()
        url_tradelayer = request.data.get('url_tradelayer', '')
        if not url_tradelayer:
            return Response(
                {'erreur': 'url_tradelayer est requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        jumeau.exporte_tradelayer = True
        jumeau.url_tradelayer = url_tradelayer
        jumeau.save()
        return Response({
            'message': 'Jumeau numerique exporte vers TradeLayer (App 3).',
            'url_tradelayer': url_tradelayer,
            'jumeau_id': jumeau.id,
        })

    @action(detail=False, methods=['get'])
    def exportes_tradelayer(self, request):
        """Lister les jumeaux numeriques deja exportes vers TradeLayer."""
        jumeaux = JumeauNumerique.objects.filter(exporte_tradelayer=True)
        serializer = self.get_serializer(jumeaux, many=True)
        return Response({
            'nb_exportes': jumeaux.count(),
            'jumeaux': serializer.data,
        })

    @action(detail=True, methods=['post'])
    def archiver(self, request, pk=None):
        """Archiver un jumeau numerique."""
        jumeau = self.get_object()
        jumeau.statut = 'archive'
        jumeau.save()
        return Response({'message': 'Jumeau numerique archive.', 'statut': 'archive'})
