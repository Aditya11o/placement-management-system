import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  options: any[]; // Supports string[] or DropdownOption[]
  value: string | number;
  onChange: (value: any) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  italic?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder = 'Select option', 
  className = '',
  error,
  italic = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full border border-outline-variant rounded-xl px-4 py-2 text-sm font-medium transition-all bg-surface-container/50 flex items-center justify-between cursor-pointer hover:bg-surface-container-lowest hover:border-outline-variant group shadow-sm ${
            isOpen ? 'ring-2 ring-surface-tint/20 border-surface-tint bg-surface-container-lowest shadow-md' : ''
          } ${error ? 'border-rose-200 bg-rose-50/30' : ''}`}
        >
          <span className={`truncate ${selectedOption ? 'text-on-surface font-bold' : 'text-on-surface-variant'} ${italic ? 'italic' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180 text-surface-tint' : 'group-hover:text-surface-tint'}`} 
          />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar">
            <div className="py-2">
              {normalizedOptions.length === 0 ? (
                <div className="px-4 py-2 text-xs text-on-surface-variant font-bold italic">No options found.</div>
              ) : (
                normalizedOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all hover:bg-surface-container flex items-center justify-between ${
                      value === opt.value ? 'text-surface-tint bg-surface-tint/10' : 'text-on-surface-variant hover:text-surface-tint'
                    }`}
                  >
                    <span className={italic ? 'italic' : ''}>{opt.label}</span>
                    {value === opt.value && <div className="w-1.5 h-1.5 bg-surface-tint rounded-full" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && <span className="text-rose-500 text-[10px] font-bold px-1">{error}</span>}
    </div>
  );
};

export default Dropdown;
