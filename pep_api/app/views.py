from django.shortcuts import render
from rest_framework import viewsets
from .models import *
from . serializers import *
# Create your views here.

class Psychologistview(viewsets.ModelViewSet):
    queryset = Psychologist.objects.all()
    serializer_class = PsycologistSerializer


class Candidatesview(viewsets.ModelViewSet):
    queryset = Candidates.objects.all()
    serializer_class = CadidatesSerializer
    
class TestDetailsViewSet(viewsets.ModelViewSet):
    queryset = TestDetails.objects.all()
    serializer_class = TestDetailsSerializer

class TestEvaluationViewSet(viewsets.ModelViewSet):
    queryset = TestEvaluation.objects.all()
    serializer_class = TestEvaluationSerializer

class AppoimentsViewsets(viewsets.ModelViewSet):
    queryset = AppointmentsTable.objects.all()
    serializer_class = AppointmentsSerializer