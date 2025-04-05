// frontend/src/components/LoginForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

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
      const response = await axios.post('http://localhost:8000/api/token/', payload);

      // Handle success (for now, just log tokens)
      console.log('Login successful:', response.data);
      const { access, refresh } = response.data;
      console.log('Access Token:', access);
      console.log('Refresh Token:', refresh);

      // TODO: Store tokens (e.g., localStorage)
      // TODO: Update application auth state (e.g., using Context)
      // TODO: Redirect user (e.g., to homepage)

      alert('Login Successful! Tokens logged to console.'); // Temporary feedback

    } catch (err) {
      // Handle errors
      console.error('Login error:', err);
      if (err.response && err.response.data) {
         // Often login errors return { "detail": "Error message" }
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