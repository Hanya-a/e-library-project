from django.db import models

class Member(models.Model):
    MEMBER_TYPES = [("Student", "student"), ("Staff", "staff"), ("Guest", "guest")]
    name = models.CharField(max_length=100)
    member_type = models.CharField(max_length=10, choices=MEMBER_TYPES)
    email = models.EmailField(blank=True)