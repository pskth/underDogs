from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PDFViewSet

router = DefaultRouter()
router.register(r"pdfs", PDFViewSet, basename="pdf")

urlpatterns = [
    path("", include(router.urls)),
]
