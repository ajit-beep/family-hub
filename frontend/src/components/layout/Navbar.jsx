// frontend/src/components/layout/Navbar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button'; // Our new Button component
// Consider an icon for FamilyHub later, e.g., from heroicons
// import { HomeIcon } from '@heroicons/react/24/solid'; // Example

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-[var(--border-radius-button)] text-sm font-medium transition-colors
     ${isActive
       ? 'bg-[var(--color-brand-primary)] text-white'
       : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-neutral-900)]'
     }`;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-[var(--color-brand-primary)]">
              {/* <HomeIcon className="h-7 w-7" /> Optional Icon */}
              <span>FamilyHub</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/documents" className={navLinkClass}>
                  Documents
                </NavLink>
                <NavLink to="/members" className={navLinkClass}>
                  Family
                </NavLink>
                {/* Add more links as needed */}
              </>
            )}
          </div>

          {/* Auth Actions / User Info */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-[var(--color-neutral-600)] text-sm hidden sm:block">
                  Hi, {user?.first_name || user?.username}!
                </span>
                <Button onClick={logout} variant="outline_neutral" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login">
                  <Button variant="outline_primary" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button (Placeholder for future implementation) */}
          {/* <div className="-mr-2 flex md:hidden">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="sr-only">Open main menu</span>
              { // TODO: Add menu open/close icons }
            </button>
          </div> */}
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state (Placeholder) */}
      {/* <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLink to="/" className={navLinkClassMobile} end>Home</NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/documents" className={navLinkClassMobile}>Documents</NavLink>
              <NavLink to="/members" className={navLinkClassMobile}>Family</NavLink>
            </>
          )}
        </div>
      </div> */}
    </nav>
  );
};

// const navLinkClassMobile = ({ isActive }) => ... // Define if implementing mobile menu

export default Navbar;