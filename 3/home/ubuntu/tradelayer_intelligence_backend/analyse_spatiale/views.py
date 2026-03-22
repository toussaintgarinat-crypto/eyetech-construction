from rest_framework import viewsets
from .models import ZoneAnalyse, PointInteret, MesureSpatiale
from .serializers import ZoneAnalyseSerializer, PointInteretSerializer, MesureSpatialeSerializer

class ZoneAnalyseViewSet(viewsets.ModelViewSet):
    queryset = ZoneAnalyse.objects.all()
    serializer_class = ZoneAnalyseSerializer

class PointInteretViewSet(viewsets.ModelViewSet):
    queryset = PointInteret.objects.all()
    serializer_class = PointInteretSerializer

class MesureSpatialeViewSet(viewsets.ModelViewSet):
    queryset = MesureSpatiale.objects.all()
    serializer_class = MesureSpatialeSerializer

