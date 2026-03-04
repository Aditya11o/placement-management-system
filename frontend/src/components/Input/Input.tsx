import { forwardRef, InputHTMLAttributes, ElementType } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: ElementType;
    fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    fullWidth = true,
    ...props
}, ref) => {
    return (
        <div className={`flex flex-col mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
            {label && <label className="font-sans text-sm font-medium text-gray-700 mb-1.5" htmlFor={props.id || props.name}>{label}</label>}

            <div className="relative flex items-center">
                {Icon && <Icon className="absolute left-3 text-gray-500 pointer-events-none" size={18} />}
                <input
                    ref={ref}
                    className={`w-full py-2.5 pr-3 font-sans text-sm text-gray-900 bg-white border rounded-md transition-all duration-200 outline-none shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 ${Icon ? 'pl-9' : 'pl-3'} ${error ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
                    id={props.id || props.name}
                    {...props}
                />
            </div>

            {(error || helperText) && (
                <span className={`text-xs mt-1.5 ${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {error || helperText}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
