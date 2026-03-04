import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
    const baseClasses = "p-6 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-xl shadow-md transition-all duration-300";
    const hoverClasses = hoverable ? "hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50" : "";

    return (
        <div
            className={`${baseClasses} ${hoverClasses} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
