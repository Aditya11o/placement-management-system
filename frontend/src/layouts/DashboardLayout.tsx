import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import type { User } from '../types';

interface DashboardLayoutProps {
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const userInfo: User | null = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !userInfo || userInfo.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)] flex overflow-hidden">
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-64 overflow-hidden h-screen">
        <Navbar role={role} />
        
        <main className="flex-1 overflow-y-auto pt-16 custom-scrollbar">
          <div className="p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
