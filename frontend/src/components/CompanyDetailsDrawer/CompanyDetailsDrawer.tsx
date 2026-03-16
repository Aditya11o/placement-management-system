import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, Mail, Calendar, Globe, CheckCircle, Ban, StickyNote, Save } from 'lucide-react';
import Button from '../Button/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface CompanyDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    recruiter: any;
    onStatusChange: (userId: string, newStatus: boolean) => void;
    isUpdating: boolean;
}

const CompanyDetailsDrawer: React.FC<CompanyDetailsDrawerProps> = ({ isOpen, onClose, recruiter, onStatusChange, isUpdating }) => {
    const { addToast } = useToast();
    const { user: currentUser } = useAuth();
    const [internalNotes, setInternalNotes] = React.useState<string>(recruiter?.internal_notes || '');
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (recruiter) {
            setInternalNotes(recruiter.internal_notes || '');
        }
    }, [recruiter]);

    if (!recruiter) return null;

    const handleSaveNotes = async () => {
        setIsSaving(true);
        try {
            await api.put('/admin/users/notes', {
                id: recruiter._id,
                role: 'RECRUITER',
                internal_notes: internalNotes
            });
            addToast('Internal notes updated successfully.', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to update internal notes.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                                    {recruiter.company_name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight m-0">{recruiter.company_name}</h2>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Company Profile</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">

                            {/* Summary Status Box */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Current Status</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">System Access</span>
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                            recruiter.status === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${recruiter.status === 'APPROVED' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                            {recruiter.status === 'APPROVED' ? 'Active' : 'Restricted'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">Verification</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                            recruiter.status === 'APPROVED' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                : recruiter.status === 'PENDING'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                        }`}>
                                            {recruiter.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Internal Notes (Admins Only) */}
                            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                                            <StickyNote size={18} /> Internal Notes
                                        </h3>
                                        <button
                                            onClick={handleSaveNotes}
                                            disabled={isSaving}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold uppercase rounded-lg transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : <><Save size={12} /> Save</>}
                                        </button>
                                    </div>
                                    <textarea
                                        value={internalNotes}
                                        onChange={(e) => setInternalNotes(e.target.value)}
                                        placeholder="Add private evaluation notes about this company/recruiter..."
                                        className="w-full h-32 p-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400 resize-none transition-all"
                                    />
                                    <p className="mt-2 text-[10px] text-amber-700/60 dark:text-amber-500/40 italic">
                                        Only visible to admins. Recruiters and students cannot see this.
                                    </p>
                                </div>
                            )}

                            {/* Key Details */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Registration Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Building className="text-slate-400 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Contact Person</div>
                                            <div className="text-slate-800 dark:text-slate-200 font-medium">{recruiter.contact_person}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Mail className="text-slate-400 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Email Address (Login)</div>
                                            <div className="text-slate-800 dark:text-slate-200 font-medium">{recruiter.email}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">Note: Used for system authentication and notifications.</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="text-slate-400 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Registered On</div>
                                            <div className="text-slate-800 dark:text-slate-200 font-medium">{new Date(recruiter.created_at).toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Globe className="text-slate-400 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Domain Verification</div>
                                            <div className="text-slate-800 dark:text-slate-200 font-medium">
                                                {recruiter.email.split('@')[1]}
                                            </div>
                                            <div className="text-xs text-amber-500 dark:text-amber-400 mt-0.5 font-medium">
                                                Ensure this domain matches the official company website.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur">
                            <div className="flex gap-3">
                                {recruiter.status === 'APPROVED' ? (
                                    <Button
                                        isFullWidth
                                        variant="danger"
                                        icon={Ban}
                                        onClick={() => onStatusChange(recruiter._id, false)}
                                        isLoading={isUpdating}
                                    >
                                        Block Recruiter Access
                                    </Button>
                                ) : (
                                    <Button
                                        isFullWidth
                                        variant="primary"
                                        icon={CheckCircle}
                                        onClick={() => onStatusChange(recruiter._id, true)}
                                        isLoading={isUpdating}
                                    >
                                        Approve & Grant Access
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CompanyDetailsDrawer;
