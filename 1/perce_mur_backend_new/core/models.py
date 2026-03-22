from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.name

class DrillingPoint(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='drilling_points')
    x = models.FloatField()
    y = models.FloatField()
    z = models.FloatField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Drilling Point {self.id} (Project: {self.project.name})"

class ARMeasurement(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='ar_measurements')
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AR Measurement {self.id} (Project: {self.project.name})"

class Photo(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='photos/')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo {self.id} (Project: {self.project.name})"

class PrintPlan(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='print_plans')
    plan_file = models.FileField(upload_to='print_plans/')
    plan_type = models.CharField(max_length=10, choices=[('A3', 'A3'), ('A4', 'A4')])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Print Plan {self.id} (Project: {self.project.name})"
