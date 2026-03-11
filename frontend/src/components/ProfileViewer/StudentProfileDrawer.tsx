import React, { useEffect, useState } from 'react';
import { X, Briefcase, GraduationCap, Link as LinkIcon, Phone, Mail, Award, FileText, Maximize2, Minimize2, Calendar, Star, Send, ShieldCheck } from 'lucide-react';
import JobSelectionModal from '../Modal/JobSelectionModal';
import { UIApplicant } from '../Kanban/KanbanCard';
import ScheduleInterviewModal from '../Modal/ScheduleInterviewModal';
import ComposeMessageModal from '../Modal/ComposeMessageModal';
import ScorecardForm from '../Scorecard/ScorecardForm';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export interface ScorecardResponse {
    _id: string;
    reviewer_id: string;
    reviewer_name: string;
    round_name: string;
    recommendation: 'HIRE' | 'NO_HIRE' | 'MAYBE';
    communication: number;
    technical: number;
    culture: number;
    overall: number;
    comments: string;
    created_at: string;
}

interface StudentProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    applicant: UIApplicant | null;
}

const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({ isOpen, onClose, applicant }) => {
    const [isResumeExpanded, setIsResumeExpanded] = useState<boolean>(false);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState<boolean>(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState<boolean>(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
    const [isInviting, setIsInviting] = useState(false);

    const { addToast } = useToast();
    const [scorecards, setScorecards] = useState<ScorecardResponse[]>([]);
    const [isSubmittingScorecard, setIsSubmittingScorecard] = useState(false);

    // Load scorecards when applicant changes
    useEffect(() => {
        if (applicant?._id) {
            // Because scorecards are tied to the application model, we need to fetch the app or 
            // use the pre-populated scorecards if they exist on the UIApplicant object.
            // Let's assume the backend populates them in `applications/recruiter`.
            // For real-time updates without refetching the whole board, we'll keep local state sync.
            // @ts-ignore - scorecards injected by backend
            setScorecards(applicant.scorecards || []);
        }
    }, [applicant?._id, applicant]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isResumeExpanded) {
                    setIsResumeExpanded(false);
                } else {
                    onClose();
                }
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        } else {
            document.body.style.overflow = 'auto';
            setIsResumeExpanded(false); // Reset on close
        }
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose, isResumeExpanded]);

    if (!isOpen || !applicant || !applicant.student) return null;

    const student = applicant.student;
    const initial = student.name ? student.name.charAt(0).toUpperCase() : 'U';

    const handleAddScorecard = async (data: { communication: number, technical: number, culture: number, overall: number, comments: string }) => {
        if (!applicant?._id) return;
        setIsSubmittingScorecard(true);
        try {
            const res = await api.post(`/applications/${applicant._id}/scorecards`, data);
            
            // Push the new scorecard into local state immediately for snappy UI
            const newScorecard = res.data.data.scorecards[0]; 
            setScorecards((prev) => [newScorecard, ...prev]);
            
            addToast('Interview scorecard added successfully!', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to submit scorecard', 'error');
        } finally {
            setIsSubmittingScorecard(false);
        }
    };

    const handleConfirmInvite = async (jobId: string) => {
        if (!applicant?.student?._id) return;
        setIsInviting(true);
        try {
            await api.post(`/students/${applicant.student._id}/invite`, { jobId });
            addToast(`Invitation sent to ${applicant.student.name}!`, 'success');
            setIsInviteModalOpen(false);
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to send invitation', 'error');
        } finally {
            setIsInviting(false);
        }
    };

    const renderResume = () => {
        if (!student.resume_url) {
            return (
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">No resume uploaded</p>
                </div>
            );
        }

        // Only try to embed if it ends with pdf (or assume it's pdf if it's a typical cloudinary/s3 url)
        // For broad compatibility, we use an iframe.
        const isPdf = student.resume_url.toLowerCase().includes('.pdf');

        if (isPdf) {
            return (
                <iframe
                    src={`${student.resume_url}#toolbar=0`}
                    className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
                    title="Resume Preview"
                />
            );
        } else {
            return (
                <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <FileText size={48} className="mb-4 text-indigo-400" />
                    <p className="font-medium mb-4 text-slate-700 dark:text-slate-300">File format may not support inline viewing.</p>
                    <a
                        href={student.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
                    >
                        <LinkIcon size={18} /> Open Externally
                    </a>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Split View Container if Resume is Expanded */}
            <div className={`relative h-full flex transition-all duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${isResumeExpanded ? 'w-full max-w-[90vw]' : 'w-full max-w-md'}`}>

                {/* Resume Viewer Panel (Left Side when expanded) */}
                {isResumeExpanded && (
                    <div className="flex-1 bg-slate-100 dark:bg-slate-900/90 h-full p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] border-r border-slate-200 dark:border-slate-800 flex flex-col animate-fade-in hidden md:flex">
                        <div className="flex justify-between items-center mb-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <FileText className="text-indigo-600" size={20} />
                                {student.name}'s Resume
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    href={student.resume_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                                >
                                    <LinkIcon size={16} /> Open New Tab
                                </a>
                                <button
                                    onClick={() => setIsResumeExpanded(false)}
                                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                                    title="Close Resume View"
                                >
                                    <Minimize2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 rounded-xl overflow-hidden shadow-inner bg-slate-200/50">
                            {renderResume()}
                        </div>
                    </div>
                )}

                {/* Main Profile Drawer */}
                <div className={`bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col shrink-0 transition-all duration-300 ${isResumeExpanded ? 'w-96' : 'w-full'}`}>
                    {/* Header Profile Section */}
                    <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 pt-8 sm:pt-12 pb-4 sm:pb-6 px-6 shrink-0 z-10">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                            aria-label="Close panel"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center mt-2 sm:mt-4">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-slate-800 bg-indigo-100 shadow-xl overflow-hidden flex items-center justify-center text-3xl sm:text-4xl font-bold text-indigo-500 mb-3 sm:mb-4 bg-cover bg-center shrink-0" style={{ backgroundImage: student.profile_image_url ? `url(${student.profile_image_url})` : 'none' }}>
                                {!student.profile_image_url && initial}
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">{student.name}</h2>
                            <span className="px-3 py-1 bg-white/20 text-white text-xs sm:text-sm font-medium rounded-full backdrop-blur-md text-center max-w-full truncate">
                                {student.branch} • Class of {student.graduation_year || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 block">CGPA</span>
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{student.cgpa || 'N/A'}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 block">Avg Interview</span>
                                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                    {scorecards.length > 0 
                                        ? (scorecards.reduce((acc, s) => acc + s.overall, 0) / scorecards.length).toFixed(1) 
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Academic Details */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <GraduationCap size={18} className="text-indigo-500" /> Academic Records
                            </h3>
                            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                                <div className="flex justify-between px-4 py-3">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">10th Marks</span>
                                    <span className="font-semibold text-slate-800 dark:text-white text-sm">{student.marks_10th ? `${student.marks_10th}%` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between px-4 py-3">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">12th Marks</span>
                                    <span className="font-semibold text-slate-800 dark:text-white text-sm">{student.marks_12th ? `${student.marks_12th}%` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between px-4 py-3">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">Active Backlogs</span>
                                    <span className="flex items-center gap-2">
                                        <span className={`font-semibold text-sm ${student.backlogs_active ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {student.backlogs_active || '0'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Award size={18} className="text-indigo-500" /> Top Skills
                            </h3>
                            {student.skills && student.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {student.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-medium rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No skills listed.</p>
                            )}
                        </div>

                        {/* Offer Status (Recruiter View) */}
                        {(applicant.status === 'SELECTED' || applicant.status === 'OFFER_ACCEPTED' || applicant.status === 'OFFER_DECLINED') && (
                            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-xl p-5">
                                <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <ShieldCheck size={18} /> Offer Lifecycle
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Status</span>
                                        <span className={`px-2 py-1 rounded font-black text-[11px] uppercase ${
                                            applicant.status === 'OFFER_ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                                            applicant.status === 'OFFER_DECLINED' ? 'bg-red-100 text-red-700' :
                                            'bg-purple-100 text-purple-700 animate-pulse'
                                        }`}>
                                            {applicant.status === 'SELECTED' ? 'Awaiting Response' : applicant.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    {/* @ts-ignore - offer fields from backend */}
                                    {applicant.offer_letter_url && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Document</span>
                                            <button 
                                                // @ts-ignore
                                                onClick={() => window.open(applicant.offer_letter_url, '_blank')}
                                                className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                                            >
                                                <LinkIcon size={14} /> View Letter
                                            </button>
                                        </div>
                                    )}

                                    {/* @ts-ignore */}
                                    {applicant.offer_expires_at && applicant.status === 'SELECTED' && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Expires</span>
                                            {/* @ts-ignore */}
                                            <span className="text-amber-600 font-bold">{new Date(applicant.offer_expires_at).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contact & Links */}
                        <div className="pb-4">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Briefcase size={18} className="text-indigo-500" /> Contact Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <Mail size={14} className="text-slate-500" />
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <a href={`mailto:${student.email}`} className="text-slate-700 dark:text-slate-300 font-medium hover:text-indigo-600 transition-colors truncate block flex-1">
                                            {student.email}
                                        </a>
                                        <button
                                            onClick={() => setIsMessageModalOpen(true)}
                                            className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md shrink-0 transition-colors"
                                        >
                                            Message
                                        </button>
                                    </div>
                                </div>
                                {student.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <Phone size={14} className="text-slate-500" />
                                        </div>
                                        <a href={`tel:${student.phone}`} className="text-slate-700 dark:text-slate-300 font-medium hover:text-indigo-600 transition-colors">
                                            {student.phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Internal Evaluation & Scorecards */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-indigo-500" /> Interview Scorecards
                            </h3>

                            {/* Scorecard Composer */}
                            <div className="mb-6">
                                <ScorecardForm onSubmit={handleAddScorecard} isSubmitting={isSubmittingScorecard} />
                            </div>

                            {/* Scorecards Timeline */}
                            <div className="space-y-4">
                                {scorecards.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic text-center py-4">No evaluations yet. Be the first to submit a scorecard for this candidate.</p>
                                ) : (
                                    scorecards.map(score => (
                                        <div key={score._id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm shrink-0 uppercase">
                                                {score.reviewer_name?.charAt(0) || 'R'}
                                            </div>
                                            <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-800 dark:text-white block">{score.reviewer_name}</span>
                                                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded uppercase">
                                                                {score.round_name || 'General'}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-400">{new Date(score.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                            score.recommendation === 'HIRE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                            score.recommendation === 'NO_HIRE' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                                        }`}>
                                                            {score.recommendation || 'MAYBE'}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-black">
                                                            <Star size={14} className="fill-current" />
                                                            {score.overall}/5
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-2 mb-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    <div className="text-center">
                                                        <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Comm.</span>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{score.communication}/5</span>
                                                    </div>
                                                    <div className="text-center border-x border-slate-200 dark:border-slate-700">
                                                        <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Tech.</span>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{score.technical}/5</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Culture</span>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{score.culture}/5</span>
                                                    </div>
                                                </div>

                                                {score.comments && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-yellow-50/50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                                        "{score.comments}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Footer Action */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                        <div className="flex gap-3">
                            {student.resume_url && (
                                isResumeExpanded ? (
                                    <a
                                        href={student.resume_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                                    >
                                        <LinkIcon size={18} /> Download
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => {
                                            // On mobile (no room for split view), open in new tab directly
                                            if (window.innerWidth < 768) {
                                                window.open(student.resume_url, '_blank', 'noopener,noreferrer');
                                            } else {
                                                setIsResumeExpanded(true);
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Maximize2 size={18} /> Resume
                                    </button>
                                )
                            )}
                            <button
                                onClick={() => setIsInterviewModalOpen(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Calendar size={18} /> Schedule
                            </button>
                            {/* Invitation Button (Only for recruiters sourcing from database) */}
                            {!applicant.job && (
                                <button
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Send size={18} /> Invite
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-modals */}
            <JobSelectionModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onConfirm={handleConfirmInvite}
                studentName={student.name || 'Unknown'}
                isSubmitting={isInviting}
            />
            <ScheduleInterviewModal
                isOpen={isInterviewModalOpen}
                onClose={() => setIsInterviewModalOpen(false)}
                applicantId={applicant._id}
                studentName={student.name || 'Unknown'}
                jobTitle={applicant.job?.title || 'Job'}
                onSuccess={() => {
                    setIsInterviewModalOpen(false);
                }}
            />

            <ComposeMessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                recipients={[applicant]}
            />
        </div>
    );
};

export default StudentProfileDrawer;
