import React, { useEffect, useState } from 'react';
import { X, Building, MapPin, DollarSign, Calendar, Target, GraduationCap, CheckCircle, Send, Users } from 'lucide-react';
import Button from '../Button/Button';
import { Job } from '../../types';

// Extend Job interface to match the UIJob we use in JobBoard
export interface UIJob extends Job {
    company?: { company_name: string };
    skills_required: string[];
    status: 'ACTIVE' | 'CLOSED';
    deadline: string;
    createdAt?: string;
    updatedAt?: string;
    salary_package?: string;
    min_cgpa?: number;
    eligible_branch?: string;
    hasApplied?: boolean;
    description: string;
    min_marks_10th?: number;
    min_marks_12th?: number;
    max_backlogs_allowed?: number;
    diversity_hiring?: string;
    graduation_year?: number;
}

interface JobModalProps {
    isOpen: boolean;
    job: UIJob | null;
    onClose: () => void;
    onApply: (jobId: string) => void;
    isApplying: boolean;
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, job, onClose, onApply, isApplying }) => {
    const [isRendered, setIsRendered] = useState(false);

    // Handle animations
    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            document.body.style.overflow = '';
            // Delay unmounting to allow slide-out animation
            const timer = setTimeout(() => setIsRendered(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!isRendered || !job) return null;

    const isClosed = job.status === 'CLOSED';
    const canApply = !isClosed && !job.hasApplied;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop overlay */}
            <div
                className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Slide-over Drawer */}
            <div className={`relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header Section */}
                <div className="flex-shrink-0 border-b border-slate-200 px-6 py-5 bg-white relative z-10 flex justify-between items-start">
                    <div className="pr-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold shrink-0">
                                {job.company?.company_name?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 leading-tight m-0">{job.title}</h2>
                                <p className="text-slate-500 font-medium m-0 flex items-center gap-1.5 mt-0.5">
                                    <Building size={16} /> {job.company?.company_name || 'Unknown Company'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            {job.status === 'ACTIVE' ? (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-700 border border-green-200">Accepting Applications</span>
                            ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-red-100 text-red-700 border border-red-200">Closed</span>
                            )}
                            {job.hasApplied && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                                    <CheckCircle size={12} /> Applied
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors absolute top-5 right-5"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5 m-0">Salary Package</p>
                                <p className="font-bold text-slate-800 m-0 text-base">₹{job.salary_package} LPA</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5 m-0">Location</p>
                                <p className="font-bold text-slate-800 m-0 text-base">{job.location || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Calendar size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5 m-0">Apply Before</p>
                                <p className="font-bold text-slate-800 m-0 text-base">{new Date(job.deadline).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><GraduationCap size={20} /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5 m-0">Batch</p>
                                <p className="font-bold text-slate-800 m-0 text-base">{job.graduation_year || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Criteria Box */}
                    <div className="mb-8 bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Target className="text-indigo-500" size={20} /> Eligibility Criteria
                        </h3>
                        <ul className="space-y-3 m-0 p-0 list-none">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                                <span className="text-slate-700"><strong>Branches:</strong> {job.eligible_branch || 'All Branches'}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                                <span className="text-slate-700"><strong>Minimum CGPA:</strong> {job.min_cgpa ? `${job.min_cgpa} / 10.0` : 'No minimum criteria'}</span>
                            </li>
                            {job.max_backlogs_allowed !== undefined && (
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                                    <span className="text-slate-700"><strong>Active Backlogs Allowed:</strong> {job.max_backlogs_allowed === 0 ? 'None (Clear record)' : `Max ${job.max_backlogs_allowed}`}</span>
                                </li>
                            )}
                            {(job.min_marks_10th || job.min_marks_12th) ? (
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                                    <span className="text-slate-700 whitespace-pre-line">
                                        <strong>School Academics:</strong>
                                        {job.min_marks_10th ? `\n• 10th Standard: Minimum ${job.min_marks_10th}%` : ''}
                                        {job.min_marks_12th ? `\n• 12th Standard: Minimum ${job.min_marks_12th}%` : ''}
                                    </span>
                                </li>
                            ) : null}
                            {job.diversity_hiring === 'FEMALE_ONLY' && (
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 shrink-0"></span>
                                    <span className="text-pink-700 font-semibold flex items-center gap-1.5">
                                        <Users size={16} /> Diversity Hiring Drive (Female Candidates Only)
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Job Description */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Description & Requirements</h3>
                        <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {job.description || 'No description provided.'}
                        </div>
                    </div>

                </div>

                {/* Sticky Footer for CTA */}
                <div className="flex-shrink-0 border-t border-slate-200 p-6 bg-white flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    <Button
                        variant={job.hasApplied ? 'secondary' : 'primary'}
                        icon={job.hasApplied ? CheckCircle : Send}
                        onClick={() => onApply(job._id)}
                        disabled={!canApply || isApplying}
                        isLoading={isApplying}
                        className="w-full sm:w-auto min-w-[160px]"
                    >
                        {job.hasApplied ? 'Already Applied' : isClosed ? 'Applications Closed' : 'Apply Now'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JobModal;
