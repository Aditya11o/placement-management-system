import React from 'react';
import { motion } from 'framer-motion';
import Button from '../Button/Button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    variant?: 'jobs' | 'applications' | 'broadcasts' | 'messages' | 'default';
    illustration?: string;
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
    variant = 'default',
    illustration, 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    onAction,
    className = ''
}) => {
    // Determine illustration based on variant if not provided
    const getIllustration = () => {
        if (illustration) return illustration;
        switch (variant) {
            case 'jobs': return '/illustrations/empty_jobs.png';
            case 'applications': return '/illustrations/empty_apps.png';
            case 'broadcasts': return '/illustrations/empty_broadcasts.png';
            default: return null;
        }
    };

    const activeIllustration = getIllustration();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className={`flex flex-col items-center justify-center p-16 text-center max-w-2xl mx-auto ${className}`}
        >
            {activeIllustration ? (
                <div className="relative mb-10 group">
                    <motion.div 
                        animate={{ 
                            y: [0, -12, 0],
                        }}
                        transition={{ 
                            duration: 5, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="relative z-10"
                    >
                        <img 
                            src={activeIllustration} 
                            alt={title} 
                            className="w-72 h-72 object-cover rounded-full border-4 border-white dark:border-slate-800 shadow-2xl group-hover:scale-105 transition-transform duration-700"
                        />
                    </motion.div>
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full scale-110 -z-10 animate-pulse" />
                </div>
            ) : Icon && (
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-700 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon size={44} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
                </div>
            )}

            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                {title}
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-base leading-relaxed mb-10 max-w-sm">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button 
                    variant="primary" 
                    onClick={onAction}
                    className="px-8 shadow-xl shadow-indigo-500/20"
                >
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
};

export default EmptyState;
