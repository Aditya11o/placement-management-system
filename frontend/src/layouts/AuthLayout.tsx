import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout: React.FC = () => {
  const { user } = useAuth();
  
  if (user && user.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

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
