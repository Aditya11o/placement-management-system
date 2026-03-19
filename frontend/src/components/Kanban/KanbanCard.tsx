import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, GripVertical, Star } from 'lucide-react';
import { Application } from '../../types';

export interface UIApplicant extends Omit<Application, 'student' | 'job'> {
    student?: {
        _id: string;
        name: string;
        email: string;
        resume_url?: string;
        phone?: string;
        branch?: string;
        graduation_year?: number;
        cgpa?: number;
        marks_10th?: number;
        marks_12th?: number;
        backlogs_active?: number;
        skills?: string[];
        profile_image_url?: string;
    };
    job?: { _id: string; title: string };
    matchScore?: number;
}

interface KanbanCardProps {
    app: UIApplicant;
    onViewProfile?: (app: UIApplicant) => void;
    isBulkMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: (appId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
    app,
    onViewProfile,
    isBulkMode = false,
    isSelected = false,
    onToggleSelection
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: app._id,
        data: { type: 'Application', app },
        disabled: isBulkMode // Disable drag and drop during bulk edit
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const scoreColor = (score: number) =>
        score >= 80 ? 'text-green-600' : score >= 50 ? 'text-indigo-500' : 'text-red-500';

    if (isDragging && !isBulkMode) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-40 border-2 border-indigo-400 border-dashed rounded-lg bg-indigo-50 dark:bg-indigo-900/20 w-full h-[140px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex flex-col p-4 bg-white dark:bg-slate-800 border ${isSelected ? 'border-2 border-indigo-500 dark:border-indigo-400 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-700/60'} rounded-lg shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all ${isBulkMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} w-full gap-3 relative ${isDragging ? 'opacity-0' : ''}`}
            {...attributes}
            {...(isBulkMode ? {} : listeners)} // Only apply DND listeners if not bulk mode
            onClick={(e) => {
                // Ignore clicks on links or buttons inside the card
                if (e.defaultPrevented || (e.target as HTMLElement).closest('a, button')) return;

                if (isBulkMode && onToggleSelection) {
                    onToggleSelection(app._id);
                } else {
                    onViewProfile?.(app);
                }
            }}
        >
            {/* View Profile Overlay Hint (Only when not in bulk mode) */}
            {!isBulkMode && (
                <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 pointer-events-none rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        View Profile
                    </span>
                </div>
            )}

            <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-3 min-w-0 pr-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-lg font-bold shrink-0">
                        {app.student?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h4 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-0.5 truncate">
                            {app.student?.name || 'Unknown'}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{app.student?.email}</span>
                    </div>
                </div>

                <div className="absolute top-0 right-0 flex items-center justify-center">
                    {isBulkMode ? (
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white text-transparent group-hover:border-indigo-400'}`}>
                            {isSelected && (
                                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 10L0 6.00003L1.40002 4.60001L4 7.20001L10.6 0.599976L12 1.99997L4 10Z" fill="currentColor" />
                                </svg>
                            )}
                        </div>
                    ) : (
                        <div className="text-slate-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <GripVertical size={16} />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                    {app.job?.title}
                </span>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                            Rank Match
                        </span>
                        <span className={`text-sm font-extrabold ${scoreColor(app.matchScore ?? 0)}`}>
                            {app.matchScore ?? 0}%
                        </span>
                    </div>

                    {app.scorecards && app.scorecards.length > 0 && (
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                                Interview
                            </span>
                            <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-sm">
                                <Star size={12} className="fill-current" />
                                <span>{(app.scorecards.reduce((acc, s) => acc + s.overall, 0) / app.scorecards.length).toFixed(1)}</span>
                            </div>
                        </div>
                    )}

                    {app.student?.resume_url && (
                        <a
                            href={app.student.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded text-xs font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-600 z-10 hover:text-slate-900 dark:hover:text-white"
                            // Prevent drag when clicking the resume link
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => isBulkMode && e.preventDefault()} // Disable resume link in bulk mode to prioritize selection
                        >
                            <FileText size={14} /> Resume
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanCard;
