import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Target, Mail, Award, AlertCircle, FileText } from 'lucide-react';
import api from '../../services/api';

interface JobMatchesDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string | null;
    jobTitle?: string;
}

interface RankedCandidate {
    student: {
        _id: string;
        name: string;
        email: string;
        branch: string;
        cgpa: number;
        profile_image_url?: string;
        resume_url?: string;
    };
    matchScore: number;
    matchReason: string;
}

const JobMatchesDrawer: React.FC<JobMatchesDrawerProps> = ({ isOpen, onClose, jobId, jobTitle }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['jobMatches', jobId],
        queryFn: async () => {
            if (!jobId) return null;
            const res = await api.get(`/admin/jobs/${jobId}/matches`);
            return res.data;
        },
        enabled: !!jobId && isOpen,
        staleTime: 5 * 60 * 1000, // Keep rankings cached for 5 mins to save AI tokens if closed/reopened
    });

    const candidates: RankedCandidate[] = data?.data || [];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50';
        if (score >= 60) return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full max-w-[600px] bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <Target size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white m-0">AI Benchmarking</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 m-0">
                                {jobTitle ? `Top matches for ${jobTitle}` : 'Analyzing student compatibility'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                            <div className="relative mb-6 pb-4">
                                <Target size={64} className="text-indigo-300 animate-ping absolute inset-0 opacity-20" />
                                <Target size={64} className="text-indigo-600 relative z-10 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Scanning Candidate Pool...</h3>
                            <p className="text-slate-500 max-w-xs mt-2">Gemini AI is analyzing resumes, skills, and academic records to find the perfect fit.</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-red-500">
                            <AlertCircle size={48} className="mb-4 opacity-50" />
                            <h3 className="text-xl font-bold">Analysis Failed</h3>
                            <p className="text-sm mt-2 opacity-80">Unable to generate candidate matches. The AI service may be temporarily unavailable.</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                            <Target size={48} className="mb-4 opacity-30" />
                            <h3 className="text-xl font-bold">No Matches Found</h3>
                            <p className="text-sm mt-2">No active students met the baseline criteria for this position.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {candidates.map((candidate, index) => (
                                <div key={candidate.student._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    {/* Rank Badge */}
                                    <div className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-black px-3 py-1 rounded-bl-lg">
                                        #{index + 1}
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xl font-bold shrink-0">
                                            {candidate.student.profile_image_url ? (
                                                <img src={candidate.student.profile_image_url} alt={candidate.student.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                candidate.student.name.charAt(0).toUpperCase()
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-[17px] font-bold text-slate-800 dark:text-white truncate">
                                                    {candidate.student.name}
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded textxs font-black tracking-wide ${getScoreColor(candidate.matchScore)}`}>
                                                    {candidate.matchScore}% MATCH
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
                                                <span className="flex items-center gap-1"><Award size={14} /> {candidate.student.branch}</span>
                                                <span className="flex items-center gap-1"><Mail size={14} /> {candidate.student.email}</span>
                                            </div>

                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800/50 leading-relaxed italic relative">
                                                <span className="text-3xl font-serif text-slate-200 dark:text-slate-800 absolute top-1 left-2 pointer-events-none">"</span>
                                                <span className="relative z-10 pl-6 block">{candidate.matchReason}</span>
                                            </div>

                                            {candidate.student.resume_url && (
                                                <a
                                                    href={candidate.student.resume_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                                >
                                                    <FileText size={16} /> View Resume
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default JobMatchesDrawer;
