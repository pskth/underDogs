from django.db import models


class HistoricalFigure(models.Model):
    """
    Represents a historical figure to chat with.
    Each figure can have multiple PDFs associated with them for training/context.
    """

    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)  # Optional bio
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PDF(models.Model):
    """
    Stores uploaded PDFs linked to a HistoricalFigure.
    """

    figure = models.ForeignKey(
        HistoricalFigure,
        on_delete=models.CASCADE,
        related_name="pdfs",
        null=True,
        blank=True,
    )
    file = models.FileField(upload_to="pdfs/")
    text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.file.name} ({self.figure.name})"
