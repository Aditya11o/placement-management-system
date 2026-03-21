import React, { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', error, ...props }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="label-sm">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-sleek ${error ? 'border-[var(--error-container)]' : ''}`}
        {...props}
      />
      {error && <span className="text-[var(--error-container)] text-xs mt-1">{error}</span>}
    </div>
  );
};

export default Input;
