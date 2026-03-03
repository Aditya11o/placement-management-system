import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary', // primary, secondary, danger, ghost
    size = 'md', // sm, md, lg
    isFullWidth = false,
    isLoading = false,
    className = '',
    icon: Icon,
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const widthClass = isFullWidth ? 'btn-full' : '';
    const loadingClass = isLoading ? 'btn-loading' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="btn-spinner"></span>
            ) : (
                <>
                    {Icon && <Icon className="btn-icon" size={size === 'sm' ? 16 : 20} />}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
