import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PageUserDetails {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
}

interface LiveAvatarsProps {
    users: PageUserDetails[];
    maxDisplay?: number;
}

const LiveAvatars: React.FC<LiveAvatarsProps> = ({ users, maxDisplay = 4 }) => {
    if (!users || users.length === 0) return null;

    const displayUsers = users.slice(0, maxDisplay);
    const extraUsers = users.length - maxDisplay;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <div className="flex -space-x-2 overflow-hidden">
                <AnimatePresence>
                    {displayUsers.map((user, i) => {
                        const initials = user.name
                            .split(' ')
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();

                        // Use provided color or fallback to slate
                        const bgColor = user.color || '#64748b';

                        return (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.5, x: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm"
                                style={{ zIndex: displayUsers.length - i }}
                                title={`${user.name} is viewing this page`}
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="h-full w-full rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-inner"
                                        style={{ backgroundColor: bgColor }}
                                    >
                                        {initials}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {extraUsers > 0 && (
                    <div
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900 border border-slate-200 dark:border-slate-600 z-0 shadow-sm"
                        title={`${extraUsers} more users are viewing this page`}
                    >
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            +{extraUsers}
                        </span>
                    </div>
                )}
            </div>

            {users.length > 0 && (
                <div className="flex items-center gap-1.5 ml-1 mr-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {users.length} viewing
                    </span>
                </div>
            )}
        </div>
    );
};

export default LiveAvatars;
