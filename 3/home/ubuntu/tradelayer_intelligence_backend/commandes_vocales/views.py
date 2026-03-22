from rest_framework import viewsets
from .models import CommandeVocale, LogInteractionVocale
from .serializers import CommandeVocaleSerializer, LogInteractionVocaleSerializer

class CommandeVocaleViewSet(viewsets.ModelViewSet):
    queryset = CommandeVocale.objects.all()
    serializer_class = CommandeVocaleSerializer

class LogInteractionVocaleViewSet(viewsets.ModelViewSet):
    queryset = LogInteractionVocale.objects.all()
    serializer_class = LogInteractionVocaleSerializer

