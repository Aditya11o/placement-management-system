import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Search, LayoutDashboard, User, Briefcase, Users, Settings,
    ShieldCheck, Calendar, Send, Moon, Sun, 
    Loader2, ArrowRight, Zap, Sparkles, BookOpen, MessageCircle, FileText,
    TrendingUp, FileCheck, Activity, Shield, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface CommandItem {
    id: string;
    label: string;
    icon: React.ElementType;
    action: () => void;
    category: 'Navigation' | 'Actions' | 'Theme';
    roles?: string[];
}

const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const { user } = useAuth();
    const { setTheme } = useTheme();

    // Debounced Search Logic
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await api.get(`/search?q=${searchQuery}`);
                if (res.data.success) {
                    setSearchResults(res.data.data);
                }
            } catch (err) {
                console.error('Search failed', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Toggle palette via keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }

            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    // Handle close on outside click
    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

    // Close palette wrapper
    const closePalette = () => setIsOpen(false);

    // Static Commands
    const staticCommands: CommandItem[] = [
        // Navigation - Admin
        { id: 'nav-admin-dashboard', label: 'Go to Admin Dashboard', icon: LayoutDashboard, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/dashboard'); closePalette(); } },
        { id: 'nav-admin-students', label: 'Manage Students', icon: Users, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/students'); closePalette(); } },
        { id: 'nav-admin-recruiters', label: 'Manage Recruiters', icon: Briefcase, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/recruiters'); closePalette(); } },
        { id: 'nav-admin-analytics', label: 'Advanced Analytics', icon: TrendingUp, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/analytics-deep-dive'); closePalette(); } },
        { id: 'nav-admin-approvals', label: 'Approval Center', icon: ShieldCheck, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/approvals'); closePalette(); } },
        { id: 'nav-admin-calendar', label: 'Unified Calendar', icon: Calendar, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/calendar'); closePalette(); } },
        { id: 'nav-admin-communication', label: 'Communication Center', icon: Send, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/communication'); closePalette(); } },
        { id: 'nav-admin-docs', label: 'Document Verification', icon: FileCheck, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/doc-verification'); closePalette(); } },
        { id: 'nav-admin-audit', label: 'Audit Logs', icon: Activity, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/audit-logs'); closePalette(); } },
        { id: 'nav-admin-rbac', label: 'RBAC Management', icon: Shield, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/rbac'); closePalette(); } },
        { id: 'nav-admin-health', label: 'System Health', icon: Activity, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/system-health'); closePalette(); } },
        { id: 'nav-admin-sessions', label: 'Active Sessions', icon: ShieldAlert, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/sessions'); closePalette(); } },
        { id: 'nav-admin-settings', label: 'System Settings', icon: Settings, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/settings'); closePalette(); } },

        // Navigation - Recruiter
        { id: 'nav-rec-dashboard', label: 'Go to Recruiter Dashboard', icon: LayoutDashboard, category: 'Navigation', roles: ['RECRUITER'], action: () => { navigate('/recruiter/dashboard'); closePalette(); } },
        { id: 'nav-rec-profile', label: 'Company Profile', icon: User, category: 'Navigation', roles: ['RECRUITER'], action: () => { navigate('/recruiter/profile'); closePalette(); } },
        { id: 'nav-rec-jobs', label: 'Manage Jobs', icon: Briefcase, category: 'Navigation', roles: ['RECRUITER'], action: () => { navigate('/recruiter/jobs'); closePalette(); } },
        { id: 'nav-rec-applicants', label: 'Review Applicants', icon: Users, category: 'Navigation', roles: ['RECRUITER'], action: () => { navigate('/recruiter/applicants'); closePalette(); } },

        // Navigation - Student
        { id: 'nav-stu-dashboard', label: 'Go to Student Dashboard', icon: LayoutDashboard, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/dashboard'); closePalette(); } },
        { id: 'nav-stu-profile', label: 'My Profile', icon: User, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/profile'); closePalette(); } },
        { id: 'nav-stu-resumes', label: 'My Resumes', icon: FileText, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/resumes'); closePalette(); } },
        { id: 'nav-stu-jobs', label: 'Job Board', icon: Briefcase, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/jobs'); closePalette(); } },
        { id: 'nav-stu-insights', label: 'Peer Insights', icon: Sparkles, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/peer-insights'); closePalette(); } },
        { id: 'nav-stu-prepkits', label: 'Interview Prep Kits', icon: BookOpen, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/prep-kits'); closePalette(); } },
        { id: 'nav-stu-messages', label: 'Message Center', icon: MessageCircle, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/messages'); closePalette(); } },

        // Actions
        { id: 'action-logout', label: 'Sign Out', icon: User, category: 'Actions', action: () => { closePalette(); window.location.href = '/login'; } },

        // Theme
        { id: 'theme-light', label: 'Switch to Light Theme', icon: Sun, category: 'Theme', action: () => { setTheme('light'); closePalette(); } },
        { id: 'theme-dark', label: 'Switch to Dark Theme', icon: Moon, category: 'Theme', action: () => { setTheme('dark'); closePalette(); } },
    ];

    // Filtered static commands
    const filteredStatic = staticCommands.filter(command => {
        if (command.roles && user?.role && !command.roles.includes(user.role)) return false;
        if (searchQuery && !command.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Map Search Results to Command Items
    const dynamicCommands: CommandItem[] = searchResults.map(res => {
        const pathMap: Record<string, string> = {
            student: '/admin/students',
            recruiter: '/admin/recruiters',
            job: '/admin/jobs'
        };
        return {
            id: `dynamic-${res.type}-${res.id}`,
            label: res.label,
            icon: res.type === 'student' ? User : res.type === 'recruiter' ? Briefcase : Search,
            category: 'Actions', // Keep it simple for search results
            action: () => {
                navigate(`${pathMap[res.type]}?id=${res.id}`);
                closePalette();
            }
        };
    });

    // Combine all
    const allFiltered = [...filteredStatic, ...dynamicCommands];

    // Grouping
    const grouped = allFiltered.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    const flattenedList = Object.values(grouped).flat();

    const handleListKeyDown = (e: React.KeyboardEvent) => {
        if (flattenedList.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % flattenedList.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + flattenedList.length) % flattenedList.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            flattenedList[selectedIndex].action();
        }
    };

    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.querySelector('[data-selected="true"]') as HTMLElement;
            if (selectedElement) selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex, searchQuery, searchResults]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-start justify-center pt-[15vh] p-4"
                    onClick={handleOutsideClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl w-full max-w-2xl rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800 overflow-hidden flex flex-col ring-1 ring-black/5"
                    >
                        <div className="flex items-center px-5 border-b border-slate-200/50 dark:border-slate-800/50">
                            <Search className={`w-5 h-5 transition-colors ${isSearching ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search students, companies, jobs or commands..."
                                className="flex-1 h-16 px-4 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-lg font-medium"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                onKeyDown={handleListKeyDown}
                            />
                            {isSearching && <Loader2 className="w-4 h-4 text-slate-400 animate-spin mr-3" />}
                            <kbd className="hidden sm:inline-flex h-7 items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 font-mono text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span className="text-xs">ESC</span>
                            </kbd>
                        </div>

                        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-3 scrollbar-hide">
                            {flattenedList.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                                        <Search size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No matches found for "{searchQuery}"</p>
                                    <p className="text-xs text-slate-400 mt-1">Try searching for a name, email or company.</p>
                                </div>
                            ) : (
                                Object.entries(grouped).map(([category, items], gIdx) => {
                                    let offset = 0;
                                    const cats = Object.keys(grouped);
                                    for (let i = 0; i < gIdx; i++) offset += grouped[cats[i]].length;

                                    return (
                                        <div key={category} className="mb-4 last:mb-0">
                                            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">
                                                {category}
                                            </div>
                                            <div className="space-y-1">
                                                {items.map((cmd, iIdx) => {
                                                    const gIndex = offset + iIdx;
                                                    const isSelected = selectedIndex === gIndex;
                                                    const resultData = searchResults.find(r => `dynamic-${r.type}-${r.id}` === cmd.id);

                                                    return (
                                                        <button
                                                            key={cmd.id}
                                                            data-selected={isSelected}
                                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm transition-all text-left group
                                                                ${isSelected
                                                                    ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white translate-x-1'
                                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                                                }`}
                                                            onClick={() => cmd.action()}
                                                            onMouseEnter={() => setSelectedIndex(gIndex)}
                                                        >
                                                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors
                                                                ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
                                                            `}>
                                                                <cmd.icon size={18} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold truncate">{cmd.label}</div>
                                                                {resultData?.sublabel && (
                                                                    <div className={`text-xs truncate transition-colors ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                                        {resultData.sublabel}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isSelected && <ArrowRight size={16} className="opacity-70" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="px-5 py-3 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500">↑↓</kbd> Navigate</span>
                                <span className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500">↵</kbd> Select</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black italic text-indigo-500 uppercase tracking-tighter">
                                Spotlight Search <Zap size={10} className="fill-current" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
