from rest_framework import serializers
from .models import *
class PsycologistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Psychologist
        fields = '__all__'
class CadidatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidates
        fields = '__all__'
    
class TestDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestDetails
        fields = '__all__'

class TestEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestEvaluation
        fields = '__all__'

class AppointmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentsTable
        fields = '__all__'  