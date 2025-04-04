# backend/users/urls.py
from django.urls import path
from .views import RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    # Add other user-related URLs here later (e.g., profile view)
]