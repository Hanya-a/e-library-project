
from django.contrib import admin

from .models.BookModel import Book
from .models.MemberModel import Member
from .models.BorrowingModel import Borrowing


admin.site.register(Book)
admin.site.register(Member)
admin.site.register(Borrowing)
