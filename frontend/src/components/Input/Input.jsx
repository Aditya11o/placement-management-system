import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    fullWidth = true,
    ...props
}, ref) => {
    return (
        <div className={`input-group ${fullWidth ? 'input-full' : ''} ${className}`}>
            {label && <label className="input-label" htmlFor={props.id || props.name}>{label}</label>}

            <div className="input-wrapper">
                {Icon && <Icon className="input-icon" size={18} />}
                <input
                    ref={ref}
                    className={`input-field ${Icon ? 'has-icon' : ''} ${error ? 'input-error' : ''}`}
                    id={props.id || props.name}
                    {...props}
                />
            </div>

            {(error || helperText) && (
                <span className={`input-message ${error ? 'msg-error' : 'msg-helper'}`}>
                    {error || helperText}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
