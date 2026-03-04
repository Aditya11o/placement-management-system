import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();

    // Toggle cycle: system -> dark -> light -> system
    const toggleTheme = () => {
        if (theme === 'system') setTheme('dark');
        else if (theme === 'dark') setTheme('light');
        else setTheme('system');
    };

    return (
        <motion.button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-slate-500 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 relative overflow-hidden group shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
            aria-label="Toggle theme"
            title={`Current theme: ${theme}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300">
                {theme === 'system' && <Monitor size={20} className="animate-fade-in" />}
                {theme === 'light' && <Sun size={20} className="animate-fade-in text-amber-500" />}
                {theme === 'dark' && <Moon size={20} className="animate-fade-in text-indigo-400" />}
            </div>

            {/* Quick ping indicator when manually set to override system */}
            {theme !== 'system' && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500 opacity-60"></span>
                </span>
            )}
        </motion.button>
    );
};

export default ThemeToggle;
