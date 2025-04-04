# backend/users/views.py
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny # Allow anyone to access this view
from .serializers import RegisterSerializer # Import the serializer we just created

class RegisterView(generics.CreateAPIView):
    """
    API endpoint that allows users to be registered.
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,) # No authentication required to register
    serializer_class = RegisterSerializer