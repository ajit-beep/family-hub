// frontend/src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
// Optional: import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* The Outlet renders the matched child route's element */}
        <Outlet />
      </main>
      {/* Optional Footer
      <Footer />
      */}
    </div>
  );
};

export default MainLayout;