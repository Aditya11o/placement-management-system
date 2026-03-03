import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Menu, X, LayoutDashboard, User, Briefcase,
    FileText, Users, Settings, LogOut, Bell, Building
} from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // Define navigation configuration based on role
    const getNavItems = () => {
        switch (user?.role) {
            case 'STUDENT':
                return [
                    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
                    { label: 'My Profile', path: '/student/profile', icon: User },
                    { label: 'Resumes', path: '/student/resumes', icon: FileText },
                    { label: 'Job Board', path: '/student/jobs', icon: Briefcase },
                    { label: 'Applications', path: '/student/applications', icon: FileText },
                ];
            case 'RECRUITER':
                return [
                    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
                    { label: 'Company Profile', path: '/recruiter/profile', icon: Building },
                    { label: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase },
                    { label: 'Review Applicants', path: '/recruiter/applicants', icon: Users },
                ];
            case 'ADMIN':
            case 'SUPER_ADMIN':
                return [
                    { label: 'Analytics Console', path: '/admin/dashboard', icon: LayoutDashboard },
                    { label: 'Manage Students', path: '/admin/students', icon: Users },
                    { label: 'Manage Recruiters', path: '/admin/recruiters', icon: Briefcase },
                    { label: 'System Settings', path: '/admin/settings', icon: Settings },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="layout-wrapper">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            )}

            {/* Sidebar */}
            <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Nexus</h2>
                    <button className="mobile-close" onClick={toggleSidebar}><X size={20} /></button>
                </div>

                <div className="user-summary">
                    <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
                    <div className="user-details">
                        <span className="user-name">{user?.name || 'User'}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {navItems.map((item, idx) => (
                            <li key={idx}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-link logout-btn" onClick={logout}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {/* Top Header */}
                <header className="top-header glass-panel">
                    <div className="header-left">
                        <button className="menu-toggle" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        <h1 className="page-title">Placement Management System</h1>
                    </div>

                    <div className="header-right">
                        <button className="icon-btn">
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                {/* Dynamic Route Content */}
                <div className="content-container">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default MainLayout;
