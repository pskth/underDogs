from django.contrib import admin
from .models import PDF, HistoricalFigure

# Register models to appear in Django admin
admin.site.register(HistoricalFigure)
admin.site.register(PDF)
