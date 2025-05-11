// frontend/src/pages/HomePage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import CreateFamilyForm from '../components/CreateFamilyForm';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
// import { DocumentTextIcon, UserGroupIcon, PhotoIcon, ChartBarIcon } from '@heroicons/react/24/outline'; // Example icons

function HomePage() {
  const { isAuthenticated, user, familyId, userRole, isLoading: authLoading } = useAuth();

  if (authLoading) { // Covers initial token refresh and user data fetch
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-lg text-[var(--color-neutral-500)]">Loading application data...</p>
        {/* Consider a spinner component here */}
      </div>
    );
  }

  // Should be handled by ProtectedRoute, but as a fallback:
  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">Welcome to FamilyHub</h2>
        <p className="text-[var(--color-neutral-600)]">
          Please <Link to="/login" className="text-[var(--color-brand-primary)] hover:underline">log in</Link> or{' '}
          <Link to="/register" className="text-[var(--color-brand-primary)] hover:underline">register</Link> to continue.
        </p>
      </div>
    );
  }

  // User is Authenticated
  return (
    <div className="space-y-8">
      <Card el="section"> {/* Use semantic element */}
        <CardContent>
          <h2 className="text-3xl font-bold text-[var(--color-neutral-800)]">
            Welcome back, {user.first_name || user.username}!
          </h2>
          <p className="text-[var(--color-neutral-600)] mt-1">
            Here's what's happening in your FamilyHub.
          </p>
          {/* More general info could go here, e.g., date, quick stats if any */}
        </CardContent>
      </Card>

      {familyId ? (
        // --- User IS in a family ---
        <Card el="section">
          <CardHeader>
            Your Family Hub Dashboard (ID: {familyId})
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-[var(--color-neutral-600)]">
              Your role: <strong className="text-[var(--color-brand-primary)]">{userRole}</strong>
            </p>
            <h4 className="text-lg font-semibold mb-4 text-[var(--color-neutral-700)]">Quick Access:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quick Access Links as Cards/Styled Links */}
              <Link to="/documents" className="block p-6 bg-[var(--color-neutral-50)] hover:bg-[var(--color-neutral-200)] rounded-[var(--border-radius-box)] shadow transition-all hover:shadow-md">
                {/* <DocumentTextIcon className="h-8 w-8 mb-2 text-[var(--color-brand-primary)]" /> */}
                <h5 className="font-semibold text-[var(--color-neutral-700)]">Manage Documents</h5>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">View, upload, and organize shared files.</p>
              </Link>
              <Link to="/members" className="block p-6 bg-[var(--color-neutral-50)] hover:bg-[var(--color-neutral-200)] rounded-[var(--border-radius-box)] shadow transition-all hover:shadow-md">
                {/* <UserGroupIcon className="h-8 w-8 mb-2 text-[var(--color-brand-primary)]" /> */}
                <h5 className="font-semibold text-[var(--color-neutral-700)]">View Family Members</h5>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">See who is in your family group.</p>
              </Link>
              {/* Example WIP Links */}
              <div className="block p-6 bg-[var(--color-neutral-50)] rounded-[var(--border-radius-box)] shadow opacity-60 cursor-not-allowed">
                {/* <ChartBarIcon className="h-8 w-8 mb-2 text-[var(--color-neutral-400)]" /> */}
                <h5 className="font-semibold text-[var(--color-neutral-700)]">Track Investments (WIP)</h5>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">Coming soon!</p>
              </div>
              <div className="block p-6 bg-[var(--color-neutral-50)] rounded-[var(--border-radius-box)] shadow opacity-60 cursor-not-allowed">
                {/* <PhotoIcon className="h-8 w-8 mb-2 text-[var(--color-neutral-400)]" /> */}
                <h5 className="font-semibold text-[var(--color-neutral-700)]">View Photos (WIP)</h5>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">Coming soon!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // --- User IS NOT in a family ---
        <CreateFamilyForm />
      )}
    </div>
  );
}

export default HomePage;