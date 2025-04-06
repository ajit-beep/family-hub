# backend/users/urls.py
from django.urls import path
from .views import (
    RegisterView,
    UserDetailView,
    FamilyCreateView,
    FamilyMemberListView,
    AddFamilyMemberView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),  # Example for user details (GET)
    path('families/', FamilyCreateView.as_view(), name='family-create'),  # Example for family creation (POST)
    path('families/members/', FamilyMemberListView.as_view(), name='family-member-list'),  # Example for family member list (GET)
    path('families/add-member/', AddFamilyMemberView.as_view(), name='family-member-add'), # POST to add member
    # Add other user-related URLs here later (e.g., profile view)
]