// frontend/src/components/RegisterForm.jsx
import React, { useState } from 'react';
import axios from 'axios'; // Keep using plain axios for this one if not converted yet
import { Link } from 'react-router-dom'; // For login link
import Button from './ui/Button';
import Input from './ui/Input';
import Card, { CardHeader, CardContent, CardFooter } from './ui/Card';

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        if (password !== password2) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        const payload = {
            username, email, password, first_name: firstName, last_name: lastName,
        };

        try {
            // Using the environment variable for the API URL would be best practice here
            // For now, assuming VITE_API_URL is set or using localhost
            const apiUrl = import.meta.env.VITE_API_URL || 'https://familyhub-backend-prod-hucaffcwdzdparh9.centralus-01.azurewebsites.net/api';
            await axios.post(`${apiUrl.replace('/api', '')}/api/users/register/`, payload); // Ensure correct base
            setSuccess('Registration successful! You can now log in.');
            // Clear form fields:
            // setUsername(''); setEmail(''); setPassword(''); setPassword2(''); setFirstName(''); setLastName('');
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessages = [];
                for (const key in errorData) {
                    if (Array.isArray(errorData[key])) {
                        errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
                    } else {
                        errorMessages.push(`${key}: ${String(errorData[key])}`);
                    }
                }
                setError(`Registration failed: ${errorMessages.join('; ')}`);
            } else if (err.request) {
                setError('Registration failed: No response from server.');
            } else {
                setError(`Registration failed: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="max-w-md mx-auto text-center">
                <CardContent>
                    <div className="p-4">
                        <svg className="w-16 h-16 mx-auto text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 className="mt-2 text-xl font-semibold text-[var(--color-neutral-800)]">Registration Successful!</h3>
                        <p className="mt-2 text-[var(--color-neutral-600)]">{success}</p>
                        <Link to="/login" className="mt-6 inline-block">
                            <Button variant="primary">Proceed to Login</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <h2 className="text-2xl font-bold text-center text-[var(--color-neutral-800)]">
                    Create your Account
                </h2>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5"> {/* Slightly less space than login */}
                    {error && (
                        <div className="p-3 text-sm text-[var(--color-danger-dark)] bg-[var(--color-danger-light)]/30 rounded-[var(--border-radius-input)]">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="First Name" id="reg-firstname" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
                        <Input label="Last Name" id="reg-lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Input label="Username" id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading} />
                    <Input label="Email" type="email" id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                    <Input label="Password" type="password" id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                    <Input label="Confirm Password" type="password" id="reg-password2" value={password2} onChange={(e) => setPassword2(e.target.value)} required disabled={isLoading} />
                    
                    <Button type="submit" variant="primary" className="w-full" disabled={isLoading} size="lg">
                        {isLoading ? 'Registering...' : 'Create Account'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="text-center">
                <p className="text-sm text-[var(--color-neutral-600)]">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-dark)]">
                        Log in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}

export default RegisterForm;