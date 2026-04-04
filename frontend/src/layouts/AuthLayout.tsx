import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface relative">
      <a href="#auth-content" className="skip-link">Skip to authentication</a>
      <main id="auth-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
