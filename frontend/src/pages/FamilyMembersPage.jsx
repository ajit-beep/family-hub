// frontend/src/pages/FamilyMembersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; // To check authentication
import axiosInstance from '../api/axiosInstance'; // To make API calls
import { Link, useNavigate } /* or useNavigate */ from 'react-router-dom'; // For navigation/links

function FamilyMembersPage() {
  const { isAuthenticated, authLoading, user, userRole } = useAuth(); // Get auth state
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true); // Local loading state for the fetch
  const [error, setError] = useState(null);

  // State for the Add Member form
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  // State for Remove Member action
  const [removeError, setRemoveError] = useState(null);
  const [removingId, setRemovingId] = useState(null); // Track which user is being removed

  const navigate = useNavigate();

  // --- Encapsulate fetching logic ---
  const fetchMembers = useCallback(async () => {
    // Only fetch if authenticated
    if (!isAuthenticated) return;

    console.log("Fetching family members...");
    setLoading(true); // Use main loading indicator for fetch
    setError(null);
    setAddError(null); // Clear action errors on refetch
    setRemoveError(null);

    try {
      const response = await axiosInstance.get('/api/users/families/members/');
      console.log("Members fetched:", response.data);
      setMembers(response.data);
    } catch (err) {
      console.error("Error fetching family members:", err.response?.data || err.message);
      setError("Could not load family members. Please try again later.");
      setMembers([]); // Clear members on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]); // Dependency: refetch if auth state changes

  useEffect(() => {
    if (!authLoading) { // Only run after initial auth check is complete
        fetchMembers();
    }
  }, [authLoading, fetchMembers]); // Rerun effect if auth state changes

  // --- Handler for Adding Member ---
  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!usernameToAdd) return;

    setAddLoading(true);
    setAddError(null);
    setRemoveError(null); // Clear other errors

    try {
      // Use the correct endpoint: /api/users/families/add-member/
      const response = await axiosInstance.post('/api/users/families/add-member/', { username: usernameToAdd });
      console.log("Add member response:", response.data);
      setUsernameToAdd(''); // Clear input on success
      await fetchMembers(); // Refetch the list to show the new member
    } catch (err) {
      console.error("Error adding member:", err.response?.data || err.message);
      setAddError(err.response?.data?.detail || "Failed to add user. Check username and ensure they aren't already in a family.");
    } finally {
      setAddLoading(false);
    }
  };

  // --- Handler for Removing Member ---
  const handleRemoveMember = async (memberToRemoveId, memberToRemoveUsername) => {
    // Confirmation dialog
   if (!window.confirm(`Are you sure you want to remove ${memberToRemoveUsername} from the family?`)) {
       return;
   }

   setRemovingId(memberToRemoveId); // Indicate which user is being removed (for UI feedback)
   setRemoveError(null);
   setAddError(null); // Clear other errors

   try {
       // Use the correct endpoint: /api/users/families/members/<user_id>/
       await axiosInstance.delete(`/api/users/families/members/${memberToRemoveId}/`);
       console.log(`User ${memberToRemoveId} removed successfully.`);
       await fetchMembers(); // Refetch the list to reflect removal
   } catch (err) {
       console.error(`Error removing member ${memberToRemoveId}:`, err.response?.data || err.message);
       setRemoveError(err.response?.data?.detail || `Failed to remove ${memberToRemoveUsername}.`);
   } finally {
       setRemovingId(null); // Clear removing indicator
   }
 };

  // Handle initial AuthContext loading state
  if (authLoading) {
    return <p>Loading application...</p>;
  }

  // Handle user not being authenticated (might be redundant if routes are protected)
  if (!isAuthenticated) {
     return (
       <div>
           <h2>Family Members</h2>
           <p>Please <Link to="/login">log in</Link> to view family members.</p>
       </div>
     );
  }

  // Handle local data fetching loading state
  if (loading) {
    return (
        <div>
            <h2>Family Members</h2>
            <p>Loading members...</p>
        </div>
    );
  }

  // Handle data fetching error state
  if (error) {
     return (
        <div>
            <h2>Family Members</h2>
            <p style={{ color: 'red' }}>{error}</p>
        </div>
     );
  }

  // --- Render the list of members ---
  // --- Main Content ---
  return (
    <div>
      <h2>Family Members</h2>

      {/* --- Add Member Form (Admin Only) --- */}
      {userRole === 'admin' && (
        <div style={{ border: '1px solid blue', padding: '15px', marginBottom: '20px', backgroundColor: '#e7f3ff' }}>
          <h4>Add Member</h4>
          <form onSubmit={handleAddMember}>
            <label htmlFor="usernameToAdd">Username to Add: </label>
            <input
              type="text"
              id="usernameToAdd"
              value={usernameToAdd}
              onChange={(e) => setUsernameToAdd(e.target.value)}
              placeholder="Enter username"
              required
              disabled={addLoading}
              style={{ marginRight: '10px' }}
            />
            <button type="submit" disabled={addLoading}>
              {addLoading ? 'Adding...' : 'Add Member'}
            </button>
            {addError && <p style={{ color: 'red', marginTop: '5px' }}>{addError}</p>}
          </form>
        </div>
      )}

      {/* --- Member List --- */}
      {members.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {members.map(member => (
            <li key={member.id} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div>
                <strong>Username:</strong> {member.username} {user?.id === member.id && '(You)'}
                {userRole === 'admin' && user?.id === member.id && <i> (Admin)</i>}
                {userRole !== 'admin' && member.profile?.role === 'admin' && <i> (Admin)</i>} {/* Basic role display */}
              </div>
              <div><strong>Name:</strong> {member.first_name || '-'} {member.last_name || '-'}</div>
              <div><strong>Email:</strong> {member.email}</div>
              <div><strong>Joined App:</strong> {new Date(member.date_joined).toLocaleDateString()}</div>

              {/* --- Remove Member Button (Admin Only, Not for Self) --- */}
              {userRole === 'admin' && user?.id !== member.id && (
                <button
                  onClick={() => handleRemoveMember(member.id, member.username)}
                  disabled={removingId === member.id} // Disable button while this member is being removed
                  style={{ marginTop: '5px', color: 'red', cursor: 'pointer' }}
                >
                  {removingId === member.id ? 'Removing...' : 'Remove from Family'}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Your family currently has no members listed (besides potentially yourself, if the list is empty).</p>
      )}
      {removeError && <p style={{ color: 'red', marginTop: '10px' }}>{removeError}</p>}
    </div>
  );
}

export default FamilyMembersPage;