// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import the configured axios instance

// Simple reference holder accessible outside React components
export const authTokensRef = {
    accessToken: null
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Store accessToken in state only, initialize as null
    const [accessToken, setAccessToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Initial state is not authenticated
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    // Check if user is logged in (has valid refresh token) on initial load
    // We might need a '/api/users/me/' endpoint later or try refreshing immediately
    const handleNewAccessToken = (newAccessToken) => {
        setAccessToken(newAccessToken);
        authTokensRef.accessToken = newAccessToken; // Update ref for interceptor
        setIsAuthenticated(!!newAccessToken); // Update auth status based on token presence
        console.log("Access token updated in state and ref.");
    };

    useEffect(() => {
        console.log("AuthProvider mounted. Attempting silent refresh...");
        setIsLoading(true);

        const attemptRefresh = async () => {
            try {
                // AxiosInstance includes withCredentials: true, so cookie is sent
                const response = await axiosInstance.post('/api/token/refresh/');
                // If refresh is successful, backend sends back a new access token
                handleNewAccessToken(response.data.access);
                console.log("Silent refresh successful.");
            } catch (error) {
                // If refresh fails (e.g., expired/invalid refresh cookie), user is logged out
                console.log("Silent refresh failed or no valid refresh token found.", error.response?.data || error.message);
                // Ensure state reflects logged-out status
                handleNewAccessToken(null); // Clear any potential stale token
            } finally {
                // Regardless of success/failure, initial auth check is complete
                setIsLoading(false);
                console.log("Initial auth check complete.");
            }
        };

        attemptRefresh();
    }, []);


    // Login function - now just focuses on calling the token endpoint and updating state
    const login = async (username, password) => { // Modified to take credentials
        // Clear previous state just in case
        handleNewAccessToken(null);
        setIsLoading(true); // Indicate loading during login attempt
        try {
            const payload = { username, password };
            const response = await axiosInstance.post('/api/token/', payload);
            handleNewAccessToken(response.data.access); // Use handler
            setIsLoading(false);
            return true; // Indicate success
        } catch (error) {
            console.error("Login API call failed:", error);
            setIsLoading(false);
            throw error; // Re-throw error for the form to handle
        }
    };

    // Logout function
    const logout = async () => {
        console.log("Logging out...");
        // const tokenToClear = authTokensRef.accessToken;
        // handleNewAccessToken(null); // Clear frontend state immediately

        try {
            // Call backend logout endpoint FIRST.
            // The Axios interceptor will read the current accessToken from authTokensRef
            // and add the 'Authorization: Bearer ...' header.

            await axiosInstance.post('/api/token/logout/');
            console.log("Backend logout successful (cookie cleared).");
        } catch (logoutErr) {
            console.error("Logout API call failed:", logoutErr);
        } finally {
            handleNewAccessToken(null); 
            console.log("Frontend logged out completely.");
            // Redirect if needed (can also be done in the component calling logout)
            // window.location.replace('/login');
        }
    };

    const value = {
        accessToken,
        isAuthenticated,
        isLoading, // Provide loading state
        login,
        logout,
    };

    // Render children only after initial loading check is done
    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

// Custom hook (no changes needed here)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};