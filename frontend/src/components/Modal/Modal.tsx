import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const [isRendered, setIsRendered] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`);

    // ── Focus Trap ───────────────────────────────────────────────────────────
    const trapFocus = useCallback((e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }, []);

    // ── Escape Key Handler ───────────────────────────────────────────────────
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            onClose();
        }
        trapFocus(e);
    }, [onClose, trapFocus]);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            // Store previously focused element for restoration
            previousActiveElement.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';

            // Add keydown listener
            document.addEventListener('keydown', handleKeyDown);

            // Move focus into modal after animation completes
            const timer = setTimeout(() => {
                if (modalRef.current) {
                    const firstFocusable = modalRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
                    if (firstFocusable) {
                        firstFocusable.focus();
                    } else {
                        modalRef.current.focus();
                    }
                }
            }, 100);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);

            // Restore focus to previously focused element
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }

            const timer = setTimeout(() => setIsRendered(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, handleKeyDown]);

    if (!isRendered) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-[95vw]'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? titleId.current : undefined}
                    ref={modalRef}
                    tabIndex={-1}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        aria-hidden="true"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
                    >
                        {title && (
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                                <h3 id={titleId.current} className="text-lg font-bold text-slate-800 dark:text-white m-0">{title}</h3>
                                <button
                                    onClick={onClose}
                                    aria-label="Close dialog"
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    <X size={20} aria-hidden="true" />
                                </button>
                            </div>
                        )}
                        {!title && (
                             <button
                                onClick={onClose}
                                aria-label="Close dialog"
                                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all"
                            >
                                <X size={20} aria-hidden="true" />
                            </button>
                        )}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
