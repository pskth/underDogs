from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PDFViewSet, HistoricalFigureViewSet

# Create DRF router
router = DefaultRouter()

# Endpoint for managing historical figures
router.register(r"figures", HistoricalFigureViewSet, basename="figure")

# Endpoint for managing PDFs and figure-based chat
router.register(r"pdfs", PDFViewSet, basename="pdf")

urlpatterns = [
    path("", include(router.urls)),  # Include all router URLs
]
