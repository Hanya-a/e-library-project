
from rest_framework import serializers

from ..models.BorrowingModel import Borrowing


class BorrowingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Borrowing
        fields = "__all__"

    # Validate book availability and member borrowing limits.
    def validate(self, data):
        book = data.get("book")
        member = data.get("member")

        if not book or not member:
            raise serializers.ValidationError(
                "Please select a member and a book."
            )

        if not book.available:
            raise serializers.ValidationError(
                "This book is not available."
            )

        # Count the member's currently active borrowings.
        active_borrowings = Borrowing.objects.filter(
            member=member,
            returned_at__isnull=True
        ).count()

        # Maximum number of active borrowings per member type.
        limits = {
            "Student": 3,
            "Staff": 5,
            "Guest": 1
        }

        if active_borrowings >= limits[member.member_type]:
            raise serializers.ValidationError(
                "You have reached your borrowing limit."
            )

        return data

    # Create the borrowing and update the book's availability.
    def create(self, validated_data):
        book = validated_data["book"]

        book.available = False
        book.save()

        return Borrowing.objects.create(**validated_data)
