import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, Briefcase, Building2, MapPin, ChevronRight, Loader2, Send } from 'lucide-react';
import api from '../../services/api';
import Card from '../Card/Card';
import { useToast } from '../../context/ToastContext';

interface Job {
    _id: string;
    title: string;
    company_name: string;
    location: string;
    role_type: string;
    status: string;
}

interface JobSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (jobId: string) => void;
    studentName: string;
    isSubmitting?: boolean;
}

const JobSelectionModal: React.FC<JobSelectionModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    studentName,
    isSubmitting = false 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    const { data: jobs = [], isLoading } = useQuery({
        queryKey: ['recruiterActiveJobs'],
        queryFn: async () => {
            const res = await api.get('/jobs/recruiter?status=ACTIVE');
            return res.data.data || [];
        },
        enabled: isOpen
    });

    const filteredJobs = jobs.filter((job: Job) => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Send size={20} className="text-indigo-600" />
                            Invite to Apply
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Invite <span className="font-bold text-indigo-600 dark:text-indigo-400">{studentName}</span> to one of your active positions.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search your jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                {/* Job List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
                            <p className="text-sm text-slate-500 font-medium">Loading your positions...</p>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                            <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
                            <p className="text-slate-500 font-medium">No active jobs found</p>
                            <p className="text-xs text-slate-400 mt-1">Try a different search or post a new job.</p>
                        </div>
                    ) : (
                        filteredJobs.map((job: Job) => (
                            <button
                                key={job._id}
                                onClick={() => onConfirm(job._id)}
                                disabled={isSubmitting}
                                className="w-full text-left group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between disabled:opacity-50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {job.title}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                            <span className="flex items-center gap-1">
                                                <Building2 size={12} /> {job.role_type}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} /> {job.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobSelectionModal;
