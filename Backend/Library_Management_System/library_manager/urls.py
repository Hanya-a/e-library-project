from rest_framework.routers import DefaultRouter
from .views.BookView import BookView
from .views.BorrowingView import BorrowingView
from .views.MemberView import MemberView

router = DefaultRouter()
router.register("books", BookView, basename="books")
router.register("borrowings", BorrowingView, basename="borrowings")
router.register("members", MemberView, basename="members")

urlpatterns = router.urls