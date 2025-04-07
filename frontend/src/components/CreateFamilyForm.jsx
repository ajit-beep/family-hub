// Can be in HomePage.jsx or its own file e.g., frontend/src/components/CreateFamilyForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // To trigger refetch
import axiosInstance from '../api/axiosInstance'; // To make API call

const CreateFamilyComponent = () => {
  const { fetchUserDetails, user } = useAuth(); // Get refetch function and user
  const [familyName, setFamilyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateFamily = async (event) => {
    event.preventDefault(); // Prevent default HTML form submission
    setIsLoading(true);
    setError(null);

    try {
      // API endpoint likely /api/users/families/ based on previous setup
      const response = await axiosInstance.post('/api/users/families/', { name: familyName });

      console.log("Family created successfully:", response.data);
      setFamilyName(''); // Clear the form

      // IMPORTANT: Refetch user details to update context state (familyId, userRole)
      await fetchUserDetails(); // This will trigger re-render in HomePage

    } catch (err) {
      console.error("Failed to create family", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Could not create family. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '15px', backgroundColor: '#f9f9f9' }}>
      <h4>Create Your Family Hub</h4>
      <p>Welcome, {user?.username}! It looks like you're not part of a family group yet.</p>
      <p>Create one below to get started:</p>
      <form onSubmit={handleCreateFamily}>
        <div>
          <label htmlFor="familyName">Family Name: </label>
          <input
            type="text"
            id="familyName"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="e.g., The Smiths"
            required
            disabled={isLoading} // Disable input while loading
          />
        </div>
        {error && <p style={{ color: 'red', marginTop: '5px' }}>{error}</p>}
        <button type="submit" style={{ marginTop: '10px' }} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Family'}
        </button>
      </form>
    </div>
  );
};

// If moved to its own file, add: export default CreateFamilyComponent;
// And import it in HomePage.jsx
export default CreateFamilyComponent;