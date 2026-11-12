from rest_framework import viewsets
from ..models.BookModel import Book
from ..serializers.BookSerializer import BookSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter,OrderingFilter

class BookView(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer


    filter_backends = [DjangoFilterBackend,SearchFilter,OrderingFilter]
    filterset_fields = ["genre", "author", "date_added","available"]
    search_fields=["title","author"]
    ordering_fields=["title","date_added"]
