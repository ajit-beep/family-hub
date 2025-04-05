// frontend/src/components/LoginForm.jsx
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // <-- Import the configured instance
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { login } = useAuth(); // Get login function from context
  const navigate = useNavigate(); // Get navigate function from react-router

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    const payload = {
      username: username,
      password: password,
    };

    console.log('Attempting login with:', payload);

    try {
      // Make POST request to the backend token endpoint
      // Ensure this URL matches your backend setup
      const response = await axiosInstance.post('/api/token/', payload);

      // Call context login function with ONLY the access token
      login(response.data.access); // Pass only access token

      navigate('/'); // Redirect to homepage

    } catch (err) {
      // Handle errors
      console.error('Login error:', err);
      if (err.response && err.response.data) {
         const errorMessage = err.response.data.detail || 'Invalid credentials or server error.';
         setError(`Login failed: ${errorMessage}`);
      } else if (err.request) {
        setError('Login failed: No response from server.');
      } else {
        setError(`Login failed: ${err.message}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label htmlFor="login-username">Username:</label>
        <input
          type="text"
          id="login-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="login-password">Password:</label>
        <input
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;