import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import type { User } from '../types';

interface DashboardLayoutProps {
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const userInfo: User | null = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !userInfo || userInfo.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)] flex overflow-hidden relative">
      <Sidebar role={role} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 md:ml-64 overflow-hidden h-screen transition-all duration-300">
        <Navbar role={role} onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto pt-16 custom-scrollbar">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
