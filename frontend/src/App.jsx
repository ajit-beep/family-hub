// frontend/src/App.jsx
import React from 'react'; // Make sure React is imported if not already
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Layout
import MainLayout from './components/layout/MainLayout';

// Route Protectors
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import './index.css'; // Or your main CSS file

// Pages
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import FamilyMembersPage from './pages/FamilyMembersPage';
import DocumentManagementPage from './pages/DocumentManagementPage'; // Import your pages
import { useAuth } from './context/AuthContext';


function App() {
  const { isAuthenticated, logout } = useAuth(); // <-- Get state and logout function

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes accessible only to Authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}> {/* Nest pages that use the main layout */}
            <Route path="/" element={<HomePage />} />
            <Route path="/members" element={<FamilyMembersPage />} />
            <Route path="/documents" element={<DocumentManagementPage />} />
            {/* Add other protected pages here that use MainLayout */}
          </Route>
          {/* Add other protected pages here that might NOT use MainLayout (if any) */}
        </Route>

        {/* Routes accessible only to Unauthenticated users (e.g., Login, Register) */}
        <Route element={<PublicRoute />}>
          {/* These pages usually don't need the MainLayout with Navbar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Fallback for any other route or a 404 page */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
