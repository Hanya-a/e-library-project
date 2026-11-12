from rest_framework import serializers
from ..models.BookModel import Book

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model=Book
        fields="__all__"
        read_only_fields = ["available"]
