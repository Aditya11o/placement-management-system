import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresence } from '../../hooks/usePresence';
import { Eye } from 'lucide-react';

const PresenceAvatars: React.FC = () => {
    const { activeUsers } = usePresence();

    if (activeUsers.length === 0) return null;

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    };

    // Array of nice colors for avatars based on name hash
    const colors = [
        'bg-rose-500', 'bg-blue-500', 'bg-emerald-500',
        'bg-purple-500', 'bg-amber-500', 'bg-cyan-500',
        'bg-fuchsia-500', 'bg-indigo-500'
    ];

    const getColor = (name: string) => {
        if (!name) return colors[0];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="flex items-center gap-2 mr-4 border-r border-slate-200 dark:border-slate-800 pr-4">
            <div className="hidden sm:flex items-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mr-1.5">
                <Eye size={14} className="mr-1.5 opacity-80 text-emerald-500 animate-pulse" />
                <span>Active ({activeUsers.length})</span>
            </div>
            <div className="flex items-center -space-x-2 relative z-10">
                <AnimatePresence>
                    {activeUsers.slice(0, 5).map((user, idx) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.5, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5, x: -20 }}
                            transition={{ type: 'spring', bounce: 0.4 }}
                            className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 ${getColor(user.name)} text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-sm relative group cursor-help transition-transform hover:-translate-y-1 hover:z-50`}
                            style={{ zIndex: 50 - idx }}
                        >
                            {getInitials(user.name)}

                            {/* Tooltip */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-medium rounded shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap z-[100]">
                                {user.name}
                                <span className="block text-[9px] text-slate-400 mt-0.5">{user.email}</span>
                            </div>
                        </motion.div>
                    ))}
                    {activeUsers.length > 5 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold shadow-sm relative z-0"
                        >
                            +{activeUsers.length - 5}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PresenceAvatars;
