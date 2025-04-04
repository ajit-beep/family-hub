Tasks for User Authentication (High Level):

We'll tackle this in pieces, usually starting with the backend API, then building the frontend UI to interact with it.

Backend (Django / DRF):

Set up User Model: Utilize Django's built-in User model initially.
Choose API Authentication: Decide how the frontend will prove it's logged in when talking to the API. JWT (JSON Web Tokens) is a very common and suitable method for SPAs. We'll use a library like djangorestframework-simplejwt.
Create API Endpoints: Using DRF, we'll build endpoints for:
User Registration (Sign Up)
User Login (Sign In - issuing JWT tokens)
User Logout (Sign Out - potentially blacklisting tokens)
Maybe an endpoint to fetch the current logged-in user's details.
Configure Settings: Update Django settings for authentication backends and the JWT library.
Frontend (React):

Create UI Forms: Build simple React components for Login and Registration forms.
API Calls: Write functions (e.g., using Workspace or libraries like axios) to send form data to the backend API endpoints.
Token Handling: Securely store the JWT token received upon login (e.g., in localStorage or sessionStorage) and send it with subsequent API requests.
Routing: Set up basic page navigation (e.g., using react-router-dom) to show login/register pages or a simple "logged-in" view.
Logout: Implement logout logic to clear the stored token and redirect.
Let's Start with the Backend API Setup:

It makes sense to build the API endpoints first, so the frontend has something to connect to.

Action Plan:

Create the feature/user-authentication branch locally.
Install djangorestframework-simplejwt.
Configure Django settings for DRF and simplejwt.
Start building the Registration API endpoint.