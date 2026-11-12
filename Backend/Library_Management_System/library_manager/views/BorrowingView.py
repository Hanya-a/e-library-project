
from django.db import transaction
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.response import Response

from ..models.BorrowingModel import Borrowing
from ..serializers.BorrowingSerializer import BorrowingSerializer


class BorrowingView(viewsets.ModelViewSet):

    queryset = Borrowing.objects.all()
    serializer_class = BorrowingSerializer

    # Return a borrowed book.
    def update(self, request, *args, **kwargs):

        with transaction.atomic():
            borrowing = self.get_object()

            if borrowing.returned_at:
                return Response(
                    {"error": "Book already returned."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            book = borrowing.book
            book.available = True
            book.save()

            borrowing.returned_at = timezone.now().date()
            borrowing.save()

        return Response(
            {"message": "Book returned successfully."},
            status=status.HTTP_200_OK
        )

    # Allow the frontend to return a book using PATCH.
    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
