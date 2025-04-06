# ./backend/users/models.py

from django.conf import settings # Use settings.AUTH_USER_MODEL is best practice
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

# 1. Define the Family model
class Family(models.Model):
    """
    Represents a distinct family unit within the application.
    """
    name = models.CharField(
        max_length=100,
        help_text="The name of the family (e.g., 'The Smiths', 'John Doe Family')."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Families" # Correct pluralization in Django admin

    def __str__(self):
        """String representation for the Family model."""
        return self.name

# 2. Define the UserProfile model linked to the AUTH_USER_MODEL
class UserProfile(models.Model):
    """
    Stores additional information related to a User, including their
    family membership and role within that family.
    Linked one-to-one with the User model specified in settings.AUTH_USER_MODEL.
    """
    # Link to the User model (likely 'auth.User' by default)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, # If a User is deleted, delete their Profile too
        related_name='profile',   # Allows easy access via user.profile
        primary_key=True,         # Makes the user link the primary key
        help_text="The user associated with this profile."
    )

    # Link to the Family model
    family = models.ForeignKey(
        Family,
        on_delete=models.SET_NULL, # If Family is deleted, set user's family link to NULL
        null=True,                 # Allows users to exist without a family initially
        blank=True,                # Allows the field to be blank in forms/admin
        related_name='members',    # Allows access via family.members.all()
        help_text="The family this user belongs to, if any."
    )

    # Role within the family
    ROLE_ADMIN = 'admin'
    ROLE_MEMBER = 'member'
    ROLE_CHOICES = (
        (ROLE_ADMIN, 'Admin'),     # Use constants for role values
        (ROLE_MEMBER, 'Member'),
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=ROLE_MEMBER,       # Default new profiles to 'member'
        help_text="The user's role within their family."
    )

    # Add future profile-specific fields here (e.g., avatar, bio, etc.)
    # created_at/updated_at are often useful here too
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        """String representation for the UserProfile model."""
        return f"{self.user.username}'s Profile"