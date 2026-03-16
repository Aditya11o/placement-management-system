import { ButtonHTMLAttributes, ElementType } from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'xs' | 'sm' | 'md' | 'lg';
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
    const baseClasses = "inline-flex items-center justify-center gap-2 font-bold border cursor-pointer transition-all duration-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest";

    const variantClasses = {
        primary: "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/40 active:scale-[0.98]",
        secondary: "bg-slate-900 border-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10",
        outline: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm",
        danger: "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600",
        ghost: "bg-transparent border-transparent text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
    };

    const sizeClasses = {
        xs: "px-2 py-1 text-[9px] rounded-lg",
        sm: "px-3.5 py-2 text-[10px] rounded-xl",
        md: "px-5 py-2.5 text-[11px] rounded-2xl",
        lg: "px-8 py-4 text-[13px] rounded-2xl"
    };

    const widthClass = isFullWidth ? "w-full" : "";

    const { onAnimationStart, onDrag, ...safeProps } = props;

    return (
        <motion.button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className} relative overflow-hidden group/btn`}
            disabled={isLoading || props.disabled}
            aria-busy={isLoading}
            aria-disabled={isLoading || props.disabled}
            whileHover={!(isLoading || props.disabled) ? { 
                scale: 1.02,
                y: -1
            } : { scale: 1 }}
            whileTap={!(isLoading || props.disabled) ? { scale: 0.96 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            {...(safeProps as any)}
        >
            {/* Shine Effect Overlay for Primary */}
            {variant === 'primary' && !isLoading && !props.disabled && (
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <motion.div 
                        initial={{ x: '-100%', opacity: 0 }}
                        whileHover={{ x: '100%', opacity: 0.2 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12"
                    />
                </div>
            )}

            {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-label="Loading">
                    <title>Loading</title>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <div className="relative z-10 flex items-center gap-2">
                    {Icon && <Icon className="shrink-0 group-hover/btn:rotate-6 transition-transform" size={size === 'sm' ? 16 : 20} />}
                    <span className="truncate">{children}</span>
                </div>
            )}
        </motion.button>
    );
};

export default Button;
