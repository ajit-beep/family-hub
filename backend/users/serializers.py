# backend/users/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password # Optional: Add password validation
from django.contrib.auth import get_user_model
from .models import Family, UserProfile

User = get_user_model() # Best practice to get the User mode

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        # Fields required for registration
        fields = ('username', 'password', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style':{'input_type': 'password'},
                'validators': [validate_password]
            },
            'first_name': {'required': False}, # Make optional
            'last_name': {'required': False}, # Make optional
        }

    def validate_email(self, value):
        """
        Check that the email address is unique amongst users.
        Uses case-insensitive check.
        """
        # Normalize email to lowercase for case-insensitive comparison
        normalized_email = value.lower()
        # Check if a user with this email already exists (case-insensitive)
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("A user with that email address already exists.")
        # Return the potentially normalized value to be used in validated_data
        return normalized_email
    
    def create(self, validated_data):
        # Use create_user to handle password hashing automatically
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''), # Use .get for optional fields
            last_name=validated_data.get('last_name', '')
        )
        return user

# --- NEW: Simple serializer for nested profile data ---
class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for nested display of profile details within UserSerializer.
    Shows only family ID and role for the /me endpoint.
    """
    class Meta:
        model = UserProfile
        fields = ('family', 'role') # Include the fields frontend needs

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying User model details, now including
    nested profile information (family ID and role).
    """

    profile = UserProfileSerializer(read_only=True) # Nested serializer for profile data
    class Meta:
        model = User
        # Fields to include when retrieving user details via the '/api/users/me/' endpoint
        fields = (
            'id','username',
            'email','first_name',
            'last_name','date_joined',
            'profile'
        ) # Added date_joined as example
        extra_kwargs = {
            'id': {'read_only': True},
            'username': {'read_only': True},
            'date_joined': {'read_only': True},
            # Email could potentially be updated via a profile endpoint, so not strictly read-only here,
            # unless you want to prevent modification via this serializer entirely.
            # 'email': {'read_only': True}
        }

class FamilySerializer(serializers.ModelSerializer):
    """
    Serializer for the Family model. Handles creation (requires 'name')
    and representation.
    """
    class Meta:
        model = Family
        fields = ('id', 'name', 'created_at') # Fields to include in response
        read_only_fields = ('id', 'created_at') # These are set automatically

    def validate_name(self, value):
        # Example basic validation: ensure name is not just whitespace
        if not value or value.strip() == "":
            raise serializers.ValidationError("Family name cannot be empty.")
        # You could add more validation here (e.g., uniqueness if required)
        return value

# --- New Serializer for Adding Members ---
class AddMemberSerializer(serializers.Serializer):
    """
    Serializer for validating the input when adding a member to a family.
    Expects the 'username' of the user to be added.
    """
    username = serializers.CharField(
        max_length=150, # Standard max_length for username
        required=True,
        help_text="Username of the user to add to the family."
    )

    # You could add validation here to check if user exists,
    # but often this check is better handled in the view logic
    # after permission checks have passed.
    # def validate_username(self, value):
    #     if not User.objects.filter(username=value).exists():
    #         raise serializers.ValidationError("User with this username does not exist.")
    #     return value