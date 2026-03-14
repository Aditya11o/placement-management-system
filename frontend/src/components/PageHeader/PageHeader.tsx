import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
    return (
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-2">
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10"
            >
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight m-0 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-300 dark:to-indigo-500">
                    {title}
                </h1>
                {subtitle && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mt-2"
                    >
                        <div className="w-8 h-[2px] bg-indigo-500/30 rounded-full" />
                        <p className="text-slate-500 dark:text-slate-400 text-base m-0 font-semibold tracking-wide">
                            {subtitle}
                        </p>
                    </motion.div>
                )}
            </motion.div>
            
            {action && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
                    className="flex shrink-0 relative z-10"
                >
                    <div className="p-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white dark:border-slate-700/50 rounded-2xl shadow-xl shadow-indigo-500/5">
                        {action}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default PageHeader;
