// frontend/src/components/RegisterForm.jsx
import React, { useState } from 'react';
import axios from 'axios'; 

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // placeholder for form submission logic
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setError(null); // Reset error state
        setSuccess(null); // Reset success state

        // FrontEnd check: Ensure passwords match
        if (password !== password2) {
            setError("Passwords do not match.");
            return;
        }

        // Prepare data payload for registration
        // Exclude password2 from the payload
        const payload = {
            username,
            email,
            password,
            first_name: firstName,
            last_name: lastName,
        };

        console.log('Submitting registration data:', payload);
        try {
            // Make the POST request to the backend API
            const response = await axios.post('http://localhost:8000/api/users/register/', payload);

            // Handle success
            console.log('Registration successful:', response.data);
            setSuccess('Registration successful! You can now log in.');
            // Optionally clear the form:
            // setUsername(''); setEmail(''); setPassword(''); setPassword2(''); setFirstName(''); setLastName('');

            // TODO: Redirect to login page or show success message permanently
        } catch (err) {
            // Handle errors
            console.error('Registration error:', err);
            if (err.response && err.response.data) {
              // Try to display backend validation errors
              // DRF errors often come as { field_name: ["error message"] }
              const errorData = err.response.data;
              let errorMessages = [];
              for (const key in errorData) {
                // Handle potential non-field errors (like detail) or field errors
                 if (Array.isArray(errorData[key])) {
                   errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
                 } else {
                   errorMessages.push(`${key}: ${errorData[key]}`);
                 }
              }
              setError(`Registration failed: ${errorMessages.join('; ')}`);
            } else if (err.request) {
              // The request was made but no response was received
              setError('Registration failed: No response from server. Is the backend running?');
              console.error('Error request:', err.request);
            } else {
              // Something happened in setting up the request that triggered an Error
              setError(`Registration failed: ${err.message}`);
              console.error('Error message:', err.message);
            }
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            {success && <div style={{ color: 'green' }}>{success}</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div>
                <label htmlFor="reg-username">Username:</label>
                <input
                    type="text"
                    id="reg-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="reg-email">Email:</label>
                <input
                    type="email"
                    id="reg-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="reg-firstname">First Name:</label>
                <input
                    type="text"
                    id="reg-firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="reg-lastname">Last Name:</label>
                <input
                    type="text"
                    id="reg-lastname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="reg-password">Password:</label>
                <input
                    type="password"
                    id="reg-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="reg-password2">Confirm Password:</label>
                <input
                    type="password"
                    id="reg-password2"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                />
            </div>
            {/* Add inputs for first/last name if needed */}
            <button type="submit">Register</button>
        </form>
    );
}

export default RegisterForm;
