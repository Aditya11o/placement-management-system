import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Search, LayoutDashboard, User, Briefcase, Users, Settings,
    ShieldCheck, Calendar, Send, Moon, Sun, Monitor, X
} from 'lucide-react';

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
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();

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

    // Define all available commands
    const allCommands: CommandItem[] = [
        // Navigation - Admin
        { id: 'nav-admin-dashboard', label: 'Go to Admin Dashboard', icon: LayoutDashboard, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/dashboard'); closePalette(); } },
        { id: 'nav-admin-students', label: 'Manage Students', icon: Users, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/students'); closePalette(); } },
        { id: 'nav-admin-recruiters', label: 'Manage Recruiters', icon: Briefcase, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/recruiters'); closePalette(); } },
        { id: 'nav-admin-approvals', label: 'Approval Center', icon: ShieldCheck, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/approvals'); closePalette(); } },
        { id: 'nav-admin-calendar', label: 'Unified Calendar', icon: Calendar, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/calendar'); closePalette(); } },
        { id: 'nav-admin-campaigns', label: 'Outreach Campaigns', icon: Send, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/campaigns'); closePalette(); } },
        { id: 'nav-admin-settings', label: 'System Settings', icon: Settings, category: 'Navigation', roles: ['ADMIN', 'SUPER_ADMIN'], action: () => { navigate('/admin/settings'); closePalette(); } },

        // Navigation - Recruiter
        { id: 'nav-rec-dashboard', label: 'Go to Recruiter Dashboard', icon: LayoutDashboard, category: 'Navigation', roles: ['RECRUITER'], action: () => { navigate('/recruiter/dashboard'); closePalette(); } },
        { id: 'nav-rec-profile', label: 'Company Profile', icon: User, category: 'Navigation', roles: ['RECRUITER'], action: () => { navigate('/recruiter/profile'); closePalette(); } },
        { id: 'nav-rec-jobs', label: 'Manage Jobs', icon: Briefcase, category: 'Navigation', roles: ['RECRUITER'], action: () => { navigate('/recruiter/jobs'); closePalette(); } },
        { id: 'nav-rec-applicants', label: 'Review Applicants', icon: Users, category: 'Navigation', roles: ['RECRUITER'], action: () => { navigate('/recruiter/applicants'); closePalette(); } },

        // Navigation - Student
        { id: 'nav-stu-dashboard', label: 'Go to Student Dashboard', icon: LayoutDashboard, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/dashboard'); closePalette(); } },
        { id: 'nav-stu-profile', label: 'My Profile', icon: User, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/profile'); closePalette(); } },
        { id: 'nav-stu-jobs', label: 'Job Board', icon: Briefcase, category: 'Navigation', roles: ['STUDENT'], action: () => { navigate('/student/jobs'); closePalette(); } },

        // Actions
        { id: 'action-logout', label: 'Sign Out', icon: User, category: 'Actions', action: () => { closePalette(); /* Logout handled loosely here, ideally trigger global logout */ } },

        // Theme
        { id: 'theme-light', label: 'Switch to Light Theme', icon: Sun, category: 'Theme', action: () => { setTheme('light'); closePalette(); } },
        { id: 'theme-dark', label: 'Switch to Dark Theme', icon: Moon, category: 'Theme', action: () => { setTheme('dark'); closePalette(); } },
        { id: 'theme-system', label: 'Use System Theme', icon: Monitor, category: 'Theme', action: () => { setTheme('system'); closePalette(); } },
    ];

    // Filter commands based on user role and search query
    const filteredCommands = allCommands.filter(command => {
        // Role check
        if (command.roles && user?.role && !command.roles.includes(user.role)) {
            return false;
        }
        // Search check
        if (searchQuery && !command.label.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });

    // Group commands by category
    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) {
            acc[cmd.category] = [];
        }
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    // Flatten for keyboard navigation
    const flattenedList = Object.values(groupedCommands).flat();

    // Keyboard navigation handlers
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

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.querySelector('[data-selected="true"]') as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, searchQuery]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-4"
            onClick={handleOutsideClick}
        >
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Search Input Header */}
                <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 h-14 px-4 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-lg"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleListKeyDown}
                    />
                    <div className="flex items-center gap-2">
                        <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 font-mono text-[10px] font-medium text-slate-500 border border-slate-200 dark:border-slate-700">
                            ESC
                        </kbd>
                        <button onClick={closePalette} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Command List Body */}
                <div
                    ref={listRef}
                    className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin"
                >
                    {filteredCommands.length === 0 ? (
                        <div className="py-14 text-center text-sm text-slate-500 dark:text-slate-400">
                            No results found for "{searchQuery}"
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, items], groupIndex) => {
                            // Calculate global index offset for this group
                            let globalGroupOffset = 0;
                            const groupCategories = Object.keys(groupedCommands);
                            for (let i = 0; i < groupIndex; i++) {
                                globalGroupOffset += groupedCommands[groupCategories[i]].length;
                            }

                            return (
                                <div key={category} className="mb-4 last:mb-0">
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
                                        {category}
                                    </div>
                                    <div className="space-y-1">
                                        {items.map((cmd, itemIndex) => {
                                            const globalIndex = globalGroupOffset + itemIndex;
                                            const isSelected = selectedIndex === globalIndex;

                                            return (
                                                <button
                                                    key={cmd.id}
                                                    data-selected={isSelected}
                                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors text-left
                                                        ${isSelected
                                                            ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300'
                                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                        }`}
                                                    onClick={() => cmd.action()}
                                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                >
                                                    <cmd.icon className={`w-5 h-5 ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                                                    <span className="flex-1 font-medium">{cmd.label}</span>
                                                    {isSelected && (
                                                        <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-brand-600 dark:text-brand-400">
                                                            Enter
                                                        </kbd>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer hints */}
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">↑</kbd><kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">↓</kbd> to navigate</span>
                        <span className="flex items-center gap-1.5"><kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">Enter</kbd> to select</span>
                    </div>
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">Nexus OS</span>
                </div>

            </div>
        </div>
    );
};

export default CommandPalette;
