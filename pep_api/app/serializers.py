from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

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
    test_name = serializers.CharField(source='TEST_ID.TEST_NAME', read_only=True)  # ✅ Include Test Name
    candidate_name = serializers.SerializerMethodField()
    def get_candidate_name(self, obj):
        return f"{obj.CANDIDATE_ID.first_name} {obj.CANDIDATE_ID.last_name}" 
    class Meta:
        model = TestEvaluation
        fields = '__all__'

class AppointmentsSerializer(serializers.ModelSerializer):
    psychologist_name = serializers.CharField(source="PSYCHOLOGIST_ID.fisrt_name", read_only=True)
    candidate_name = serializers.SerializerMethodField()
    test_name = serializers.CharField(source="TEST_ID.TEST_NAME", read_only=True)
    test_result = serializers.CharField(source="TEST_EVALUATION_ID.TEST_EVALUATION", read_only=True)
    class Meta:
        model = AppointmentsTable
        fields = '__all__'  
    def get_candidate_name(self, obj):
        return f"{obj.CANDIDATE_ID.first_name} {obj.CANDIDATE_ID.last_name}"
    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','password']