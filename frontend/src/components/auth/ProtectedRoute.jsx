// frontend/src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You can render a loading spinner or a blank page while checking auth
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-neutral-500">Loading application...</p>
        {/* Or a spinner component */}
      </div>
    );
  }

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    // Pass the current location so we can redirect back after login (optional)
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the child routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;