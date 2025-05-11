// frontend/src/pages/RegisterPage.jsx
import React from 'react';
import RegisterForm from '../components/RegisterForm';

function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(space.16))] py-12">
         {/* Adjusted min-height if your navbar is sticky (h-16 or 4rem) */}
        <div className="w-full px-4">
             <RegisterForm />
        </div>
    </div>
  );
}

export default RegisterPage;