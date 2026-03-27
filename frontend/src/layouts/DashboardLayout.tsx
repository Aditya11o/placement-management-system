import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import HelpSupportPanel from '../components/HelpSupportPanel';
import type { User } from '../types';

interface DashboardLayoutProps {
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const userInfo: User | null = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !userInfo || userInfo.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)] flex overflow-hidden relative">
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        isCollapsed={isSidebarCollapsed}
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`flex-1 flex flex-col min-w-0 ${
        isSidebarCollapsed ? 'md:ml-20' : 'lg:ml-64 md:ml-20 ml-0'
      } overflow-hidden h-screen transition-all duration-300`}>
        <Navbar 
          role={role} 
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setSidebarOpen(!isSidebarOpen);
            } else {
              setSidebarCollapsed(!isSidebarCollapsed);
            }
          }} 
          onHelpOpen={() => setHelpOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto pt-0 custom-scrollbar">
          <div className="pt-4 md:pt-5 lg:pt-6 pb-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <HelpSupportPanel isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
