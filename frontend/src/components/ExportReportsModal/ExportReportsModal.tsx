import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DownloadCloud, FileText, Database, Building } from 'lucide-react';
import Button from '../Button/Button';

interface ExportReportsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (type: 'students' | 'applications' | 'recruiters', justification: string) => void;
    isExporting: boolean;
}

const ExportReportsModal: React.FC<ExportReportsModalProps> = ({
    isOpen,
    onClose,
    onExport,
    isExporting
}) => {
    const [exportType, setExportType] = useState<'students' | 'applications' | 'recruiters'>('students');
    const [justification, setJustification] = useState('');
    const [error, setError] = useState('');

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isExporting) onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            setJustification('');
            setError('');
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose, isExporting]);

    const handleGenerate = () => {
        if (!justification.trim()) {
            setError('Please provide a justification for this data export.');
            return;
        }
        onExport(exportType, justification);
    };

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
                            Select the type of data you wish to export. All exports require a justification which will be logged for security auditing.
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
                                        Complete dump of all registered students, their profiles, CGPAs, and account statuses.
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
                                        Detailed breakdown of every application, job ID, hiring status, and match scores.
                                    </p>
                                </div>
                            </label>

                            {/* Option 3: Recruiters */}
                            <label className={`
                                relative flex items-start gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all
                                ${exportType === 'recruiters'
                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                            `}>
                                <input
                                    type="radio"
                                    name="exportType"
                                    value="recruiters"
                                    checked={exportType === 'recruiters'}
                                    onChange={() => setExportType('recruiters')}
                                    className="peer sr-only"
                                />
                                <div className={`
                                    w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                    ${exportType === 'recruiters' ? 'border-indigo-600' : 'border-slate-300 dark:border-slate-600'}
                                `}>
                                    {exportType === 'recruiters' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building size={16} className={exportType === 'recruiters' ? 'text-indigo-600' : 'text-slate-400'} />
                                        <span className={`font-bold ${exportType === 'recruiters' ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                            Recruiter Directory
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                                        Complete list of all registered recruiters, their companies, and verification status.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Justification Field */}
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                Export Justification <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={justification}
                                onChange={(e) => {
                                    setJustification(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="e.g., Seasonal placement report for department HOD"
                                className={`
                                    w-full h-24 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 
                                    border-2 text-sm text-slate-800 dark:text-white placeholder:text-slate-400
                                    transition-all resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10
                                    ${error ? 'border-red-300 dark:border-red-900/50 focus:border-red-400' : 'border-transparent focus:border-indigo-500'}
                                `}
                            />
                            {error ? (
                                <p className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                                    <X size={12} /> {error}
                                </p>
                            ) : (
                                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                                    All exports are audited. Please state the purpose of this data request.
                                </p>
                            )}
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
                            onClick={handleGenerate}
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
