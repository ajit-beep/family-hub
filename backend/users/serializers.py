# backend/users/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password # Optional: Add password validation


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True) # Optional: Add password validation

    class Meta:
        model = User
        # Fields required for registration
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style':{'input_type': 'password'},
                'validators': [validate_password]
            },
            'first_name': {'required': False}, # Make optional
            'last_name': {'required': False}, # Make optional
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs
    
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