import React from 'react';
import { motion } from 'framer-motion';
import Button from '../Button/Button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    illustration?: string;
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
    illustration, 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    onAction,
    className = ''
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto ${className}`}
        >
            {illustration ? (
                <div className="relative mb-8 group">
                    <motion.div 
                        animate={{ 
                            y: [0, -10, 0],
                        }}
                        transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="relative z-10"
                    >
                        <img 
                            src={illustration} 
                            alt={title} 
                            className="w-64 h-64 object-contain drop-shadow-2xl grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                        />
                    </motion.div>
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-75 -z-10" />
                </div>
            ) : Icon && (
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700 shadow-inner">
                    <Icon size={40} className="text-slate-400" />
                </div>
            )}

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
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
