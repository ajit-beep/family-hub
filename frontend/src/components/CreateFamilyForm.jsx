// frontend/src/components/CreateFamilyForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Button from './ui/Button';
import Input from './ui/Input';
import Card, { CardHeader, CardContent } from './ui/Card'; // Removed CardFooter unless needed

const CreateFamilyForm = () => {
  const { fetchUserDetails, user } = useAuth();
  const [familyName, setFamilyName] = useState('');
  const [isLoading, setIsLoadingState] = useState(false); // Renamed to avoid conflict if used elsewhere
  const [error, setError] = useState(null);

  const handleCreateFamily = async (event) => {
    event.preventDefault();
    setIsLoadingState(true);
    setError(null);

    try {
      await axiosInstance.post('/api/users/families/', { name: familyName });
      setFamilyName('');
      await fetchUserDetails();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create family. Please try again.");
    } finally {
      setIsLoadingState(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-8 sm:mt-12"> {/* Added margin top */}
      <CardHeader>
        <h3 className="text-xl text-center font-semibold text-[var(--color-neutral-800)]">
          Set Up Your Family Hub
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-center text-[var(--color-neutral-600)] mb-6">
          Welcome, {user?.first_name || user?.username}! It looks like you're not part of a family group yet.
          Create one below to start sharing and managing together.
        </p>
        <form onSubmit={handleCreateFamily} className="space-y-4">
          <Input
            label="Family Name"
            type="text"
            id="familyName"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="e.g., The Adventure Squad"
            required
            disabled={isLoading}
            error={error} // Pass error to Input to display if it's a string
          />
          {/* Remove generic error display here if Input handles it, or adjust */}
          {error && typeof error === 'string' && !familyName && ( // Only show if it's a general error
             <p className="text-xs text-[var(--color-danger)]">{error}</p>
          )}
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? 'Creating...' : 'Create Family'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateFamilyForm;