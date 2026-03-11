import React from 'react';
import { X, Users, Trophy, GraduationCap, Briefcase, FileText, CheckCircle } from 'lucide-react';
import Button from '../Button/Button';
import Card from '../Card/Card';
import { UIApplicant } from '../Kanban/KanbanCard';

interface CompareCandidatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicants: UIApplicant[];
}

const CompareCandidatesModal: React.FC<CompareCandidatesModalProps> = ({
    isOpen,
    onClose,
    applicants
}) => {
    if (!isOpen || applicants.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh] animate-slide-up border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Candidate Comparison</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Comparing {applicants.length} shortlisted candidates</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Horizontal Scrollable Grid */}
                <div className="flex-1 overflow-auto p-6 lg:p-8 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
                    <div className={`grid grid-cols-${applicants.length} gap-6 lg:gap-8 min-w-[800px]`}>
                        {applicants.map((app) => (
                            <div key={app._id} className="flex flex-col gap-6 animate-fade-in">
                                {/* Profile Header Card */}
                                <Card className="p-6 border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-slate-800 shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-3xl font-black mb-4 shadow-inner">
                                            {app.student?.name?.charAt(0) || 'U'}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{app.student?.name}</h3>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-4">{app.student?.email}</span>

                                        <div className="w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/40">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Match Score</span>
                                                <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">{app.matchScore}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-indigo-200/50 dark:bg-indigo-900/40 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out"
                                                    style={{ width: `${app.matchScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Academic Stats */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <GraduationCap size={16} className="text-indigo-500" />
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Background</h4>
                                    </div>
                                    <Card className="p-4 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">CGPA</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{app.student?.cgpa || 'N/A'} / 10</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Branch</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{app.student?.branch || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Batch</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{app.student?.graduation_year || 'N/A'}</span>
                                        </div>
                                    </Card>
                                </div>

                                {/* Skills */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <Trophy size={16} className="text-amber-500" />
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Skills</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {app.student?.skills?.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-sm"
                                            >
                                                {skill}
                                            </span>
                                        )) || <span className="text-xs italic text-slate-400">No skills listed</span>}
                                    </div>
                                </div>

                                {/* Application Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <Briefcase size={16} className="text-blue-500" />
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Application Context</h4>
                                    </div>
                                    <Card className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-400 uppercase font-black">Applying for</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{app.job?.title}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-400 uppercase font-black">Current Status</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
                                                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{app.status}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Action Bar */}
                                <div className="mt-auto pt-6 flex flex-col gap-3">
                                    {app.student?.resume_url && (
                                        <Button
                                            isFullWidth
                                            variant="secondary"
                                            icon={FileText}
                                            onClick={() => window.open(app.student?.resume_url, '_blank')}
                                        >
                                            View Resume
                                        </Button>
                                    )}
                                    <Button
                                        isFullWidth
                                        variant="ghost"
                                        icon={CheckCircle}
                                        className="border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                    >
                                        Keep Candidate
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Close Comparison</Button>
                    <Button variant="primary">Download Group Report</Button>
                </div>
            </div>
        </div>
    );
};

export default CompareCandidatesModal;
