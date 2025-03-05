from django.shortcuts import render
from rest_framework import viewsets
from .models import *
from . serializers import *
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.serializers import Serializer, CharField
from django.contrib.auth import authenticate
from django.utils.timezone import now
from rest_framework.decorators import api_view

class LoginSerializer(Serializer):
    username = CharField()
    password = CharField(write_only=True)
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

@api_view(['POST'])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)  # Check credentials

    if user:
        return Response({"message": "Login successful", "user_id": user.id, "username": user.username})
    else:
        return Response({"error": "Invalid credentials"}, status=400)



@api_view(['GET'])
def upcoming_appointment_count(request):
    today = now()  # Get current date & time
    count = AppointmentsTable.objects.filter(TIME_SLOT__gt=today).count()  # Filter only future appointments
    return Response({"count": count})