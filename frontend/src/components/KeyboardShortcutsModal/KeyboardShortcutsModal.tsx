import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SHORTCUTS = [
    {
        category: 'Global Navigation',
        items: [
            { keys: ['G', 'D'], description: 'Go to Dashboard' },
            { keys: ['G', 'S'], description: 'Go to Students Table' },
            { keys: ['G', 'R'], description: 'Go to Recruiters Table' },
            { keys: ['G', 'A'], description: 'Go to Approvals Center' },
            { keys: ['G', 'J'], description: 'Go to Job Queue' },
        ]
    },
    {
        category: 'Quick Actions',
        items: [
            { keys: ['Ctrl/Cmd', 'K'], description: 'Open Command Palette' },
            { keys: ['Shift', '?'], description: 'Show this Help Modal' },
            { keys: ['Esc'], description: 'Close Modals/Drawers' },
        ]
    }
];

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    // Close on Escape explicitly as a fallback
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl z-[101] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    <Keyboard size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white m-0">Keyboard Shortcuts</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Navigate the portal like a pro</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-6">
                            {SHORTCUTS.map((section, idx) => (
                                <div key={idx}>
                                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
                                        {section.category}
                                    </h3>
                                    <div className="flex flex-col gap-1">
                                        {section.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    {item.description}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {item.keys.map((key, keyIdx) => (
                                                        <React.Fragment key={keyIdx}>
                                                            <kbd className="min-w-[24px] flex items-center justify-center px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-sm">
                                                                {key === 'Ctrl/Cmd' ? <Command size={12} className="mr-0.5" /> : null}
                                                                {key}
                                                            </kbd>
                                                            {keyIdx < item.keys.length - 1 && <span className="text-slate-300 dark:text-slate-600 font-bold text-xs">+</span>}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Shortcuts are automatically disabled when typing in input fields.</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default KeyboardShortcutsModal;
