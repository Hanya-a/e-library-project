
from django.db import models


class Book(models.Model):
    GENRE=[("Fantasy","fantasy"),
           ("Action","action"),
           ("Classic","classic"),
           ("Thriller","thriller"),
           ("Academic","academic")]
    title =models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    genre =models.CharField(max_length=20, choices=GENRE)
    date_added = models.DateField(auto_now_add=True)
    available = models.BooleanField(default=True)

