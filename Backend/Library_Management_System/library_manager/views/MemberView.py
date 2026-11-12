from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from ..models.MemberModel import Member
from ..serializers.MemberSerializer import MemberSerializer


class MemberView(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "email"]
    ordering_fields = ["name"]