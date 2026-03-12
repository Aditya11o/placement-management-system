import { forwardRef, InputHTMLAttributes, ElementType } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: ElementType;
    fullWidth?: boolean;
    compact?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    fullWidth = true,
    compact = false,
    ...props
}, ref) => {
    return (
        <div className={`flex flex-col ${compact ? 'mb-2' : 'mb-4'} ${fullWidth ? 'w-full' : ''} ${className}`}>
            {label && <label className={`font-sans font-medium text-gray-700 ${compact ? 'text-[12px] mb-1' : 'text-sm mb-1.5'}`} htmlFor={props.id || props.name}>{label}</label>}

            <div className="relative flex items-center">
                {Icon && <Icon className={`absolute left-3 text-gray-500 pointer-events-none ${compact ? 'scale-[0.85]' : ''}`} size={18} />}
                <input
                    ref={ref}
                    className={`w-full ${compact ? 'py-1.5 text-[12.5px]' : 'py-2.5 text-sm'} pr-3 font-sans text-gray-900 bg-white border rounded-lg transition-all duration-300 outline-none shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 ${Icon ? 'pl-9' : 'pl-3'} ${error ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-300 focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15'}`}
                    id={props.id || props.name}
                    {...props}
                />
            </div>

            <div className={`${compact ? 'min-h-[14px] mt-0.5' : 'min-h-[18px] mt-1'} transition-all duration-300`}>
                {(error || helperText) && (
                    <span className={`${compact ? 'text-[10px]' : 'text-[12px]'} font-medium ${error ? 'text-[#ef4444]' : 'text-gray-500'}`}>
                        {error || helperText}
                    </span>
                )}
            </div>
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
