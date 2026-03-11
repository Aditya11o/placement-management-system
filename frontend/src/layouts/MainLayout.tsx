import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
    Menu, X, LayoutDashboard, User, Briefcase,
    FileText, Users, Settings, LogOut, Building, LucideIcon, ShieldCheck, Send, Search,
    Shield, FileCheck, Activity, Calendar, TrendingUp, Globe
} from 'lucide-react';
import NotificationPanel from '../components/NotificationPanel/NotificationPanel';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import CommandPalette from '../components/CommandPalette/CommandPalette';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import PresenceAvatars from '../components/PresenceAvatars/PresenceAvatars';

interface NavItem {
    label: string;
    path: string;
    icon: LucideIcon;
}

const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();
    const { logoUrl } = useTheme();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // ── Global Keyboard Shortcuts ───────────────────────────────────────────
    // Prevent default browser behavior for shortcuts mapping to navigation
    // react-hotkeys-hook automatically ignores keypresses inside inputs/textareas

    // Toggle Help Modal
    useHotkeys(['?', 'shift+?'], () => setIsShortcutsModalOpen(prev => !prev), { preventDefault: true });

    // Admin Navigation Sequences (Pro-mode)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    useHotkeys('g d', () => isAdmin && navigate('/admin/dashboard'), { preventDefault: true, enabled: isAdmin });
    useHotkeys('g a', () => isAdmin && navigate('/admin/approvals'), { preventDefault: true, enabled: isAdmin });
    useHotkeys('g s', () => isAdmin && navigate('/admin/students'), { preventDefault: true, enabled: isAdmin });
    useHotkeys('g r', () => isAdmin && navigate('/admin/recruiters'), { preventDefault: true, enabled: isAdmin });
    useHotkeys('g j', () => isAdmin && navigate('/admin/jobs'), { preventDefault: true, enabled: isAdmin });

    const handleLogout = () => {
        // IMPORTANT: Clear all React Query cache FIRST to stop all active queries,
        // then call logout to clear auth state. This prevents the infinite refetch
        // loop where queries fire with no token after the user navigates away.
        queryClient.clear();
        logout();
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // Define navigation configuration based on role
    const getNavItems = (): NavItem[] => {
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
                    { label: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
                    { label: 'Candidate Database', path: '/recruiter/database', icon: Globe },
                    { label: 'Recruiting Team', path: '/recruiter/team', icon: Users },
                ];
            case 'ADMIN':
            case 'SUPER_ADMIN':
                return [
                    { label: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
                    { label: 'Analytics Deep Dive', path: '/admin/analytics-deep-dive', icon: TrendingUp },
                    { label: 'Approval Center', path: '/admin/approvals', icon: ShieldCheck },
                    { label: 'Manage Students', path: '/admin/students', icon: Users },
                    { label: 'Manage Recruiters', path: '/admin/recruiters', icon: Briefcase },
                    { label: 'Unified Calendar', path: '/admin/calendar', icon: Calendar },
                    { label: 'Communication Center', path: '/admin/communication', icon: Send },
                    { label: 'Roles & Permissions', path: '/admin/rbac', icon: Shield },
                    { label: 'Custom Reports', path: '/admin/report-builder', icon: FileText },
                    { label: 'Doc Verification', path: '/admin/doc-verification', icon: FileCheck },
                    { label: 'System Health', path: '/admin/system-health', icon: Activity },
                    { label: 'System Settings', path: '/admin/settings', icon: Settings },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:relative w-[260px] h-screen flex flex-col z-50 transition-transform duration-300 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700/50 shadow-xl lg:shadow-none lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-[70px] flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700/50 shrink-0">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Institution Logo" className="h-8 w-auto object-contain" />
                    ) : (
                        <h2 className="text-brand-600 dark:text-brand-400 m-0 text-2xl font-bold tracking-tight">Nexus</h2>
                    )}
                    <button className="lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200" onClick={toggleSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-4 px-5 py-4 mx-4 mt-6 mb-4 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shrink-0">
                    <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg border border-white/30 shrink-0">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="font-semibold truncate text-white">{user?.name || 'User'}</span>
                        <span className="text-xs uppercase opacity-80 mt-0.5 truncate text-brand-100">{user?.role}</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                    <ul className="space-y-1">
                        {navItems.map((item, idx) => (
                            <li key={idx}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-medium transition-all duration-200 ${isActive ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-brand-600 dark:hover:text-brand-400'}`
                                    }
                                    onClick={() => window.innerWidth <= 1024 && setSidebarOpen(false)}
                                >
                                    <item.icon size={18} className="shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 shrink-0">
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} className="shrink-0" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                {/* Top Header */}
                <header className="h-[70px] flex items-center justify-between px-6 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 z-30 shrink-0 shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2 -ml-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        <h1 className="font-semibold text-slate-800 dark:text-slate-100 text-lg sm:text-xl m-0 truncate hidden sm:block transition-colors">Placement Management System</h1>
                        <h1 className="font-semibold text-slate-800 dark:text-slate-100 text-lg m-0 truncate sm:hidden transition-colors">Nexus Portal</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Multiplayer Presence Avatars */}
                        {isAdmin && <PresenceAvatars />}

                        {/* Command Palette Shortcut Hint */}
                        <button
                            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-sm cursor-pointer"
                        >
                            <Search size={14} />
                            <span className="text-xs">Search...</span>
                            <kbd className="ml-2 text-[10px] font-mono bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">Ctrl+K</kbd>
                        </button>
                        <ThemeToggle />
                        <NotificationPanel />
                    </div>
                </header>

                {/* Dynamic Route Content with Ambient Background */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 mesh-bg transition-colors duration-300 relative">
                    {/* Animated Ambient Glows */}
                    <div className="mesh-glow" />
                    <div className="mesh-glow" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="relative z-10"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Global Command Palette (Ctrl+K / Cmd+K) */}
            <CommandPalette />

            {/* Keyboard Shortcuts Help Modal (Press ?) */}
            <KeyboardShortcutsModal
                isOpen={isShortcutsModalOpen}
                onClose={() => setIsShortcutsModalOpen(false)}
            />

        </div >
    );
};

export default MainLayout;
