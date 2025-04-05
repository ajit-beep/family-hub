// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import the configured axios instance

// Simple reference holder accessible outside React components
export const authTokensRef = {
    accessToken: localStorage.getItem('accessTokenRef') // Attempt to load initial value if stored (optional)
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Store accessToken in state only, initialize as null
  const [accessToken, setAccessToken] = useState(null);
  // We no longer manage refreshToken in React state - it's in the cookie
  // const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Initial state is not authenticated
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Check if user is logged in (has valid refresh token) on initial load
  // We might need a '/api/users/me/' endpoint later or try refreshing immediately
  useEffect(() => {
    // For now, just assume not logged in on load until refresh logic is added
    // Or, try a silent refresh maybe? Let's keep it simple for now.
    // We know if accessToken is in state, they logged in THIS session.
    setIsAuthenticated(!!accessToken);
    // Persist token ref for potential use across refreshes (optional, state is primary)
    if (accessToken) {
        localStorage.setItem('accessTokenRef', accessToken);
    } else {
        localStorage.removeItem('accessTokenRef');
    }
    setIsLoading(false);
  }, [accessToken]);


  // Login function - only receives/stores access token now
  const login = (newAccessToken) => {
    setAccessToken(newAccessToken);
    // localStorage.setItem('accessToken', newAccessToken); // REMOVE localStorage
    // localStorage.setItem('refreshToken', newRefreshToken); // REMOVE localStorage
    // setRefreshToken(newRefreshToken); // REMOVE refreshToken state
    // setIsAuthenticated(true); // Handled by useEffect
    authTokensRef.accessToken = newAccessToken; // <-- Update the exported ref
    console.log("Logged in, access token stored in state.");
  };

  // Logout function - needs to call backend to clear cookie
  const logout = async () => {
    console.log("Logging out...");
    const tokenToClear = authTokensRef.accessToken; // Get token before clearing state
    setAccessToken(null); // Clear state first
    authTokensRef.accessToken = null; // <-- Clear the exported ref
    localStorage.removeItem('accessTokenRef'); // Clear ref persistence
    try {
      // Call the backend logout endpoint to clear the HttpOnly cookie
      await axiosInstance.post('/api/token/logout/');
    } catch (logoutErr) {
        console.error("Logout API call failed:", logoutErr);
        // Still clear frontend state even if backend call fails
    } finally {
        // Clear frontend state
        setAccessToken(null);
        // setIsAuthenticated(false); // Handled by useEffect
        console.log("Frontend logged out, access token cleared.");
        // Redirect or update UI as needed
        // window.location.href = '/login'; // Simple redirect
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