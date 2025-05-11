// frontend/src/components/auth/PublicRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Loading state - can show a loader
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    // User is authenticated, redirect away from public page (e.g., login) to home
    return <Navigate to="/" replace />;
  }

  // User is not authenticated, render the public page
  return children ? children : <Outlet />;
};

export default PublicRoute;