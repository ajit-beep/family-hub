# backend/users/views.py
from django.conf import settings # To check DEBUG status
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import RegisterSerializer

# Import SimpleJWT views and utils
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.settings import api_settings as simple_jwt_settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

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
     def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200 and 'access' in response.data:
            # Access token is already in response.data from parent class
            # If token rotation is enabled, a new refresh token might be in the cookies
            # SimpleJWT *should* handle reading the refresh token from the cookie by default
            # if it's not in the request body. Let's verify by checking if a new refresh
            # token needs to be set (e.g., if rotation is enabled and successful)
            # NOTE: SimpleJWT doesn't explicitly put the *new* rotated refresh token
            # in the response data by default. Handling rotation often requires
            # more custom logic or specific serializers. For now, assume no rotation
            # or handle setting the *same* refresh cookie again if needed.

            # Example: If you customized the serializer to include the new refresh token:
            # if 'refresh' in response.data:
            #    refresh_token = response.data['refresh']
            #    del response.data['refresh'] # Don't send back in body
            #    response.set_cookie(...) # Set cookie as in login view

            # For simplicity now, we assume the refresh cookie lifespan is managed correctly
            # and just return the new access token in the body.
            pass # No cookie setting needed here unless refresh token rotation is implemented

        # Handle potential errors if the refresh cookie was invalid/expired
        elif response.status_code == 401:
             # Example: Clear the potentially invalid cookie on failure
             response.delete_cookie(settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token'))

        return super().finalize_response(request, response, *args, **kwargs)

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

