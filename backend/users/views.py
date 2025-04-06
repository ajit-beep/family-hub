# backend/users/views.py
from django.conf import settings # To check DEBUG status
from django.contrib.auth.models import User
from rest_framework import generics, permissions, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import RegisterSerializer, UserSerializer, FamilySerializer, AddMemberSerializer
from .models import Family, UserProfile
from .permissions import IsFamilyAdmin # Custom permission to check family admin status

# Import SimpleJWT views and utils
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.settings import api_settings as simple_jwt_settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer # <-- Import Serializer

from django.shortcuts import get_object_or_404


class RegisterView(generics.CreateAPIView):
    """
    API endpoint that allows users to be registered.
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,) # No authentication required to register
    serializer_class = RegisterSerializer


# -- SubClass Login view--
class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        """
        Override the finalize_response method to set cookies for the tokens.
        """
        if response.status_code == 200 and 'access' in response.data:
            access_token = response.data['access']
            refresh_token = response.data['refresh']

            # remove refresh token from response data
            del response.data['refresh']

            # Set HttpOnly cookies for the tokens
            response.set_cookie(
                key=settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'access_token'), # Default cookie name
                value=refresh_token,
                max_age= settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(), # Set max age for the cookie
                httponly=True,
                secure=not settings.DEBUG, # Set Secure flag True only if NOT in DEBUG mode (requires HTTPS)
                samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax') # Use setting or default SameSite
            )

            print(f"Set refresh cookie. Secure={not settings.DEBUG}") # For debugging

            # Access token remains in the response body
            # Optionally set access token cookie (less secure if not HttpOnly)
            # response.set_cookie(
            #     key=settings.SIMPLE_JWT.get('AUTH_COOKIE_ACCESS', 'access_token'),
            #     value=access_token,
            #     max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            #     httponly=False, # Typically False so JS can read it (but less secure) - better to keep in memory
            #     secure=not settings.DEBUG,
            #     samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax')
            # )

        return super().finalize_response(request, response, *args, **kwargs)


# --- Subclassed Refresh View ---
class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer # Specify the serializer

    def post(self, request, *args, **kwargs):
        # Extract refresh token from HttpOnly cookie
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'))

        if not refresh_token:
            return Response({"detail": "Refresh token cookie not found."}, status=status.HTTP_401_UNAUTHORIZED)

        # Pass the refresh token from cookie into the serializer's data
        serializer = self.get_serializer(data={'refresh': refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            # Catch specific token errors (like blacklisted or invalid)
            raise InvalidToken(e.args[0])

        # If valid, serializer.validated_data will contain the new 'access' token
        response = Response(serializer.validated_data, status=status.HTTP_200_OK)

        # Optional: If using token rotation, the serializer might provide a new refresh token
        # You would need to handle setting that new cookie here if rotation is enabled.
        # if 'refresh' in serializer.validated_data: # Check if serializer provided a new one
        #     new_refresh = serializer.validated_data['refresh']
        #     response.set_cookie(
        #           key=settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'),
        #           value=new_refresh, ...) # Set new refresh cookie

        return response # Return response containing the new access token in body


# --- New Logout View ---
class LogoutView(APIView):
    permission_classes = (IsAuthenticated,) # Must be logged in to log out

    def post(self, request):
        try:
            # Optionally blacklist token if using blacklist app
            # refresh_token = request.COOKIES.get(settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'))
            # if refresh_token:
            #     token = RefreshToken(refresh_token)
            #     token.blacklist()

            response = Response({"detail": "Logout successful"}, status=status.HTTP_200_OK)
            # Delete the refresh token cookie
            response.delete_cookie(settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'))
            print("Deleted refresh cookie.") # For debugging
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(generics.RetrieveAPIView):
    """
    API endpoint that retrieves and returns details for the
    currently authenticated user making the request.
    Requires authentication.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] # Ensures only logged-in users can access

    def get_object(self):
        # Overrides the default lookup behavior (which uses URL pk)
        # to simply return the user associated with the request.
        return self.request.user

class FamilyCreateView(generics.CreateAPIView):
    """
    API endpoint for creating a new Family.
    POST request requires authentication and a 'name' field for the family.
    The requesting user automatically becomes the admin of the new family.
    Prevents users already in a family from creating another one.
    """
    queryset = Family.objects.all() # Required for CreateAPIView, though not strictly used here
    serializer_class = FamilySerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users can create

    def perform_create(self, serializer):
        """
        Custom logic executed after validation and before saving the serializer.
        Checks if user is already in a family and assigns the creator as admin.
        """
        user = self.request.user

        # Check if the user has a profile and if that profile is already linked to a family
        # Assumes the UserProfile signal worked and user.profile exists
        if hasattr(user, 'profile') and user.profile.family is not None:
            raise serializers.ValidationError("You already belong to a family and cannot create another one.")
        elif not hasattr(user, 'profile'):
             # This case should ideally not happen if signals are working correctly
             # but good to handle defensively.
             raise serializers.ValidationError("User profile not found. Cannot create family.")


        # If validation passes and user is not in a family, save the new Family instance
        # The serializer.save() call creates the Family object based on validated data
        family = serializer.save()

        # Now, update the user's profile to link to the new family and set role to admin
        profile = user.profile # Get the profile again (or use the one from check)
        profile.family = family
        profile.role = UserProfile.ROLE_ADMIN # Use the constant defined in the model
        profile.save()

        # The CreateAPIView will automatically handle returning the
        # 201 Created response with the serialized family data.

