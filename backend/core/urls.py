"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


from users.views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    RegisterView,
)

# # Import the simplejwt views
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT authentication URLs
    path('api/token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'), # POST username/password here to get tokens
    path('api/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'), # POST refresh token here to get new access token
    path('api/token/logout/', LogoutView.as_view(), name='token_logout'), # New Logout URL

    # User related endpoints (Registration, etc.)
    path('api/users/', include('users.urls')), # Include URLs from the users app
    path('api/records/', include('records.urls')), # Include URLs from the records app

    # Add paths for your custom API endpoints later, possibly using include
    # path('api/', include('api.urls')), # Example for later
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)