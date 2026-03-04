import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
    const baseClasses = "p-6 bg-white/70 backdrop-blur-md border border-white/20 rounded-xl shadow-md transition-all duration-300";
    const hoverClasses = hoverable ? "hover:-translate-y-1 hover:shadow-lg" : "";

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
