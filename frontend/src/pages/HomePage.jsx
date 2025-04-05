// frontend/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import axiosInstance from '../api/axiosInstance'; // Import configured Axios
import { Link } from 'react-router-dom';

function HomePage() {
  const { isAuthenticated, accessToken } = useAuth(); // Get auth state and token
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch data if the user is authenticated (accessToken exists)
    if (isAuthenticated && accessToken) {
      console.log("HomePage: User is authenticated, attempting to fetch /api/users/me/");
      setLoading(true);
      setError(null);

      const fetchUserData = async () => {
        try {
          // Make the GET request using axiosInstance
          // The interceptor should automatically add the Authorization header
          const response = await axiosInstance.get('/api/users/me/');
          setUserData(response.data);
          console.log("User data fetched:", response.data);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Could not fetch user data. Please try logging in again.");
          // Handle potential token expiry / refresh logic here later
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    } else {
      console.log("HomePage: User is not authenticated.");
      // Ensure userData is null if not authenticated
      setUserData(null);
    }
  // Rerun effect if isAuthenticated or accessToken changes
  }, [isAuthenticated, accessToken]);

  return (
    <div>
      <h2>Home Page</h2>
      {loading && <p>Loading user data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!isAuthenticated && (
        // --- Update this paragraph ---
        <p>
            Please <Link to="/login">log in</Link> to see your details.
        </p>
        // ---------------------------
      )}

      {isAuthenticated && userData && (
        <div>
          <h3>Welcome, {userData.username}!</h3>
          <p>Email: {userData.email}</p>
          <p>First Name: {userData.first_name || 'N/A'}</p>
          <p>Last Name: {userData.last_name || 'N/A'}</p>
          <p>User ID: {userData.id}</p>
          <p>Joined: {new Date(userData.date_joined).toLocaleDateString()}</p>
        </div>
      )}
       {/* Logout button is handled by the Nav in App.jsx now */}
    </div>
  );
}

export default HomePage;