from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    CorpsMetier, Projet, CalqueMetier, ElementCalque, 
    Annotation, ConflitCalque, BibliothequeSymboles
)

class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id']

class CorpsMetierSerializer(serializers.ModelSerializer):
    """Serializer pour les corps de métier"""
    class Meta:
        model = CorpsMetier
        fields = [
            'id', 'nom', 'nom_affichage', 'description', 'couleur_principale',
            'icone', 'actif', 'ordre_affichage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjetListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des projets (vue simplifiée)"""
    proprietaire = UserSerializer(read_only=True)
    nombre_calques = serializers.SerializerMethodField()
    
    class Meta:
        model = Projet
        fields = [
            'id', 'nom', 'description', 'adresse', 'statut',
            'proprietaire', 'nombre_calques', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_nombre_calques(self, obj):
        return obj.calques.count()

class ProjetDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un projet"""
    proprietaire = UserSerializer(read_only=True)
    collaborateurs = UserSerializer(many=True, read_only=True)
    calques = serializers.SerializerMethodField()
    
    class Meta:
        model = Projet
        fields = [
            'id', 'nom', 'description', 'adresse', 'latitude', 'longitude',
            'surface_totale', 'nombre_etages', 'type_batiment', 'statut',
            'proprietaire', 'collaborateurs', 'calques', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_calques(self, obj):
        calques = obj.calques.all()
        return CalqueMetierListSerializer(calques, many=True).data

class CalqueMetierListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des calques métiers"""
    corps_metier = CorpsMetierSerializer(read_only=True)
    auteur = UserSerializer(read_only=True)
    nombre_elements = serializers.SerializerMethodField()
    nombre_annotations = serializers.SerializerMethodField()
    
    class Meta:
        model = CalqueMetier
        fields = [
            'id', 'nom', 'description', 'corps_metier', 'couleur', 'opacite',
            'style_ligne', 'epaisseur_ligne', 'visible', 'verrouille',
            'priorite_affichage', 'version', 'auteur', 'nombre_elements',
            'nombre_annotations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_nombre_elements(self, obj):
        return obj.elements.count()
    
    def get_nombre_annotations(self, obj):
        return obj.annotations.count()

class CalqueMetierDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un calque métier"""
    corps_metier = CorpsMetierSerializer(read_only=True)
    corps_metier_id = serializers.PrimaryKeyRelatedField(
        queryset=CorpsMetier.objects.all(), 
        source='corps_metier', 
        write_only=True
    )
    auteur = UserSerializer(read_only=True)
    derniere_modification_par = UserSerializer(read_only=True)
    elements = serializers.SerializerMethodField()
    annotations = serializers.SerializerMethodField()
    
    class Meta:
        model = CalqueMetier
        fields = [
            'id', 'nom', 'description', 'projet', 'corps_metier', 'corps_metier_id',
            'couleur', 'opacite', 'style_ligne', 'epaisseur_ligne', 'visible',
            'verrouille', 'priorite_affichage', 'version', 'auteur',
            'derniere_modification_par', 'elements', 'annotations',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'auteur', 'derniere_modification_par']
    
    def get_elements(self, obj):
        elements = obj.elements.all()
        return ElementCalqueSerializer(elements, many=True).data
    
    def get_annotations(self, obj):
        annotations = obj.annotations.all()
        return AnnotationSerializer(annotations, many=True).data

class ElementCalqueSerializer(serializers.ModelSerializer):
    """Serializer pour les éléments de calque"""
    auteur = UserSerializer(read_only=True)
    
    class Meta:
        model = ElementCalque
        fields = [
            'id', 'calque', 'type_element', 'nom', 'description', 'geometrie',
            'couleur', 'opacite', 'taille', 'rotation', 'proprietes_metier',
            'visible', 'verrouille', 'auteur', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'auteur']
    
    def validate_geometrie(self, value):
        """Valider la structure des données géométriques"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("La géométrie doit être un objet JSON valide")
        
        # Validation basique selon le type d'élément
        type_element = self.initial_data.get('type_element')
        
        if type_element == 'point':
            required_fields = ['x', 'y']
        elif type_element == 'ligne':
            required_fields = ['points']
        elif type_element in ['rectangle', 'cercle']:
            required_fields = ['x', 'y', 'width', 'height']
        elif type_element == 'polygone':
            required_fields = ['points']
        else:
            required_fields = []
        
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Le champ '{field}' est requis pour le type '{type_element}'")
        
        return value

class AnnotationSerializer(serializers.ModelSerializer):
    """Serializer pour les annotations"""
    auteur = UserSerializer(read_only=True)
    assigne_a = UserSerializer(read_only=True)
    assigne_a_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigne_a',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Annotation
        fields = [
            'id', 'calque', 'element', 'type_annotation', 'titre', 'contenu',
            'position_x', 'position_y', 'position_z', 'assigne_a', 'assigne_a_id',
            'statut', 'priorite', 'auteur', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'auteur']

class ConflitCalqueSerializer(serializers.ModelSerializer):
    """Serializer pour les conflits de calques"""
    element_1 = ElementCalqueSerializer(read_only=True)
    element_2 = ElementCalqueSerializer(read_only=True)
    resolu_par = UserSerializer(read_only=True)
    
    class Meta:
        model = ConflitCalque
        fields = [
            'id', 'element_1', 'element_2', 'type_conflit', 'gravite',
            'description', 'position_conflit', 'suggestions_resolution',
            'statut', 'resolu_par', 'solution_appliquee',
            'detecte_automatiquement', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'detecte_automatiquement']

class BibliothequeSymbolesSerializer(serializers.ModelSerializer):
    """Serializer pour la bibliothèque de symboles"""
    corps_metier = CorpsMetierSerializer(read_only=True)
    corps_metier_id = serializers.PrimaryKeyRelatedField(
        queryset=CorpsMetier.objects.all(),
        source='corps_metier',
        write_only=True
    )
    
    class Meta:
        model = BibliothequeSymboles
        fields = [
            'id', 'nom', 'description', 'corps_metier', 'corps_metier_id',
            'fichier_symbole', 'donnees_svg', 'proprietes_defaut',
            'standard', 'version', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

# Serializers pour les commandes vocales
class CommandeVocaleSerializer(serializers.Serializer):
    """Serializer pour traiter les commandes vocales"""
    commande = serializers.CharField(max_length=1000)
    calque_id = serializers.UUIDField(required=False)
    contexte = serializers.JSONField(required=False, default=dict)
    
    def validate_commande(self, value):
        """Valider que la commande n'est pas vide"""
        if not value.strip():
            raise serializers.ValidationError("La commande ne peut pas être vide")
        return value.strip()

class ResultatCommandeVocaleSerializer(serializers.Serializer):
    """Serializer pour le résultat d'une commande vocale"""
    succes = serializers.BooleanField()
    message = serializers.CharField()
    elements_crees = serializers.ListField(child=serializers.UUIDField(), required=False)
    suggestions = serializers.ListField(child=serializers.CharField(), required=False)
    
# Serializers pour l'analyse spatiale
class AnalyseSpatialeSerializer(serializers.Serializer):
    """Serializer pour les données d'analyse spatiale"""
    zone_id = serializers.CharField()
    type_zone = serializers.CharField()
    caracteristiques = serializers.JSONField()
    suggestions = serializers.ListField(child=serializers.CharField())
    conflits_potentiels = serializers.ListField(child=serializers.UUIDField())

class ContexteSpatialSerializer(serializers.Serializer):
    """Serializer pour le contexte spatial"""
    position_utilisateur = serializers.JSONField()
    zone_courante = serializers.CharField()
    calques_visibles = serializers.ListField(child=serializers.UUIDField())
    mode_interaction = serializers.CharField()
