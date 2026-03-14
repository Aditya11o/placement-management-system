import React, { useEffect, useState } from 'react';
import { X, Building, MapPin, DollarSign, Calendar, Target, GraduationCap, CheckCircle, Send, Users, Sparkles, FileText, BookOpen } from 'lucide-react';
import Button from '../Button/Button';
import { Job, StudentProfile } from '../../types';
import MatchBreakdown from '../AI/MatchBreakdown';
import SkillGapRoadmap from '../AI/SkillGapRoadmap';
import InterviewSimulator from '../Interview/InterviewSimulator';
import ResumeFitCheck from './components/ResumeFitCheck';
import ResumeAutoTune from './components/ResumeAutoTune';
import Modal from '../Modal/Modal';

// Extend Job interface to match the UIJob we use in JobBoard
export interface UIJob extends Omit<Job, 'min_cgpa' | 'eligible_branch' | 'graduation_year' | 'status' | 'deadline'> {
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
    type?: string;
    matchScore?: number;
}

interface JobModalProps {
    isOpen: boolean;
    job: UIJob | null;
    studentProfile?: StudentProfile | null;
    onClose: () => void;
    onApply: (jobId: string) => void;
    isApplying: boolean;
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, job, studentProfile, onClose, onApply, isApplying }) => {
    const [isRendered, setIsRendered] = useState(false);
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'ROADMAP'>('DETAILS');
    const [isSimOpen, setIsSimOpen] = useState(false);
    const [isFitCheckOpen, setIsFitCheckOpen] = useState(false);
    const [isAutoTuneOpen, setIsAutoTuneOpen] = useState(false);

    const jobSkills = job?.skills_required || [];
    const studentSkills = studentProfile?.skills || [];
    const missingSkills = jobSkills.filter(skill => 
        !studentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    );

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

                {/* Tab Switcher (Only if missing skills) */}
                {missingSkills.length > 0 && (
                    <div className="flex px-6 pt-2 bg-white border-b border-slate-100 shrink-0">
                        <button 
                            onClick={() => setActiveTab('DETAILS')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'DETAILS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            Job Details
                        </button>
                        <button 
                            onClick={() => setActiveTab('ROADMAP')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'ROADMAP' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <Sparkles size={14} /> AI Roadmap
                        </button>
                    </div>
                )}

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
                    {activeTab === 'DETAILS' ? (
                        <>

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
                    
                    {/* AI Match Breakdown Section */}
                    {job.matchScore !== undefined && (
                        <div className="mb-8 animate-fade-in">
                            <MatchBreakdown 
                                score={job.matchScore || 0}
                                jobSkills={job.skills_required || []}
                                studentSkills={studentProfile?.skills || []}
                                jobMinCgpa={job.min_cgpa}
                                studentCgpa={studentProfile?.cgpa}
                            />
                        </div>
                    )}

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
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Description & Requirements</h3>
                        <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {job.description || 'No description provided.'}
                        </div>
                    </div>
                </>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <SkillGapRoadmap missingSkills={missingSkills} />
                </div>
            )}
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
                        className="flex-1 sm:flex-none sm:min-w-[160px]"
                    >
                        {job.hasApplied ? 'Already Applied' : isClosed ? 'Applications Closed' : 'Apply Now'}
                    </Button>
                    <Button
                        variant="primary"
                        icon={Sparkles}
                        onClick={() => setIsSimOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 border-none shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 transition-transform"
                    >
                        AI Practice
                    </Button>
                    <Button
                        variant="secondary"
                        icon={FileText}
                        onClick={() => setIsFitCheckOpen(true)}
                        className="border-slate-200 font-bold"
                    >
                        AI Fit-Check
                    </Button>
                    <Button
                        variant="secondary"
                        icon={Sparkles}
                        onClick={() => setIsAutoTuneOpen(true)}
                        className="bg-indigo-50 border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100"
                    >
                        AI Auto-Tune
                    </Button>
                    <Button
                        variant="ghost"
                        icon={BookOpen}
                        onClick={() => window.location.href = `/student/prep-kits?company=${encodeURIComponent(job.company?.company_name || '')}`}
                        className="border-slate-200 text-indigo-600 font-bold hover:bg-indigo-50"
                    >
                        Prep Kit
                    </Button>
                </div>

                {/* Interview Simulator Modal */}
                <Modal
                    isOpen={isSimOpen}
                    onClose={() => setIsSimOpen(false)}
                    title="AI Mock Interview"
                    size="lg"
                >
                    <div className="h-[600px]">
                        <InterviewSimulator 
                            jobTitle={job.title}
                            jobDescription={job.description}
                            skills={job.skills_required}
                            onClose={() => setIsSimOpen(false)}
                        />
                    </div>
                </Modal>

                {/* Resume Fit-Check Modal */}
                <Modal
                    isOpen={isFitCheckOpen}
                    onClose={() => setIsFitCheckOpen(false)}
                    title="Resume Optimization"
                    size="md"
                >
                    <div className="h-[650px]">
                        <ResumeFitCheck
                            jobTitle={job.title}
                            jobDescription={job.description}
                            skills={job.skills_required}
                            onClose={() => setIsFitCheckOpen(false)}
                        />
                    </div>
                </Modal>

                {/* AI Resume Auto-Tune Modal */}
                <Modal
                    isOpen={isAutoTuneOpen}
                    onClose={() => setIsAutoTuneOpen(false)}
                    title="AI Resume Auto-Tune"
                    size="lg"
                >
                    <div className="h-[750px]">
                        <ResumeAutoTune
                            jobTitle={job.title}
                            jobDescription={job.description}
                            skills={job.skills_required}
                            onClose={() => setIsAutoTuneOpen(false)}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default JobModal;
