# ./backend/records/models.py

from django.db import models
from users.models import Family # Import Family model from the users app

class Document(models.Model):
    """
    Represents an uploaded document associated with a specific family.
    """
    # --- Relationships ---
    family = models.ForeignKey(
        Family,
        on_delete=models.CASCADE, # If a Family is deleted, delete its documents too.
        related_name='documents', # Allows family.documents.all()
        help_text="The family this document belongs to."
        # null=False, blank=False by default, ensuring every doc has a family
    )

    # --- Document Details ---
    name = models.CharField(
        max_length=200,
        help_text="User-defined name or title for the document."
    )
    file = models.FileField(
        upload_to='documents/%Y/%m/', # Store files in MEDIA_ROOT/documents/YYYY/MM/
        help_text="The uploaded document file."
    )

    # --- Categorization (Simple Approach) ---
    CATEGORY_CHOICES = [
        ('MD', 'Medical'),
        ('ID', 'Identity'),
        ('FN', 'Financial'),
        ('LG', 'Legal'),
        ('AG', 'Agreement'),
        ('OT', 'Other'),
    ]
    category = models.CharField(
        max_length=2,
        choices=CATEGORY_CHOICES,
        default='OT', # Default to 'Other'
        help_text="Category of the document."
    )

    # --- Timestamps ---
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at'] # Show newest documents first by default

    def __str__(self):
        return f"{self.name} ({self.family.name})"