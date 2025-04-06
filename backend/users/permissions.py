# ./backend/users/permissions.py

from rest_framework import permissions
from .models import UserProfile # Need UserProfile to check the role

class IsFamilyAdmin(permissions.BasePermission):
    """
    Custom permission to only allow users who are admins of a family.
    Assumes user is authenticated (should be used with IsAuthenticated).
    """
    message = "You do not have permission to perform this action (not a family admin)."

    def has_permission(self, request, view):
        # Check if user is authenticated (redundant if IsAuthenticated is used first, but safe)
        if not request.user or not request.user.is_authenticated:
            return False

        # Check if the user has a profile
        if not hasattr(request.user, 'profile'):
            self.message = "User profile not found."
            return False # Cannot be admin without a profile

        # Check if the user belongs to a family
        if request.user.profile.family is None:
            self.message = "You must belong to a family to perform this action."
            return False # Cannot be admin if not in a family

        # Check if the user's role is 'admin'
        is_admin = request.user.profile.role == UserProfile.ROLE_ADMIN
        if not is_admin:
             self.message = "Only family admins can perform this action."

        return is_admin