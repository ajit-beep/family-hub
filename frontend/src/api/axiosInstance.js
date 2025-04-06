// frontend/src/api/axiosInstance.js
import axios from 'axios';
import { authTokensRef } from '../context/AuthContext';

// Use the backend base URL (adjust if needed, maybe use environment variables later)
const API_BASE_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000, // Example timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // THIS IS THE IMPORTANT PART for HttpOnly Cookies:
    withCredentials: true
});


axiosInstance.interceptors.request.use(
    (config) => {
        // Get the token from the ref object
        const token = authTokensRef.accessToken;
        if (token) {
            // If the token exists, add the Authorization header
            config.headers['Authorization'] = `Bearer ${token}`;
            // --- Add flag for refresh requests ---
            // This helps the response interceptor identify refresh failures
            if (config.url === '/api/token/refresh/') {
                config._isRefreshTokenRequest = true;
            }
            // console.log("Attaching token:", token); // Optional: for debugging
        } else {
            // Optional: delete header if no token, just in case
            delete config.headers['Authorization'];
        }
        return config; // Return the modified config
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);


// --- Add the Response Interceptor ---
axiosInstance.interceptors.response.use(
    // 1. Handle Successful Responses (pass them through)
    (response) => {
        return response;
    },
    // 2. Handle Errors
    async (error) => {
        const originalRequest = error.config; // Get config of the request that failed
        

        // Check if it's a 401 Unauthorized error AND it wasn't already a retry/refresh attempt
        if (error.response?.status === 401 && !originalRequest._isRetry && !originalRequest._isRefreshTokenRequest) {
            console.log("Access token expired or invalid. Attempting refresh...");
            originalRequest._isRetry = true; // Mark this request configuration as a retry attempt

            try {
                // Attempt to refresh the token using the refresh cookie
                const refreshResponse = await axiosInstance.post('/api/token/refresh/');
                const newAccessToken = refreshResponse.data.access;

                console.log("Token refresh successful. New access token obtained.");

                // --- IMPORTANT: Update the token reference ---
                // Update the token held by the AuthContext ref for subsequent requests
                authTokensRef.accessToken = newAccessToken;
                // Note: The actual React state in AuthContext isn't updated here directly,
                // which is a limitation. Components won't immediately re-render based
                // on this *specific* update. However, future requests will use the new token.
                // More complex solutions involve event emitters or integrating state management.

                // Update the Authorization header of the ORIGINAL failed request config
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Retry the original request with the new token
                console.log("Retrying original request with new token...");
                return axiosInstance(originalRequest); // Re-issue the original request

            } catch (refreshError) {
                // If refresh fails (e.g., refresh cookie invalid/expired)
                console.error("Token refresh failed:", refreshError);
                // Clear the potentially stale token reference
                authTokensRef.accessToken = null;
                // TODO: Ideally, call the context's logout function here, but that's complex.
                // For now, redirecting or just letting subsequent requests fail might be okay.
                // Example: Redirect to login
                // window.location.replace('/login');
                alert("Your session has expired. Please log in again."); // Simple feedback

                // Reject the promise to signal the original call failed ultimately
                return Promise.reject(refreshError);
            }
        }

        // For all other errors (non-401, or if it was already a retry/refresh fail),
        // just pass the error along
        return Promise.reject(error);
    }
);
// ---------------------------------

export default axiosInstance;