class FamilyMemberListView(generics.ListAPIView):
    """
    API endpoint for listing members of the requesting user's family.
    Returns a list of user details.
    Requires authentication. Returns empty list if user is not in a family.
    """
    serializer_class = UserSerializer # Use the existing UserSerializer for now
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Overrides the default queryset to return only members of the
        requesting user's family.
        """
        user = self.request.user

        # Check if the user has a profile and is associated with a family
        if hasattr(user, 'profile') and user.profile.family:
            user_family = user.profile.family
            # Return User objects where their profile's family matches the user's family
            # Order by username for consistent results
            return User.objects.filter(profile__family=user_family).order_by('username')
        else:
            # If user has no profile or no family, return an empty queryset
            return User.objects.none()


# --- New View for Adding Members ---
class AddFamilyMemberView(APIView):
    """
    API endpoint for adding an existing user to the requesting admin's family.
    Expects a POST request with {"username": "user_to_add"}.
    Requires authentication and the requesting user must be a family admin.
    """
    permission_classes = [permissions.IsAuthenticated, IsFamilyAdmin] # Must be logged in AND family admin

    def post(self, request, *args, **kwargs):
        serializer = AddMemberSerializer(data=request.data)
        if serializer.is_valid():
            username_to_add = serializer.validated_data['username']
            admin_user = request.user

            # Find the user to add
            try:
                user_to_add = User.objects.get(username=username_to_add)
            except User.DoesNotExist:
                return Response({"detail": f"User '{username_to_add}' not found."}, status=status.HTTP_404_NOT_FOUND)

            # Prevent admin from adding themselves
            if user_to_add == admin_user:
                 return Response({"detail": "You cannot add yourself to the family."}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the target user has a profile
            if not hasattr(user_to_add, 'profile'):
                # This ideally shouldn't happen for users registered after signals were set up
                return Response({"detail": f"Target user '{username_to_add}' does not have a profile record."}, status=status.HTTP_400_BAD_REQUEST)

            target_profile = user_to_add.profile

            # Check if the target user already belongs to a family
            if target_profile.family is not None:
                 # Check if they are already in the *same* family
                 if target_profile.family == admin_user.profile.family:
                     return Response({"detail": f"User '{username_to_add}' is already in your family."}, status=status.HTTP_400_BAD_REQUEST)
                 else:
                     return Response({"detail": f"User '{username_to_add}' already belongs to another family."}, status=status.HTTP_400_BAD_REQUEST)

            # Assign the user to the admin's family
            admin_family = admin_user.profile.family # We know this exists due to IsFamilyAdmin permission
            target_profile.family = admin_family
            target_profile.role = UserProfile.ROLE_MEMBER # Ensure added as a standard member
            target_profile.save()

            # Return success response
            # Optionally serialize the added user's details
            # user_serializer = UserSerializer(user_to_add)
            # return Response(user_serializer.data, status=status.HTTP_200_OK)
            return Response({"detail": f"User '{username_to_add}' successfully added to family '{admin_family.name}'."}, status=status.HTTP_200_OK)

        else:
            # Input data was invalid
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- New View for Removing Members ---
class RemoveFamilyMemberView(APIView):
    """
    API endpoint for removing a member from the requesting admin's family.
    Expects a DELETE request to /api/users/families/members/<user_id>/
    Requires authentication and the requesting user must be a family admin.
    """
    permission_classes = [permissions.IsAuthenticated, IsFamilyAdmin]

    def delete(self, request, user_id, *args, **kwargs):
        """
        Handles the DELETE request to remove a user from the family.
        The user_id to remove is passed in the URL.
        """
        admin_user = request.user

        # 1. Prevent admin from removing themselves via this endpoint
        if admin_user.id == user_id:
            return Response(
                {"detail": "You cannot remove yourself using this endpoint."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Find the target user to remove
        target_user = get_object_or_404(User, id=user_id)

        # 3. Check if the target user has a profile (should exist, but check defensively)
        if not hasattr(target_user, 'profile'):
            # This indicates a data inconsistency if it happens now
            return Response(
                {"detail": f"User '{target_user.username}' does not have a profile."},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_profile = target_user.profile
        admin_family = admin_user.profile.family # Assured by IsFamilyAdmin permission

        # 4. Verify the target user is actually in the admin's family
        if target_profile.family != admin_family:
            return Response(
                {"detail": f"User '{target_user.username}' is not a member of your family."},
                status=status.HTTP_400_BAD_REQUEST # Or 404 Not Found in this context
            )

        # 5. Perform the removal by unlinking the family and resetting role
        target_profile.family = None
        target_profile.role = UserProfile.ROLE_MEMBER # Reset role to default
        target_profile.save()

        # 6. Return success response (204 No Content is standard for DELETE)
        return Response(status=status.HTTP_204_NO_CONTENT)