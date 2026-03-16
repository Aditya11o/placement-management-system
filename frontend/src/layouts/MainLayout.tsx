import React, { useState, Suspense } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
    Menu, X, LayoutDashboard, User, Briefcase, MessageCircle,
    FileText, Users, Settings, LogOut, Building, LucideIcon, ShieldCheck, Send, Search,
    Shield, FileCheck, Activity, Calendar, TrendingUp, Globe, ChevronLeft, ChevronRight, Sparkles, BookOpen, ShieldAlert
} from 'lucide-react';
import Loader from '../components/Loader/Loader';
import NotificationPanel from '../components/NotificationPanel/NotificationPanel';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import CommandPalette from '../components/CommandPalette/CommandPalette';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import PresenceAvatars from '../components/PresenceAvatars/PresenceAvatars';
import OfflineStatus from '../components/Offline/OfflineStatus';
import PageTransition from '../components/Transitions/PageTransition';
import AIChatbot from '../components/AI/AIChatbot';

interface NavItem {
    label: string;
    path: string;
    icon: LucideIcon;
    category?: string;
}

const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();
    const { logoUrl } = useTheme();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved === 'true';
    });
    const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // ── Global Keyboard Shortcuts ───────────────────────────────────────────
    // Toggle Help Modal
    useHotkeys(['?', 'shift+?'], () => setIsShortcutsModalOpen(prev => !prev), { preventDefault: true });

    // Admin Navigation Sequences
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    useHotkeys('g d', () => isAdmin && navigate('/admin/dashboard'), { preventDefault: true, enabled: isAdmin });
    useHotkeys('g a', () => isAdmin && navigate('/admin/approvals'), { preventDefault: true, enabled: isAdmin });

    const handleLogout = () => {
        queryClient.clear();
        logout();
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    
    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebar_collapsed', String(next));
            return next;
        });
    };

    // Define navigation configuration based on role
    const getNavItems = (): NavItem[] => {
        switch (user?.role) {
            case 'STUDENT':
                return [
                    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
                    { label: 'Job Board', path: '/student/jobs', icon: Briefcase, category: 'Career' },
                    { label: 'Applications', path: '/student/applications', icon: FileText, category: 'Career' },
                    { label: 'Resumes', path: '/student/resumes', icon: FileText, category: 'Career' },
                    { label: 'Prep Kits', path: '/student/prep-kits', icon: BookOpen, category: 'Preparation' },
                    { label: 'Prep Rooms', path: '/student/prep-rooms', icon: Globe, category: 'Preparation' },
                    { label: 'Peer Insights', path: '/student/peer-insights', icon: Sparkles, category: 'Preparation' },
                    { label: 'Alumni Connect', path: '/student/alumni', icon: Users, category: 'Community' },
                    { label: 'Live Events', path: '/student/live-events', icon: Calendar, category: 'Community' },
                    { label: 'Messages', path: '/student/messages', icon: MessageCircle, category: 'Community' },
                    { label: 'My Profile', path: '/student/profile', icon: User, category: 'Settings' },
                ];
            case 'RECRUITER':
                return [
                    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
                    { label: 'Company Profile', path: '/recruiter/profile', icon: Building, category: 'Organization' },
                    { label: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase, category: 'Hiring' },
                    { label: 'Review Applicants', path: '/recruiter/applicants', icon: Users, category: 'Hiring' },
                    { label: 'Interviews', path: '/recruiter/interviews', icon: Calendar, category: 'Scheduling' },
                    { label: 'Candidate Database', path: '/recruiter/database', icon: Globe, category: 'Talent Pool' },
                    { label: 'Recruiting Team', path: '/recruiter/team', icon: Users, category: 'Organization' },
                ];
            case 'ADMIN':
            case 'SUPER_ADMIN':
                return [
                    { label: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
                    { label: 'Analytics', path: '/admin/analytics-deep-dive', icon: TrendingUp, category: 'Intelligence' },
                    { label: 'Approval Center', path: '/admin/approvals', icon: ShieldCheck, category: 'Operations' },
                    { label: 'Students', path: '/admin/students', icon: Users, category: 'Users' },
                    { label: 'Recruiters', path: '/admin/recruiters', icon: Briefcase, category: 'Users' },
                    { label: 'Unified Calendar', path: '/admin/calendar', icon: Calendar, category: 'Operations' },
                    { label: 'Communicator', path: '/admin/communication', icon: Send, category: 'Operations' },
                    { label: 'Doc Verification', path: '/admin/doc-verification', icon: FileCheck, category: 'Operations' },
                    { label: 'RBAC', path: '/admin/rbac', icon: Shield, category: 'System' },
                    { label: 'System Health', path: '/admin/system-health', icon: Activity, category: 'System' },
                    { label: 'Settings', path: '/admin/settings', icon: Settings, category: 'System' },
                    { label: 'Active Sessions', path: '/admin/sessions', icon: ShieldAlert, category: 'System' },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 z-[60] lg:hidden backdrop-blur-md"
                        onClick={toggleSidebar}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ 
                    width: isCollapsed ? 80 : 260,
                    x: (isSidebarOpen || window.innerWidth >= 1024) ? 0 : -320
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                role="navigation"
                aria-label="Main Navigation"
                className="fixed lg:relative h-screen flex flex-col z-[70] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-indigo-400/10 shadow-2xl lg:shadow-none"
            >
                <div className="h-[70px] flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700/50 shrink-0">
                    {!isCollapsed && (
                        logoUrl ? (
                            <img src={logoUrl} alt="Institution Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <h2 className="text-brand-600 dark:text-brand-400 m-0 text-2xl font-bold tracking-tight px-2">TNU</h2>
                        )
                    )}
                    <button 
                        className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors ml-auto" 
                        onClick={toggleCollapse}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                    <button 
                        className="lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200" 
                        onClick={toggleSidebar}
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={`flex items-center gap-4 px-4 py-4 mx-4 mt-8 mb-6 rounded-2xl bg-slate-900 border border-white/10 text-white shadow-2xl relative overflow-hidden group transition-all duration-300 hover:shadow-indigo-500/20 ${isCollapsed ? 'justify-center mx-2 px-0 mb-4' : ''}`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-400 to-indigo-600" />
                    
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-brand-600 flex items-center justify-center font-black text-xl border border-white/30 shrink-0 relative z-10 shadow-lg group-hover:rotate-6 transition-transform">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col truncate relative z-10 pt-0.5">
                            <span className="font-bold truncate text-white tracking-tight">{user?.name || 'User'}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16,185,129)]" />
                                <span className="text-[9px] font-black uppercase opacity-60 truncate text-emerald-400 tracking-widest">{user?.role}</span>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                    <ul className="space-y-6">
                        {/* Group items by category */}
                        {Object.entries(
                            navItems.reduce((acc, item) => {
                                const cat = item.category || 'General';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(item);
                                return acc;
                            }, {} as Record<string, NavItem[]>)
                        ).map(([category, items], catIdx) => (
                            <li key={catIdx} className="space-y-1">
                                {!isCollapsed && category !== 'General' && (
                                    <h3 className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                        {category}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {items.map((item, idx) => (
                                        <NavLink
                                            key={idx}
                                            to={item.path}
                                            title={isCollapsed ? item.label : undefined}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-[13px] uppercase tracking-wider transition-all duration-300 relative group overflow-hidden ${isActive ? 'bg-indigo-600 text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] scale-[1.02]' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'} ${isCollapsed ? 'justify-center' : ''}`
                                            }
                                            onClick={() => window.innerWidth <= 1024 && setSidebarOpen(false)}
                                        >
                                            <item.icon size={20} className="shrink-0" />
                                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                                        </NavLink>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 shrink-0">
                    <button
                        title={isCollapsed ? "Sign Out" : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 ${isCollapsed ? 'justify-center' : ''}`}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0" role="main">
                {/* Top Header */}
                {/* Header */}
                <header className="h-[70px] sticky top-0 z-[40] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            onClick={toggleSidebar}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-sm font-black uppercase tracking-widest text-slate-400 hidden sm:block">
                            {user?.role?.replace(/_/g, ' ')} Portal
                        </h1>
                        <h1 className="font-semibold text-slate-800 dark:text-slate-100 text-lg m-0 truncate sm:hidden transition-colors px-2">
                            {user?.role === 'STUDENT' ? 'Student' : (user?.role === 'RECRUITER' ? 'Recruiter' : 'Admin')} Portal
                        </h1>
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

                    <Suspense fallback={<Loader />}>
                        <AnimatePresence mode="wait">
                            <PageTransition key={location.pathname}>
                                <Outlet />
                            </PageTransition>
                        </AnimatePresence>
                    </Suspense>
                </div>
            </main>

            {/* Global Command Palette (Ctrl+K / Cmd+K) */}
            <CommandPalette />

            {/* Keyboard Shortcuts Help Modal (Press ?) */}
            <KeyboardShortcutsModal
                isOpen={isShortcutsModalOpen}
                onClose={() => setIsShortcutsModalOpen(false)}
            />

            <AIChatbot />
            <OfflineStatus />
        </div>
    );
};

export default MainLayout;
