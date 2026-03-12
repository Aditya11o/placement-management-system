import { ButtonHTMLAttributes, ElementType } from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isFullWidth?: boolean;
    isLoading?: boolean;
    icon?: ElementType;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isFullWidth = false,
    isLoading = false,
    className = '',
    icon: Icon,
    ...props
}) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 font-medium border border-transparent cursor-pointer transition-all duration-200 outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variantClasses = {
        primary: "bg-[#6C63FF] text-white shadow-lg shadow-indigo-500/20 hover:bg-[#5b54e0] hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98]",
        secondary: "bg-white text-gray-900 border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300",
        danger: "bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600 hover:-translate-y-0.5",
        ghost: "bg-transparent text-gray-500 hover:bg-indigo-50 hover:text-[#6C63FF]"
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm rounded-md",
        md: "px-4 py-2 text-base rounded-md",
        lg: "px-6 py-3 text-lg rounded-lg"
    };

    const widthClass = isFullWidth ? "w-full" : "";

    const { onAnimationStart, onDrag, ...safeProps } = props;

    return (
        <motion.button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
            disabled={isLoading || props.disabled}
            whileHover={!(isLoading || props.disabled) ? { scale: 1.02 } : { scale: 1 }}
            whileTap={!(isLoading || props.disabled) ? { scale: 0.98 } : { scale: 1 }}
            {...(safeProps as any)}
        >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <>
                    {Icon && <Icon className="shrink-0" size={size === 'sm' ? 16 : 20} />}
                    {children}
                </>
            )}
        </motion.button>
    );
};

export default Button;
