from django.db import models

# Create your models here.
from django.db import models


class PDF(models.Model):
    """
    Model to store uploaded PDFs and their extracted text.
    """

    file = models.FileField(upload_to="pdfs/")
    text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.file.name
