import math
import time
import unicodedata
from decimal import Decimal

from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from fournisseurs.models import PrixProduit
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

# Référence géographique par défaut : Paris
LAT_REF_DEFAULT = 48.8566
LON_REF_DEFAULT = 2.3522


def haversine_km(lat1, lon1, lat2, lon2):
    """Calcule la distance en km entre deux points (lat/lon)."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(min(a, 1.0)))


class RechercheComparaisonViewSet(viewsets.ModelViewSet):
    """
    Recherches de comparaison.

    POST /api/comparateur/recherches/ accepte :
      - materiau (str) : terme de recherche
      - adresse_chantier (str) : adresse de référence (non géocodée localement)
      - rayon_km (int) : rayon de recherche en km

    La création génère automatiquement les ResultatComparaison correspondants
    en cherchant les PrixProduit dont le nom contient le terme de recherche.
    """
    serializer_class = RechercheComparaisonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RechercheComparaison.objects.filter(utilisateur=self.request.user)

    def create(self, request, *args, **kwargs):
        # Accepte les noms de champs du frontend (materiau, adresse_chantier, rayon_km)
        # ou les noms du modèle (terme_recherche, rayon_recherche)
        materiau = (
            request.data.get('materiau')
            or request.data.get('terme_recherche')
            or ''
        ).strip()

        rayon_km_raw = request.data.get('rayon_km') or request.data.get('rayon_recherche') or 50
        try:
            rayon_km = int(rayon_km_raw)
        except (ValueError, TypeError):
            rayon_km = 50

        if not materiau:
            return Response(
                {'erreur': 'Le champ "materiau" est requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        t_start = time.time()

        # Crée la recherche
        recherche = RechercheComparaison.objects.create(
            utilisateur=request.user,
            terme_recherche=materiau,
            rayon_recherche=rayon_km,
            statut='en_cours',
        )

        # Construit un filtre sur le nom du produit (tous les mots significatifs)
        # SQLite est sensible aux accents : on génère les variantes accentuées
        def accent_variants(word):
            """Retourne des variantes accentuées françaises d'un mot sans accents."""
            w = word.lower()
            variants = {w}
            # Substitutions fréquentes français
            pairs = [
                ('e', ['é', 'è', 'ê', 'ë']),
                ('a', ['à', 'â']),
                ('u', ['ù', 'û']),
                ('i', ['î', 'ï']),
                ('o', ['ô']),
                ('c', ['ç']),
            ]
            for base, accented_list in pairs:
                if base in w:
                    for acc in accented_list:
                        variants.add(w.replace(base, acc, 1))
            return list(variants)

        def strip_accents(s):
            return ''.join(
                c for c in unicodedata.normalize('NFD', s)
                if unicodedata.category(c) != 'Mn'
            )

        mots = [m for m in materiau.split() if len(m) >= 2]
        if mots:
            q = Q()
            for mot in mots:
                mot_stripped = strip_accents(mot)
                # Cherche le mot tel quel
                q |= Q(produit__nom__icontains=mot)
                # Cherche le mot sans accents (si différent)
                if mot_stripped != mot:
                    q |= Q(produit__nom__icontains=mot_stripped)
                # Génère les variantes accentuées pour les mots sans accents
                for variant in accent_variants(mot_stripped):
                    q |= Q(produit__nom__icontains=variant)
                # Cherche aussi dans le nom de catégorie
                q |= Q(produit__categorie__nom__icontains=mot)
                q |= Q(produit__categorie__nom__icontains=mot_stripped)
            prix_qs = (
                PrixProduit.objects
                .filter(q, disponible=True)
                .select_related('produit__categorie', 'fournisseur')
                .distinct()[:60]
            )
        else:
            prix_qs = (
                PrixProduit.objects
                .filter(disponible=True)
                .select_related('produit__categorie', 'fournisseur')[:20]
            )

        # Génère les ResultatComparaison
        resultats_crees = 0
        for pp in prix_qs:
            f = pp.fournisseur

            # Calcul de la distance
            if f.latitude and f.longitude:
                dist = round(haversine_km(
                    LAT_REF_DEFAULT, LON_REF_DEFAULT,
                    float(f.latitude), float(f.longitude)
                ), 1)
            else:
                dist = 15.0  # distance par défaut si pas de coordonnées

            # Filtre par rayon
            if dist > rayon_km:
                continue

            prix_ht = Decimal(str(pp.prix))
            prix_ttc = (prix_ht * Decimal('1.20')).quantize(Decimal('0.01'))

            ResultatComparaison.objects.create(
                recherche=recherche,
                prix_produit=pp,
                quantite=1,
                prix_unitaire=prix_ht,
                prix_total_ht=prix_ht,
                prix_total_ttc=prix_ttc,
                frais_livraison=pp.frais_livraison or Decimal('0.00'),
                disponible=pp.disponible,
                stock_disponible=pp.stock_disponible,
                delai_livraison_estime=pp.delai_livraison or 7,
                distance_fournisseur=Decimal(str(dist)),
                source_donnees='manual',
            )
            resultats_crees += 1

        # Met à jour la recherche
        temps = round(time.time() - t_start, 3)
        recherche.nombre_resultats = resultats_crees
        recherche.statut = 'terminee'
        recherche.temps_execution = Decimal(str(temps))
        recherche.save()

        return Response(
            {
                'id': str(recherche.id),
                'nombre_resultats': resultats_crees,
                'terme_recherche': materiau,
                'rayon_km': rayon_km,
            },
            status=status.HTTP_201_CREATED,
        )

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
        qs = ResultatComparaison.objects.filter(
            recherche__utilisateur=self.request.user
        ).select_related('prix_produit__fournisseur', 'prix_produit__produit')

        recherche_id = self.request.query_params.get('recherche')
        if recherche_id:
            qs = qs.filter(recherche_id=recherche_id)

        return qs


class RecommandationAchatViewSet(viewsets.ModelViewSet):
    """Recommandations liées aux recherches de l'utilisateur courant."""
    serializer_class = RecommandationAchatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecommandationAchat.objects.filter(recherche__utilisateur=self.request.user)


class AnalyseMarcheViewSet(viewsets.ReadOnlyModelViewSet):
    """Analyses de marché — données publiques agrégées, lecture seule."""
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
