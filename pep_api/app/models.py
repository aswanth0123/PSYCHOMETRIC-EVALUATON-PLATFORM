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

class Candidates(models.Model):
    fisrt_name = models.TextField()
    last_name = models.TextField()
    dob = models.DateField()
    gender =  models.TextField()
    contact_no = models.TextField()
    email = models.EmailField()
    password = models.TextField()

class TestDetails(models.Model):
    TEST_ID = models.AutoField(primary_key=True)
    TEST_NAME = models.CharField(max_length=255, unique=True)
    TEST_DESCRIPTION = models.TextField()

    def __str__(self):
        return self.TEST_NAME

from django.db import models

class TestEvaluation(models.Model):
    TEST_EVALUATION_ID = models.AutoField(primary_key=True)
    CANDIDATE_ID = models.ForeignKey('Candidates', on_delete=models.CASCADE)  # Assuming you have a Cadidates model
    TEST_ID = models.ForeignKey('TestDetails', on_delete=models.CASCADE)  # Assuming you have a TestDetails model
    TEST_EVALUATION = models.TextField()

    def __str__(self):
        return f"Evaluation {self.TEST_EVALUATION_ID} - Candidate {self.CANDIDATE_ID} - Test {self.TEST_ID}"

from django.db import models

class AppointmentsTable(models.Model):
    APPOINTMENT_ID = models.AutoField(primary_key=True)
    PSYCHOLOGIST_ID = models.ForeignKey('Psychologist', on_delete=models.CASCADE)  # Assuming Psychologist model exists
    CANDIDATE_ID = models.ForeignKey('Candidates', on_delete=models.CASCADE)  # Assuming Candidates model exists
    TEST_ID = models.ForeignKey('TestDetails', on_delete=models.CASCADE)  # Assuming TestDetails model exists
    TEST_EVALUATION_ID = models.ForeignKey('TestEvaluation', on_delete=models.CASCADE)  # Assuming TestEvaluation model exists
    TIME_SLOT = models.DateTimeField()  # Stores date and time of appointment

    def __str__(self):
        return f"Appointment {self.APPOINTMENT_ID} - {self.TIME_SLOT}"
