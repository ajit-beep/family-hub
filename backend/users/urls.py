# backend/users/urls.py
from django.urls import path
from .views import RegisterView, UserDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),  # Example for user details (GET)
    # Add other user-related URLs here later (e.g., profile view)
]