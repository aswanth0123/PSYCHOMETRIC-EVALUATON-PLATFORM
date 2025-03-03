from django.db import models

# Create your models here.
class Psychologist(models.Model):
    fisrt_name = models.TextField()
    last_name = models.TextField()
    dob = models.DateField()
    gender =  models.TextField()
    contact_no = models.TextField()
    email = models.EmailField()
    password = models.TextField()
    certifications = models.TextField()

class Cadidates(models.Model):
    fisrt_name = models.TextField()
    last_name = models.TextField()
    dob = models.DateField()
    gender =  models.TextField()
    contact_no = models.TextField()
    email = models.EmailField()
    password = models.TextField()