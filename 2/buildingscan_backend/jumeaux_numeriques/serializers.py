from rest_framework import serializers
from .models import JumeauNumerique


class JumeauNumeriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = JumeauNumerique
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
