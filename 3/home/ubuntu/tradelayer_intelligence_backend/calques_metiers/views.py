from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.contrib.auth.models import User
import logging

from .models import (
    CorpsMetier, Projet, CalqueMetier, ElementCalque,
    Annotation, ConflitCalque, BibliothequeSymboles
)
from .serializers import (
    CorpsMetierSerializer, ProjetListSerializer, ProjetDetailSerializer,
    CalqueMetierListSerializer, CalqueMetierDetailSerializer,
    ElementCalqueSerializer, AnnotationSerializer, ConflitCalqueSerializer,
    BibliothequeSymbolesSerializer, CommandeVocaleSerializer,
    ResultatCommandeVocaleSerializer
)

logger = logging.getLogger(__name__)

class CorpsMetierViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les corps de métier (lecture seule)
    """
    queryset = CorpsMetier.objects.filter(actif=True)
    serializer_class = CorpsMetierSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrage par nom si spécifié
        nom = self.request.query_params.get('nom', None)
        if nom:
            queryset = queryset.filter(nom__icontains=nom)
        
        return queryset.order_by('ordre_affichage', 'nom_affichage')

class ProjetViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des projets
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Projet.objects.filter(
            Q(proprietaire=user) | Q(collaborateurs=user)
        ).distinct()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProjetListSerializer
        return ProjetDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(proprietaire=self.request.user)
    
    @action(detail=True, methods=['post'])
    def ajouter_collaborateur(self, request, pk=None):
        """Ajouter un collaborateur au projet"""
        projet = self.get_object()
        
        # Vérifier que l'utilisateur est le propriétaire
        if projet.proprietaire != request.user:
            return Response(
                {'error': 'Seul le propriétaire peut ajouter des collaborateurs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        username = request.data.get('username')
        if not username:
            return Response(
                {'error': "Le nom d'utilisateur est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
            projet.collaborateurs.add(user)
            return Response({'message': f'Collaborateur {username} ajouté avec succès'})
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['delete'])
    def retirer_collaborateur(self, request, pk=None):
        """Retirer un collaborateur du projet"""
        projet = self.get_object()
        
        if projet.proprietaire != request.user:
            return Response(
                {'error': 'Seul le propriétaire peut retirer des collaborateurs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': "L'ID utilisateur est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            projet.collaborateurs.remove(user)
            return Response({'message': 'Collaborateur retiré avec succès'})
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

class CalqueMetierViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des calques métiers
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        projet_id = self.request.query_params.get('projet_id')
        
        queryset = CalqueMetier.objects.filter(
            projet__in=Projet.objects.filter(
                Q(proprietaire=user) | Q(collaborateurs=user)
            )
        )
        
        if projet_id:
            queryset = queryset.filter(projet_id=projet_id)
        
        return queryset.distinct()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CalqueMetierListSerializer
        return CalqueMetierDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(
            auteur=self.request.user,
            derniere_modification_par=self.request.user
        )
    
    def perform_update(self, serializer):
        serializer.save(derniere_modification_par=self.request.user)
    
    @action(detail=True, methods=['post'])
    def dupliquer(self, request, pk=None):
        """Dupliquer un calque métier"""
        calque_original = self.get_object()
        
        # Créer une copie du calque
        nouveau_calque = CalqueMetier.objects.create(
            nom=f"{calque_original.nom} (Copie)",
            description=calque_original.description,
            projet=calque_original.projet,
            corps_metier=calque_original.corps_metier,
            couleur=calque_original.couleur,
            opacite=calque_original.opacite,
            style_ligne=calque_original.style_ligne,
            epaisseur_ligne=calque_original.epaisseur_ligne,
            priorite_affichage=calque_original.priorite_affichage,
            auteur=request.user,
            derniere_modification_par=request.user
        )
        
        # Copier les éléments
        for element in calque_original.elements.all():
            ElementCalque.objects.create(
                calque=nouveau_calque,
                type_element=element.type_element,
                nom=element.nom,
                description=element.description,
                geometrie=element.geometrie,
                couleur=element.couleur,
                opacite=element.opacite,
                taille=element.taille,
                rotation=element.rotation,
                proprietes_metier=element.proprietes_metier,
                auteur=request.user
            )
        
        serializer = CalqueMetierDetailSerializer(nouveau_calque)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def basculer_visibilite(self, request, pk=None):
        """Basculer la visibilité d'un calque"""
        calque = self.get_object()
        calque.visible = not calque.visible
        calque.derniere_modification_par = request.user
        calque.save()
        
        return Response({
            'visible': calque.visible,
            'message': f'Calque {"affiché" if calque.visible else "masqué"}'
        })
    
    @action(detail=True, methods=['post'])
    def verrouiller(self, request, pk=None):
        """Verrouiller/déverrouiller un calque"""
        calque = self.get_object()
        calque.verrouille = not calque.verrouille
        calque.derniere_modification_par = request.user
        calque.save()
        
        return Response({
            'verrouille': calque.verrouille,
            'message': f'Calque {"verrouillé" if calque.verrouille else "déverrouillé"}'
        })

class ElementCalqueViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des éléments de calque
    """
    serializer_class = ElementCalqueSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        calque_id = self.request.query_params.get('calque_id')
        
        queryset = ElementCalque.objects.filter(
            calque__projet__in=Projet.objects.filter(
                Q(proprietaire=user) | Q(collaborateurs=user)
            )
        )
        
        if calque_id:
            queryset = queryset.filter(calque_id=calque_id)
        
        return queryset.distinct()
    
    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)
    
    @action(detail=False, methods=['post'])
    def creation_par_commande_vocale(self, request):
        """Créer des éléments via commande vocale"""
        serializer = CommandeVocaleSerializer(data=request.data)
        if serializer.is_valid():
            # Simulation du traitement de commande vocale
            # Dans une implémentation réelle, ceci ferait appel à un service d'IA
            resultat = {
                'succes': True,
                'message': 'Commande vocale traitée avec succès',
                'elements_crees': [],
                'suggestions': ['Ajouter des points de mesure', "Vérifier l'alignement"]
            }
            
            result_serializer = ResultatCommandeVocaleSerializer(resultat)
            return Response(result_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AnnotationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des annotations
    """
    serializer_class = AnnotationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        calque_id = self.request.query_params.get('calque_id')
        element_id = self.request.query_params.get('element_id')
        statut = self.request.query_params.get('statut')
        
        queryset = Annotation.objects.filter(
            calque__projet__in=Projet.objects.filter(
                Q(proprietaire=user) | Q(collaborateurs=user)
            )
        )
        
        if calque_id:
            queryset = queryset.filter(calque_id=calque_id)
        
        if element_id:
            queryset = queryset.filter(element_id=element_id)
        
        if statut:
            queryset = queryset.filter(statut=statut)
        
        return queryset.distinct()
    
    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)
    
    @action(detail=True, methods=['post'])
    def changer_statut(self, request, pk=None):
        """Changer le statut d'une annotation"""
        annotation = self.get_object()
        nouveau_statut = request.data.get('statut')
        
        if nouveau_statut not in dict(Annotation.STATUT_CHOICES):
            return Response(
                {'error': 'Statut invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        annotation.statut = nouveau_statut
        annotation.save()
        
        return Response({
            'statut': annotation.statut,
            'message': f'Statut changé vers {annotation.get_statut_display()}'
        })

class ConflitCalqueViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la consultation des conflits de calques
    """
    serializer_class = ConflitCalqueSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        projet_id = self.request.query_params.get('projet_id')
        gravite = self.request.query_params.get('gravite')
        statut = self.request.query_params.get('statut')
        
        queryset = ConflitCalque.objects.filter(
            element_1__calque__projet__in=Projet.objects.filter(
                Q(proprietaire=user) | Q(collaborateurs=user)
            )
        )
        
        if projet_id:
            queryset = queryset.filter(element_1__calque__projet_id=projet_id)
        
        if gravite:
            queryset = queryset.filter(gravite=gravite)
        
        if statut:
            queryset = queryset.filter(statut=statut)
        
        return queryset.distinct()
    
    @action(detail=False, methods=['post'])
    def detecter_conflits(self, request):
        """Détecter les conflits dans un projet"""
        projet_id = request.data.get('projet_id')
        if not projet_id:
            return Response(
                {'error': "L'ID du projet est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            projet = Projet.objects.get(id=projet_id)
            # Simulation de détection de conflits
            # Dans une implémentation réelle, ceci analyserait la géométrie des éléments
            conflits = []
            
            return Response({
                'conflits_detectes': len(conflits),
                'conflits': ConflitCalqueSerializer(conflits, many=True).data
            })
        except Projet.DoesNotExist:
            return Response(
                {'error': 'Projet non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def resoudre(self, request, pk=None):
        """Marquer un conflit comme résolu"""
        conflit = self.get_object()
        solution = request.data.get('solution', '')
        
        conflit.statut = 'resolu'
        conflit.resolu_par = request.user
        conflit.solution_appliquee = solution
        conflit.save()
        
        return Response({
            'message': 'Conflit marqué comme résolu',
            'statut': conflit.statut
        })

class BibliothequeSymbolesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la bibliothèque de symboles
    """
    serializer_class = BibliothequeSymbolesSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        corps_metier = self.request.query_params.get('corps_metier')
        standard = self.request.query_params.get('standard')
        
        queryset = BibliothequeSymboles.objects.all()
        
        if corps_metier:
            queryset = queryset.filter(corps_metier__nom=corps_metier)
        
        if standard is not None:
            queryset = queryset.filter(standard=standard.lower() == 'true')
        
        return queryset
