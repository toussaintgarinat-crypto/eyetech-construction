from rest_framework import serializers
from .models import InstanceRAG, QuestionRAG


class InstanceRAGSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanceRAG
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class QuestionRAGSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionRAG
        fields = '__all__'
        read_only_fields = ['utilisateur', 'reponse', 'sources', 'statut', 'temps_reponse_ms', 'created_at']


class DemandeQuestionSerializer(serializers.Serializer):
    """Serializer pour poser une question au RAG."""
    corps_metier = serializers.ChoiceField(choices=[
        'plomberie', 'electricite', 'placo', 'charpente', 'cvc',
        'peinture', 'maconnerie', 'menuiserie', 'carrelage', 'toiture'
    ])
    question = serializers.CharField(max_length=1000)
    contexte = serializers.CharField(max_length=500, required=False, default='')
