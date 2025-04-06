# ./backend/users/signals.py
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
# Import UserProfile model from the same app's models.py
from .models import UserProfile

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Creates a UserProfile when a new User is created.
    Ensures user.profile always exists right after user creation.
    """
    if created:
        UserProfile.objects.create(user=instance)
        # Optional: Save immediately if default values need explicit db save,
        # often create() handles it, but can be explicit:
        # instance.profile.save()