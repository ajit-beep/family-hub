// frontend/src/components/LoginForm.jsx
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // <-- Import the configured instance
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button'; // Use our styled Button
import Input from './ui/Input';   // Use our styled Input
import Card, { CardHeader, CardContent, CardFooter } from './ui/Card'; // Use Card components

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // For login button loading state

  const { login } = useAuth(); // Get login function from context
  const navigate = useNavigate(); // Get navigate function from react-router

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true);

    try {
      // Make POST request to the backend token endpoint
      // Ensure this URL matches your backend setup
      await login(username, password); // Use the modified login function
      navigate('/'); // Redirect only on success

    } catch (err) {
      // Handle errors
      console.error('Login error:', err);
      let displayError = "Login failed. Please check your credentials or try again later.";
      if (err.response && err.response.data) {
         const errorMessage = err.response.data.detail || 'Invalid credentials or server error.';
         displayError = `Login failed: ${err.response.data.detail}`;
         setError(`Login failed: ${errorMessage}`);
      } else if (err.request) {
        setError('Login failed: No response from server.');
        displayError = `Login failed: ${err.message}`;
      } else {
        setError(`Login failed: ${err.message}`);
        displayError = `Login failed: ${err.message}`;
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <Card className="max-w-md mx-auto"> {/* Center the card and limit width */}
      <CardHeader>
        <h2 className="text-2xl font-bold text-center text-[var(--color-neutral-800)]">
          Welcome Back!
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display the error message if it exists */}
          {error && (
            <div className="p-3 my-2 text-sm text-[var(--color-danger-dark)] bg-[var(--color-danger-light)]/30 rounded-[var(--border-radius-input)]" role="alert">
              {error}
            </div>
          )}
          <Input
            label="Username"
            type="text"
            id="login-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            disabled={isLoading}
          />
          <Input
            label="Password"
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-sm text-[var(--color-neutral-600)]">
          Don't have an account?{' '}
          <a href="/register" className="font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-dark)]">
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}

export default LoginForm;