import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    label?: string;
    placeholder?: string;
    error?: string;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, label, placeholder, error }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !value.includes(newTag)) {
                onChange([...value, newTag]);
            }
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            e.preventDefault();
            const newTags = [...value];
            newTags.pop();
            onChange(newTags);
        }
    };

    const removeTag = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="flex flex-col mb-4 w-full">
            {label && (
                <label className="font-sans text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            
            <div className={`flex flex-wrap items-center min-h-[42px] p-1.5 gap-1.5 bg-white border rounded-md transition-all duration-200 outline-none shadow-sm ${error ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20' : 'border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'}`}>
                {value.map((tag, index) => (
                    <span 
                        key={index}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded border border-indigo-100"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-indigo-400 hover:text-indigo-600 focus:outline-none"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
                
                <input
                    type="text"
                    className="flex-1 min-w-[120px] px-2 py-1 text-sm text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400"
                    placeholder={value.length === 0 ? placeholder : ''}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        const newTag = inputValue.trim();
                        if (newTag && !value.includes(newTag)) {
                            onChange([...value, newTag]);
                        }
                        setInputValue('');
                    }}
                />
            </div>
            
            {error && (
                <span className="text-xs mt-1.5 text-red-500">
                    {error}
                </span>
            )}
        </div>
    );
};

export default TagInput;
