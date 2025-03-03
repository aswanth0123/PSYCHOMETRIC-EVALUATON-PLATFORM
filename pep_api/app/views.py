from django.shortcuts import render
from rest_framework import viewsets
from .models import *
from . serializers import *
# Create your views here.

class Psychologistview(viewsets.ModelViewSet):
    queryset = Psychologist.objects.all()
    serializer_class = PsycologistSerializer


class Cadidatesview(viewsets.ModelViewSet):
    queryset = Cadidates.objects.all()
    serializer_class = CadidatesSerializer
    