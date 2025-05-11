// frontend/src/pages/LoginPage.jsx
import React from 'react';
// We'll create LoginForm soon
import LoginForm from '../components/LoginForm';

function LoginPage() {
  return (
    // Centering the content on the page
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(space.16))] py-12">
      {/* 100vh - navbar height (h-16 = 4rem = theme(space.16)) */}
      <div className="w-full px-4"> {/* Allow responsive padding */}
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;