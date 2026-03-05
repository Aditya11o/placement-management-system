import React, { useEffect } from 'react';
import { X, Briefcase, GraduationCap, Link as LinkIcon, Phone, Mail, Award } from 'lucide-react';
import { UIApplicant } from '../Kanban/KanbanCard';

interface StudentProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    applicant: UIApplicant | null;
}

const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({ isOpen, onClose, applicant }) => {

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !applicant || !applicant.student) return null;

    const student = applicant.student;
    const initial = student.name ? student.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header Profile Section */}
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 pt-12 pb-6 px-6 shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                        aria-label="Close panel"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center mt-4">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-indigo-100 shadow-xl overflow-hidden flex items-center justify-center text-4xl font-bold text-indigo-500 mb-4 bg-cover bg-center" style={{ backgroundImage: student.profile_image_url ? `url(${student.profile_image_url})` : 'none' }}>
                            {!student.profile_image_url && initial}
                        </div>
                        <h2 className="text-2xl font-bold text-white text-center mb-1">{student.name}</h2>
                        <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-md">
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
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 block">Match Score</span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{applicant.matchScore ?? 0}%</span>
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
                                <span className={`font-semibold text-sm ${student.backlogs_active ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {student.backlogs_active || '0'}
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

                    {/* Contact & Links */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Briefcase size={18} className="text-indigo-500" /> Contact & Links
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Mail size={14} className="text-slate-500" />
                                </div>
                                <a href={`mailto:${student.email}`} className="text-slate-700 dark:text-slate-300 font-medium hover:text-indigo-600 transition-colors">
                                    {student.email}
                                </a>
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

                </div>

                {/* Footer Action */}
                {student.resume_url && (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                        <a
                            href={student.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <LinkIcon size={18} /> View PDF Resume
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProfileDrawer;
