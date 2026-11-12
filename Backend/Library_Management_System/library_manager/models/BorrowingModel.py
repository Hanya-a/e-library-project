from django.db import models
from .BookModel import Book
from .MemberModel import Member

class Borrowing(models.Model):
    member = models.ForeignKey(Member, on_delete=models.PROTECT)
    book =models.ForeignKey(Book,on_delete=models.CASCADE)
    borrowed_at = models.DateTimeField(auto_now_add=True)
    returned_at =models.DateField(null=True,blank=True)
