import React, { useState } from 'react';
import { X, FileText, Calendar, Loader2, CheckCircle } from 'lucide-react';
import Button from '../Button/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface GenerateOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: string;
    studentName: string;
    jobTitle: string;
    onSuccess?: (url: string) => void;
}

const GenerateOfferModal: React.FC<GenerateOfferModalProps> = ({ 
    isOpen, 
    onClose, 
    applicationId, 
    studentName, 
    jobTitle,
    onSuccess 
}) => {
    const { addToast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7); // Default 7 days expiry
        return d.toISOString().split('T')[0];
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);

        try {
            const res = await api.post(`/admin/applications/${applicationId}/generate-offer`, {
                issueDate,
                expiryDate
            });

            const offerUrl = res.data.data.offer_letter_url;
            addToast('Offer letter generated successfully!', 'success');
            
            if (onSuccess) onSuccess(offerUrl);
            onClose();
            
            // Open the PDF in a new tab
            window.open(offerUrl, '_blank');
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Failed to generate offer letter.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <FileText size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white m-0">Generate Offer Letter</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate</span>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{studentName}</p>
                        <p className="text-xs text-slate-500">{jobTitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                <Calendar size={12} /> Issue Date
                            </label>
                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                <Calendar size={12} className="text-amber-500" /> Expiry Date
                            </label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl">
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed m-0 italic">
                            This will generate a official PDF using the system template. Existing offer letters for this application will be archived.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            isFullWidth
                            onClick={onClose}
                            disabled={isGenerating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isFullWidth
                            disabled={isGenerating}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" /> Generating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle size={16} /> Confirm
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenerateOfferModal;
