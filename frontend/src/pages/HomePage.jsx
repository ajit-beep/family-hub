// frontend/src/pages/HomePage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { Link } from 'react-router-dom';

// --- Placeholder Component ---
// This is a simple placeholder for where your "Create Family" form/UI will go.
// You will replace this with a real component later that interacts with the API.
const CreateFamilyComponent = () => {
  const { user } = useAuth(); // Can potentially use user info here if needed

  // Basic form structure - replace with actual form handling later
  const [familyName, setFamilyName] = React.useState('');

  const handleCreateFamily = async (event) => {
      event.preventDefault();
      alert(`TODO: Implement API Call to create family named: ${familyName}`);
      // --- Add API call logic here ---
      // try {
      //   const response = await axiosInstance.post('/api/users/families/', { name: familyName });
      //   // On success, maybe refetch user data or update context?
      //   // auth.fetchUserDetails(); // Need to expose this from context if used
      // } catch (error) {
      //   console.error("Failed to create family", error);
      //   // Show error to user
      // }
      // --- End API call logic ---
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
            placeholder="e.g., The Simpsons"
            required
          />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Create Family</button>
      </form>
      <p><small>(Functionality to call the backend API is still needed)</small></p>
    </div>
  );
};


// --- Main HomePage Component ---
function HomePage() {
  // 1. Get all relevant state directly from the updated AuthContext
  const { isAuthenticated, user, familyId, userRole, isLoading } = useAuth();

  // 2. Handle the initial loading state provided by AuthContext
  // This covers the time during initial token refresh and user data fetch
  if (isLoading) {
    return (
      <div>
        <h2>Home Page</h2>
        <p>Loading application data...</p> {/* Or use a spinner component */}
      </div>
    );
  }

  // 3. Handle the case where the user is definitively not authenticated
  if (!isAuthenticated) {
    return (
      <div>
        <h2>Home Page</h2>
        <p>
          Welcome to Family Hub! Please <Link to="/login">log in</Link> or <Link to="/register">register</Link> to continue.
        </p>
      </div>
    );
  }

  // 4. Handle the authenticated state
  // We expect 'user' to exist if isAuthenticated is true, but add a fallback.
  if (!user) {
     console.warn("HomePage: Authenticated is true, but user data is missing. Loading...");
     return (
       <div>
          <h2>Home Page</h2>
          <p>Loading user information...</p>
          {/* Might indicate an unexpected state, could add error display */}
       </div>
     );
  }

  // --- User is Authenticated and user data is available ---
  return (
    <div>
      <h2>Home Page</h2>
      <div>
        {/* Display basic welcome and user info */}
        <h3>Welcome back, {user.first_name || user.username}!</h3>
        <p>Username: {user.username} | Email: {user.email}</p>
        <p>Joined: {new Date(user.date_joined).toLocaleDateString()}</p>

        <hr style={{ margin: '20px 0' }}/>

        {/* --- Conditional Section Based on Family Membership --- */}
        {familyId ? (
          // --- Scenario 1: User IS in a family ---
          <div>
            <h4>Your Family Hub (ID: {familyId})</h4>
            <p>Your Role: <strong>{userRole}</strong></p>

            <h5>Quick Access:</h5>
            <ul>
              {/* Replace with actual Links to components/routes */}
              <li><Link to="/documents">Manage Documents</Link> (WIP)</li>
              <li><Link to="/investments">Track Investments</Link> (WIP)</li>
              <li><Link to="/photos">View Photos</Link> (WIP)</li>
              <li><Link to="/members">View Family Members</Link> (WIP)</li>
            </ul>

            {/* --- Admin Specific Controls Placeholder --- */}
            {userRole === 'admin' && (
              <div style={{ border: '1px solid darkgreen', padding: '10px', marginTop: '10px', backgroundColor: '#e9f5e9' }}>
                <h5>Admin Controls</h5>
                <p>(Placeholders - links/buttons will need functionality)</p>
                <button onClick={() => alert('TODO: Navigate to Add Member UI')}>Add Member</button>
                <span style={{ marginLeft: '10px' }}></span>
                <button onClick={() => alert('TODO: Navigate to Remove Member UI')}>Remove Member</button>
              </div>
            )}
          </div>
        ) : (
          // --- Scenario 2: User IS NOT in a family ---
          <CreateFamilyComponent /> // Render the placeholder component/form
        )}
        {/* --- End Conditional Section --- */}

      </div>
      {/* Logout button is likely in a shared Nav component, not typically here */}
    </div>
  );
}

export default HomePage;