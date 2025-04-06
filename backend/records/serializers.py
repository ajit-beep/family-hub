# ./backend/records/serializers.py

from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Document model.
    """
    # Make category display the readable name on GET, but accept code on POST/PUT
    category = serializers.CharField(source='get_category_display', read_only=True)
    category_code = serializers.ChoiceField(choices=Document.CATEGORY_CHOICES, write_only=True, source='category')

    class Meta:
        model = Document
        fields = [
            'id',
            'family', # Include for reference, but will be read-only
            'name',
            'file',
            'category', # Readable name for GET
            'category_code', # Code for POST/PUT
            'uploaded_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'family', # IMPORTANT: Family is set automatically based on user
            'uploaded_at',
            'updated_at',
            'category', # Read-only because write is handled by category_code
        ]

    # If you need to handle file uploads correctly, especially updates,
    # DRF ModelSerializer usually handles FileField well, but be mindful.
    # Ensure your frontend sends file data using multipart/form-data.