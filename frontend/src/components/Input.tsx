import React, { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', error, ...props }) => {
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="label-sm font-bold text-on-surface">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-sleek ${error ? 'border-error ring-1 ring-error/20' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span 
          id={errorId} 
          className="text-error text-xs mt-1 font-medium flex items-center gap-1"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
