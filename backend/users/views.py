# backend/users/views.py
from django.conf import settings # To check DEBUG status
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import RegisterSerializer, UserSerializer

# Import SimpleJWT views and utils
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.settings import api_settings as simple_jwt_settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer # <-- Import Serializer


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