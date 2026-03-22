from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ChantierScan, FichierScan, SessionScan
from .serializers import (
    ChantierScanSerializer,
    ChantierScanDetailSerializer,
    FichierScanSerializer,
    SessionScanSerializer,
)


class ChantierScanViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les chantiers de scan LiDAR/photogrammetrie.
    Gestion complete des chantiers avec sessions et fichiers associes.
    """
    queryset = ChantierScan.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'adresse', 'description']
    ordering_fields = ['created_at', 'nom', 'statut']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChantierScanDetailSerializer
        return ChantierScanSerializer

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        """Lister les sessions de scan d'un chantier."""
        chantier = self.get_object()
        sessions = chantier.sessions.all()
        serializer = SessionScanSerializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def fichiers(self, request, pk=None):
        """Lister les fichiers de scan d'un chantier."""
        chantier = self.get_object()
        fichiers = chantier.fichiers.all()
        serializer = FichierScanSerializer(fichiers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def archiver(self, request, pk=None):
        """Archiver un chantier."""
        chantier = self.get_object()
        chantier.statut = 'archive'
        chantier.save()
        return Response({'statut': 'archive', 'message': 'Chantier archive avec succes.'})


class FichierScanViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les fichiers de nuages de points (PLY, LAS, OBJ, GLB, IFC, E57).
    Supporte l'upload de fichiers volumineux.
    """
    queryset = FichierScan.objects.all()
    serializer_class = FichierScanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['uploaded_at', 'taille_fichier', 'nb_points']


class SessionScanViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les sessions de scan sur le terrain.
    Une session = une capture LiDAR ou photogrammetrie avec iPhone Pro.
    """
    queryset = SessionScan.objects.all()
    serializer_class = SessionScanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['notes', 'device_utilise']
    ordering_fields = ['date_session', 'surface_scannee_m2', 'duree_minutes']

    @action(detail=True, methods=['post'])
    def terminer(self, request, pk=None):
        """Marquer une session comme terminee."""
        session = self.get_object()
        session.statut = 'termine'
        session.save()
        return Response({'statut': 'termine', 'message': 'Session terminee.'})

    @action(detail=True, methods=['post'])
    def signaler_erreur(self, request, pk=None):
        """Signaler une erreur sur une session."""
        session = self.get_object()
        session.statut = 'erreur'
        notes = request.data.get('notes', '')
        if notes:
            session.notes = notes
        session.save()
        return Response({'statut': 'erreur', 'message': 'Erreur signalee.'})
