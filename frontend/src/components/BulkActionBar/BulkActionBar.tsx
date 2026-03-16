import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface BulkActionBarProps {
    selectedCount: number;
    itemName?: string;
    onClearSelection: () => void;
    onApprove: () => void;
    onReject: () => void;
    onExport?: () => void;
    isProcessing: boolean;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
    selectedCount,
    itemName = "Items",
    onClearSelection,
    onApprove,
    onReject,
    onExport,
    isProcessing
}) => {
    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-4 px-5 py-3 
                               bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-xl text-white rounded-full 
                               shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-700/50 w-max"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-sm border border-indigo-500/30">
                            {selectedCount}
                        </div>
                        <span className="font-semibold text-sm mr-2">{itemName} Selected</span>
                        <div className="w-px h-5 bg-slate-700" />
                        <button
                            onClick={onClearSelection}
                            disabled={isProcessing}
                            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                            title="Clear Selection"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="w-px h-5 bg-slate-700 ml-1 mr-2" />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onApprove}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            <CheckCircle size={14} /> Approve All
                        </button>
                        <button
                            onClick={onReject}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            <XCircle size={14} /> Block All
                        </button>
                        {onExport && (
                            <button
                                onClick={onExport}
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> Export Selected
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BulkActionBar;
