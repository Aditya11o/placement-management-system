import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
    children, 
    variant = 'primary', 
    size = 'md',
    className = '' 
}) => {
    const variants = {
        primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
        secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        ghost: 'bg-transparent border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    };

    return (
        <span className={`inline-flex items-center font-bold rounded-lg tracking-wide ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
