from rest_framework import serializers
from .models import *
class PsycologistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Psychologist
        fields = '__all__'
class CadidatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cadidates
        fields = '__all__'