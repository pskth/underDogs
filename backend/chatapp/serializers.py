from rest_framework import serializers
from .models import PDF


class PDFSerializer(serializers.ModelSerializer):
    """
    Serializer to convert PDF model instances to JSON and handle uploads.
    """

    class Meta:
        model = PDF
        fields = ["id", "file", "text", "created_at"]
        read_only_fields = ["id", "text", "created_at"]
