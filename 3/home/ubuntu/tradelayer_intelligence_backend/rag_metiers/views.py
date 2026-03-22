import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import InstanceRAG, QuestionRAG
from .serializers import InstanceRAGSerializer, QuestionRAGSerializer, DemandeQuestionSerializer
from .services import OpenRAGService

logger = logging.getLogger(__name__)


class InstanceRAGViewSet(viewsets.ModelViewSet):
    """CRUD sur les instances RAG (admin uniquement en ecriture)."""
    queryset = InstanceRAG.objects.filter(actif=True)
    serializer_class = InstanceRAGSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def sante(self, request, pk=None):
        """Verifie si l'instance RAG est disponible."""
        instance = self.get_object()
        service = OpenRAGService(instance)
        disponible = service.sante()
        return Response({
            'corps_metier': instance.corps_metier,
            'url': instance.url_openrag,
            'disponible': disponible,
        })

    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Liste des corps de metier avec RAG actif."""
        instances = InstanceRAG.objects.filter(actif=True)
        return Response([{
            'corps_metier': i.corps_metier,
            'normes': i.normes_disponibles,
            'description': i.description,
        } for i in instances])


class QuestionRAGViewSet(viewsets.ModelViewSet):
    """Historique des questions + endpoint pour poser une question."""
    queryset = QuestionRAG.objects.all()
    serializer_class = QuestionRAGSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuestionRAG.objects.filter(utilisateur=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def poser(self, request):
        """
        Pose une question au RAG du corps de metier.

        Body: { "corps_metier": "plomberie", "question": "...", "contexte": "..." }
        """
        serializer = DemandeQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        corps_metier = serializer.validated_data['corps_metier']
        question = serializer.validated_data['question']
        contexte = serializer.validated_data.get('contexte', '')

        # Cherche l'instance RAG pour ce metier
        try:
            instance = InstanceRAG.objects.get(corps_metier=corps_metier, actif=True)
        except InstanceRAG.DoesNotExist:
            # Pas d'instance OpenRAG configuree : reponse generique
            q = QuestionRAG.objects.create(
                utilisateur=request.user,
                corps_metier=corps_metier,
                question=question,
                reponse=f"Aucun assistant RAG configure pour le metier '{corps_metier}'. Contactez votre chef de projet.",
                statut='erreur',
            )
            return Response(QuestionRAGSerializer(q).data, status=status.HTTP_200_OK)

        # Interroge le RAG
        service = OpenRAGService(instance)
        resultat = service.poser_question(question, contexte)

        # Sauvegarde la question et la reponse
        q = QuestionRAG.objects.create(
            utilisateur=request.user,
            instance_rag=instance,
            corps_metier=corps_metier,
            question=question,
            reponse=resultat['reponse'],
            sources=resultat['sources'],
            statut='traitee' if resultat['succes'] else 'erreur',
            temps_reponse_ms=resultat['temps_ms'],
        )

        logger.info("Question RAG %s par %s : %s...", corps_metier, request.user.username, question[:50])
        return Response(QuestionRAGSerializer(q).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def mon_historique(self, request):
        """Historique des questions de l'utilisateur connecte."""
        questions = self.get_queryset()[:20]
        return Response(QuestionRAGSerializer(questions, many=True).data)
