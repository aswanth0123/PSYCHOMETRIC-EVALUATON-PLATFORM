from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(Psychologist)
admin.site.register(Candidates)
admin.site.register(TestDetails)
admin.site.register(TestEvaluation)