import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onApprove: () => void;
    onReject: () => void;
    isProcessing: boolean;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
    selectedCount,
    onClearSelection,
    onApprove,
    onReject,
    isProcessing
}) => {
    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 px-6 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 w-[90%] max-w-2xl"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-sm">
                            {selectedCount}
                        </div>
                        <span className="font-semibold text-[15px]">Students Selected</span>
                        <div className="w-px h-6 bg-slate-700 mx-2" />
                        <button
                            onClick={onClearSelection}
                            disabled={isProcessing}
                            className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <X size={16} /> Clear
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onApprove}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors disabled:opacity-50"
                        >
                            <CheckCircle size={16} /> Approve
                        </button>
                        <button
                            onClick={onReject}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                            <XCircle size={16} /> Block
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BulkActionBar;
