import React, { useState, useEffect } from 'react';
import {
    X,
    UploadCloud,
    Download,
    FileText,
    AlertCircle,
    CheckCircle,
    Loader2,
    RefreshCw,
    CircleDot
} from 'lucide-react';
import Button from '../Button/Button';
import Card from '../Card/Card';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { addToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<any>(null);
    const [isPolling, setIsPolling] = useState(false);

    // Download CSV Template
    const downloadTemplate = () => {
        const headers = ['name', 'email', 'branch', 'cgpa', 'graduation_year', 'gender', 'phone', 'marks_10th', 'marks_12th'];
        const exampleValues = ['John Doe', 'john.doe@university.edu', 'Computer Science', '8.5', '2025', 'MALE', '+919876543210', '90', '88'];
        const csvContent = [headers.join(','), exampleValues.join(',')].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_import_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'student_import');

        try {
            const res = await api.post('/admin/bulk', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setJobId(res.data.data.job_id);
            addToast('Import job queued successfully.', 'success');
            setIsPolling(true);
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Failed to start import.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // Poll for job status
    useEffect(() => {
        let interval: any;
        if (isPolling && jobId) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/admin/bulk/${jobId}`);
                    const status = res.data.data;
                    setJobStatus(status);

                    if (status.status === 'completed' || status.status === 'failed') {
                        setIsPolling(false);
                        clearInterval(interval);
                        if (onSuccess) onSuccess();
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                    setIsPolling(false);
                    clearInterval(interval);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isPolling, jobId, onSuccess]);

    if (!isOpen) return null;

    const reset = () => {
        setFile(null);
        setJobId(null);
        setJobStatus(null);
        setIsPolling(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <UploadCloud size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white m-0">Bulk Student Import</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Pre-create accounts using CSV data</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {!jobId ? (
                        <div className="flex flex-col gap-6">
                            {/* Template Section */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-slate-800 text-indigo-600 rounded-lg shadow-sm">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">CSV Template</span>
                                </div>
                                <Button variant="ghost" size="sm" icon={Download} onClick={downloadTemplate}>
                                    Download
                                </Button>
                            </div>

                            {/* Upload Area */}
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`
                                    flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed transition-all
                                    ${file ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/30'}
                                `}>
                                    {file ? (
                                        <>
                                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle size={32} />
                                            </div>
                                            <span className="text-lg font-bold text-slate-800 dark:text-white">{file.name}</span>
                                            <span className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB • Ready</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                                <UploadCloud size={32} />
                                            </div>
                                            <span className="text-lg font-bold text-slate-800 dark:text-white">Click to select file</span>
                                            <span className="text-sm text-slate-500">or drag and drop CSV here</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button
                                isFullWidth
                                variant="primary"
                                size="lg"
                                disabled={!file || isUploading}
                                onClick={handleSubmit}
                                className="h-14 rounded-2xl shadow-lg shadow-indigo-500/20"
                            >
                                {isUploading ? 'Processing...' : 'Initiate Import'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Progress Section */}
                            <Card className="p-6 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {isPolling ? (
                                                <Loader2 size={18} className="animate-spin text-indigo-600" />
                                            ) : jobStatus?.status === 'completed' ? (
                                                <CheckCircle size={18} className="text-emerald-500" />
                                            ) : (
                                                <AlertCircle size={18} className="text-red-500" />
                                            )}
                                            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                                {jobStatus?.status || 'Queued'}
                                            </span>
                                        </div>
                                        <span className="text-2xl font-black text-indigo-600">{jobStatus?.progress || 0}%</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                                            style={{ width: `${jobStatus?.progress || 0}%` }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                            <span className="text-xs text-slate-400 block mb-1">Processed</span>
                                            <span className="text-xl font-bold text-slate-800 dark:text-white">
                                                {jobStatus?.result?.success_count || 0}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                            <span className="text-xs text-slate-400 block mb-1">Failed</span>
                                            <span className="text-xl font-bold text-red-500">
                                                {jobStatus?.result?.fail_count || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Errors List */}
                            {jobStatus?.result?.errors?.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <AlertCircle size={16} className="text-red-500" /> Row-level Failures
                                    </h4>
                                    <div className="max-h-40 overflow-y-auto pr-2 flex flex-col gap-2">
                                        {jobStatus.result.errors.map((err: string, i: number) => (
                                            <div key={i} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-red-700 dark:text-red-400 font-medium">
                                                {err}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isPolling && (
                                <div className="flex gap-3 mt-2">
                                    <Button isFullWidth variant="ghost" onClick={reset}>
                                        New Import
                                    </Button>
                                    <Button isFullWidth variant="primary" onClick={onClose}>
                                        Close
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-1 px-2 rounded-md bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-tight shrink-0">
                        Note
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight m-0">
                        Default password for all imported students will be <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded font-bold text-indigo-600">Welcome@123</code>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
