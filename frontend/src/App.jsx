import React from 'react'; // Make sure React is imported if not already
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Or your main CSS file
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import FamilyMembersPage from './pages/FamilyMembersPage';
import { useAuth } from './context/AuthContext';


function App() {
  const { isAuthenticated, logout } = useAuth(); // <-- Get state and logout function

  return (
    <BrowserRouter>
      <h1>Family Hub</h1>

      {/* --- Basic Conditional Navigation --- */}
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {isAuthenticated ? (
            // If logged IN, show Logout button
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          ) : (
            // If logged OUT, show Login and Register links
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
      {/* --- End Navigation --- */}

      <hr /> {/* Separator */}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/members" element={<FamilyMembersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
