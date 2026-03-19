import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface PIIMaskedTextProps {
    text: string;
    type?: 'email' | 'phone' | 'text';
    label?: string;
    className?: string;
}

const PIIMaskedText: React.FC<PIIMaskedTextProps> = ({ text, type = 'text', label, className = '' }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const maskText = (val: string) => {
        if (!val) return 'N/A';
        if (type === 'email') {
            const [user, domain] = val.split('@');
            if (!domain) return val;
            return `${user.charAt(0)}***@${domain.charAt(0)}***.${domain.split('.').pop()}`;
        }
        if (type === 'phone') {
            return `******${val.slice(-4)}`;
        }
        return '********';
    };

    const handleReveal = async () => {
        if (isRevealed) {
            setIsRevealed(false);
            return;
        }

        setIsLoading(true);
        try {
            // Log PII Access on the backend
            await api.post('/logs/pii-access', {
                target: label || 'Sensitive Data',
                type: type,
                timestamp: new Date().toISOString()
            });
            setIsRevealed(true);
        } catch (err) {
            console.error('Failed to log PII access:', err);
            // Still reveal if log fails? Decisions... 
            // Better to reveal so admin isn't blocked, but log as much as possible.
            setIsRevealed(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`inline-flex items-center gap-2 group/pii ${className}`}>
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={isRevealed ? 'revealed' : 'masked'}
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(4px)' }}
                        className={`text-sm font-medium transition-all ${isRevealed 
                            ? 'text-slate-900 dark:text-white' 
                            : 'text-slate-400 select-none'}`}
                    >
                        {isRevealed ? text : maskText(text)}
                    </motion.span>
                </AnimatePresence>
            </div>

            <button
                onClick={handleReveal}
                disabled={isLoading}
                className={`p-1 rounded-md transition-all ${isRevealed 
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40' 
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title={isRevealed ? 'Hide sensitive data' : 'Click to reveal (logged)'}
            >
                {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                ) : isRevealed ? (
                    <EyeOff size={14} />
                ) : (
                    <Eye size={14} />
                )}
            </button>
            
            {!isRevealed && !isLoading && (
                <div className="hidden group-hover/pii:flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-800/50 absolute -top-6 left-0 whitespace-nowrap z-10 shadow-sm animate-in fade-in slide-in-from-bottom-1">
                    <Lock size={8} /> Click to reveal (Logged Action)
                </div>
            )}
        </div>
    );
};

export default PIIMaskedText;
