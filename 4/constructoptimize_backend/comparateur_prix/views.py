from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import (
    RechercheComparaison,
    ElementRecherche,
    ResultatComparaison,
    RecommandationAchat,
    AnalyseMarche,
    ConfigurationUtilisateur,
    StatistiqueUtilisation,
)
from .serializers import (
    RechercheComparaisonSerializer,
    ElementRechercheSerializer,
    ResultatComparaisonSerializer,
    RecommandationAchatSerializer,
    AnalyseMarcheSerializer,
    ConfigurationUtilisateurSerializer,
    StatistiqueUtilisationSerializer,
)


class RechercheComparaisonViewSet(viewsets.ModelViewSet):
    """
    Recherches de comparaison — filtrées par utilisateur (BOLA protection).
    Un utilisateur ne voit que ses propres recherches.
    """
    serializer_class = RechercheComparaisonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RechercheComparaison.objects.filter(utilisateur=self.request.user)

    def perform_create(self, serializer):
        serializer.save(utilisateur=self.request.user)


class ElementRechercheViewSet(viewsets.ModelViewSet):
    """Éléments liés aux recherches de l'utilisateur courant."""
    serializer_class = ElementRechercheSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ElementRecherche.objects.filter(recherche__utilisateur=self.request.user)


class ResultatComparaisonViewSet(viewsets.ModelViewSet):
    """Résultats liés aux recherches de l'utilisateur courant."""
    serializer_class = ResultatComparaisonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ResultatComparaison.objects.filter(recherche__utilisateur=self.request.user)


class RecommandationAchatViewSet(viewsets.ModelViewSet):
    """Recommandations liées aux recherches de l'utilisateur courant."""
    serializer_class = RecommandationAchatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecommandationAchat.objects.filter(recherche__utilisateur=self.request.user)


class AnalyseMarcheViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Analyses de marché — données publiques agrégées, lecture seule.
    Pas de données personnelles.
    """
    queryset = AnalyseMarche.objects.all()
    serializer_class = AnalyseMarcheSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ConfigurationUtilisateurViewSet(viewsets.ModelViewSet):
    """Configuration personnelle — un utilisateur accède uniquement à sa propre config."""
    serializer_class = ConfigurationUtilisateurSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ConfigurationUtilisateur.objects.filter(utilisateur=self.request.user)

    def perform_create(self, serializer):
        serializer.save(utilisateur=self.request.user)


class StatistiqueUtilisationViewSet(viewsets.ModelViewSet):
    """Statistiques d'utilisation — filtrées par utilisateur courant."""
    serializer_class = StatistiqueUtilisationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StatistiqueUtilisation.objects.filter(utilisateur=self.request.user)

    def perform_create(self, serializer):
        serializer.save(utilisateur=self.request.user)
