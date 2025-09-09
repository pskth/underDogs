from rest_framework import serializers
from .models import PDF, HistoricalFigure


class HistoricalFigureSerializer(serializers.ModelSerializer):
    """
    Serializer for HistoricalFigure model.
    """

    # Optional: Include PDFs in the serialized HistoricalFigure
    pdfs = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = HistoricalFigure
        fields = ["id", "name", "description", "created_at", "pdfs"]
        read_only_fields = ["id", "created_at"]


class PDFSerializer(serializers.ModelSerializer):
    """
    Serializer to convert PDF model instances to JSON and handle uploads.
    """

    figure = serializers.PrimaryKeyRelatedField(queryset=HistoricalFigure.objects.all())

    class Meta:
        model = PDF
        fields = ["id", "figure", "file", "text", "created_at"]
        read_only_fields = ["id", "text", "created_at"]
