# backend/users/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password # Optional: Add password validation


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

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying User model details.
    Marks key identifiers as read-only.
    """
    class Meta:
        model = User
        # Fields to include when retrieving user details via the '/api/users/me/' endpoint
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined') # Added date_joined as example
        extra_kwargs = {
            'id': {'read_only': True},
            'username': {'read_only': True},
            'date_joined': {'read_only': True},
            # Email could potentially be updated via a profile endpoint, so not strictly read-only here,
            # unless you want to prevent modification via this serializer entirely.
            # 'email': {'read_only': True}
        }