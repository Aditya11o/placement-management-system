import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DownloadCloud, FileText, Database } from 'lucide-react';
import Button from '../Button/Button';

interface ExportReportsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (type: 'students' | 'applications') => void;
    isExporting: boolean;
}

const ExportReportsModal: React.FC<ExportReportsModalProps> = ({
    isOpen,
    onClose,
    onExport,
    isExporting
}) => {
    const [exportType, setExportType] = useState<'students' | 'applications'>('students');

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isExporting) onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose, isExporting]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !isExporting && onClose()}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <DownloadCloud size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white m-0 leading-tight">Export Data</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">Generate system reports</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isExporting}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                            Select the type of data you wish to export. The system will compile a comprehensive CSV file and email it directly to your registered admin address.
                        </p>

                        <div className="flex flex-col gap-3">
                            {/* Option 1: Students */}
                            <label className={`
                                relative flex items-start gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all
                                ${exportType === 'students'
                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                            `}>
                                <input
                                    type="radio"
                                    name="exportType"
                                    value="students"
                                    checked={exportType === 'students'}
                                    onChange={() => setExportType('students')}
                                    className="peer sr-only"
                                />
                                <div className={`
                                    w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                    ${exportType === 'students' ? 'border-indigo-600' : 'border-slate-300 dark:border-slate-600'}
                                `}>
                                    {exportType === 'students' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Database size={16} className={exportType === 'students' ? 'text-indigo-600' : 'text-slate-400'} />
                                        <span className={`font-bold ${exportType === 'students' ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                            Student Records
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                                        Complete dump of all registered students, their profiles, CGPAs, branches, and account statuses.
                                    </p>
                                </div>
                            </label>

                            {/* Option 2: Applications */}
                            <label className={`
                                relative flex items-start gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all
                                ${exportType === 'applications'
                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                            `}>
                                <input
                                    type="radio"
                                    name="exportType"
                                    value="applications"
                                    checked={exportType === 'applications'}
                                    onChange={() => setExportType('applications')}
                                    className="peer sr-only"
                                />
                                <div className={`
                                    w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                    ${exportType === 'applications' ? 'border-indigo-600' : 'border-slate-300 dark:border-slate-600'}
                                `}>
                                    {exportType === 'applications' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText size={16} className={exportType === 'applications' ? 'text-indigo-600' : 'text-slate-400'} />
                                        <span className={`font-bold ${exportType === 'applications' ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                            Job Applications
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                                        Detailed breakdown of every application, associated job ID, current hiring status, and match scores.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isExporting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            icon={DownloadCloud}
                            isLoading={isExporting}
                            onClick={() => onExport(exportType)}
                        >
                            Generate Report
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ExportReportsModal;
