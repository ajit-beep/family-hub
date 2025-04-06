# ./backend/records/views.py

from rest_framework import viewsets, permissions, serializers
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows documents to be viewed or edited.
    Provides list, create, retrieve, update, destroy actions.
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users

    def get_queryset(self):
        """
        This view should return a list of all the documents
        for the currently authenticated user's family.
        """
        user = self.request.user
        # Ensure user has a profile and is associated with a family
        if hasattr(user, 'profile') and user.profile.family:
            # Filter documents to only those belonging to the user's family
            return Document.objects.filter(family=user.profile.family)
        # If user has no profile or no family, return an empty queryset
        return Document.objects.none()

    def perform_create(self, serializer):
        """
        Assign the document to the requesting user's family automatically.
        """
        user = self.request.user
        # Ensure user has a profile and is associated with a family
        if hasattr(user, 'profile') and user.profile.family:
            # Save the document, associating it with the user's family
            serializer.save(family=user.profile.family)
        else:
            # Should not happen if user creation requires family or is checked elsewhere,
            # but raise error just in case.
            raise serializers.ValidationError(
                "You must belong to a family to upload documents."
            )

    # Note: The default retrieve, update, and destroy methods of ModelViewSet
    # will use get_queryset() to fetch the initial object list, providing
    # inherent data isolation. An extra check could be added in perform_update/
    # perform_destroy if needed, but filtering get_queryset is usually sufficient.