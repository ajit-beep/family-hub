// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import the configured axios instance

// Simple reference holder accessible outside React components
export const authTokensRef = {
    accessToken: null
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Store accessToken in state only, initialize as null
    const [user, setUser] = useState(null); // To store the whole user object from /me
    const [familyId, setFamilyId] = useState(null);
    const [userRole, setUserRole] = useState(null); 
    const [accessToken, setAccessToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Initial state is not authenticated
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const didAttemptRefreshRef = useRef(false);

    // --- Helper to clear all auth state ---
    const handleLogoutCleanup = () => {
        setAccessToken(null);
        authTokensRef.accessToken = null;
        setIsAuthenticated(false);
        setUser(null);
        setFamilyId(null);
        setUserRole(null);
        console.log("Auth state cleared.");
    };

    // Check if user is logged in (has valid refresh token) on initial load
    // We might need a '/api/users/me/' endpoint later or try refreshing immediately
    const handleNewAccessToken = (newAccessToken) => {
        setAccessToken(newAccessToken);
        authTokensRef.accessToken = newAccessToken; // Update ref for interceptor
        setIsAuthenticated(!!newAccessToken); // Update auth status based on token presence
        console.log("Access token updated in state and ref.");
    };

    // --- New: Function to fetch user details ---
    const fetchUserDetails = async () => {
        console.log("Attempting to fetch user details (/api/users/me/)...");
        try {
            // Interceptor adds token
            const response = await axiosInstance.get('/api/users/me/');
            const userData = response.data;
            if (userData) {
                setUser(userData); // Store full user object
                if (userData.profile) {
                    setFamilyId(userData.profile.family); // Store family ID (can be null)
                    setUserRole(userData.profile.role);   // Store role
                    console.log("User details set in context:", { user: userData.username, familyId: userData.profile.family, userRole: userData.profile.role });
                } else {
                    setFamilyId(null);
                    setUserRole(null);
                    console.warn("User profile data missing in /me response!");
                }
                // Ensure authenticated is true if user data is successfully fetched
                if(!isAuthenticated) setIsAuthenticated(true);
            } else {
                console.warn("/me endpoint returned no data.");
                handleLogoutCleanup(); // Clear state if /me fails badly
            }
        } catch (error) {
            console.error("Failed to fetch user details:", error.response?.data || error.message);
            // If /me fails (e.g., 401 Unauthorized), token is likely bad, clear state
            handleLogoutCleanup();
        }
        // Note: We set isLoading=false in the useEffect/login functions
        // AFTER fetchUserDetails completes or fails.
    };

    useEffect(() => {
        if (didAttemptRefreshRef.current) {
            console.log("Skipping duplicate refresh attempt due to StrictMode or re-render.");
            // If skipping, ensure loading is eventually false
            if (isLoading) setIsLoading(false);
            return; // Exit early on second run
        }
        // Mark that we are attempting the refresh for this component lifecycle
        didAttemptRefreshRef.current = true;
        console.log("AuthProvider mounted. Attempting silent refresh (first valid run)...");
        // Flag to track if the component is still mounted when async calls finish
        setIsLoading(true);
        let isStillMounted = true;
        console.log("AuthProvider Effect Setup Ran"); // Log setup
    
        const attemptRefresh = async () => {            
    
            console.log("Running attemptRefresh logic...");
            //setIsLoading(true); // Set loading right before the call
    
            try {
                console.log("Calling POST /api/token/refresh/");
                const response = await axiosInstance.post('/api/token/refresh/');
    
                // Only update state if the component is still mounted
                handleNewAccessToken(response.data.access);
                console.log("Silent refresh successful. State updated.");
                // --- If refresh worked, THEN fetch user details ---
                await fetchUserDetails(); // Fetch details using the new token
                // --- End fetch user details ---
            } catch (error) {
                 // Only update state if the component is still mounted
                 
                console.log("Silent refresh failed...", error.response?.data || error.message);
                handleNewAccessToken(null); // Clear token state on failure
                handleLogoutCleanup();
            } finally {
                setIsLoading(false);
                console.log("Initial auth check attempt complete.");
                // Log the final auth state for verification
                // Note: state updates might not be reflected immediately here due to async nature
                // console.log(`Auth check finished. Current context state: isLoading=${isLoading}, isAuthenticated=${isAuthenticated}`);
            }
        };
     

        attemptRefresh();
        // Cleanup function: runs when component unmounts OR before effect re-runs in StrictMode
        return () => {
            console.log("AuthProvider Effect Cleanup Ran");
            isStillMounted = false; // Set flag so async callbacks know component unmounted
        };
    }, []);


    // Login function - now just focuses on calling the token endpoint and updating state
    const login = async (username, password) => { // Modified to take credentials
        // Clear previous state just in case
        handleLogoutCleanup(); 
        setIsLoading(true); // Indicate loading during login attempt
        try {
            const payload = { username, password };
            const response = await axiosInstance.post('/api/token/', payload);
            handleNewAccessToken(response.data.access); // Use handler
            // --- If login worked, THEN fetch user details ---
            await fetchUserDetails(); // Fetch details using the new token
            setIsLoading(false);
            return true; // Indicate success
        } catch (error) {
            console.error("Login API call failed:", error);
            handleLogoutCleanup(); // Clear state on login failure
            setIsLoading(false);
            throw error; // Re-throw error for the form to handle
        }
    };

    // Logout function
    const logout = async () => {
        console.log("Logging out...");
        // const tokenToClear = authTokensRef.accessToken;
        // handleNewAccessToken(null); // Clear frontend state immediately
        handleLogoutCleanup();

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
        user,       // <-- Provide user
        familyId,   // <-- Provide familyId
        userRole,   // <-- Provide userRole
        login,
        logout,
        fetchUserDetails // <-- Optionally expose refetch function
    };

    // Render children only after initial loading check is done
    //return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
    return (
     <AuthContext.Provider value={value}>
       {/* 
         The children (your app) are only rendered if the AuthProvider's 
         isLoading is false. This is usually for the *initial* auth check.
         Ensure this logic doesn't inadvertently hide the login page itself 
         if a login *attempt* fails.
       */}
       {/* Original line: {!isLoading && children} */}
       {children} {/* Temporarily render children always to see if this is the issue, then we'll refine */}
     </AuthContext.Provider>
    );
};

// Custom hook (no changes needed here)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};