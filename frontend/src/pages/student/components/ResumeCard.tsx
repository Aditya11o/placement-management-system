import React, { memo } from 'react';
import { 
    FileText, 
    CheckCircle, 
    Trash2, 
    ExternalLink, 
    Zap, 
    Clock,
    Download,
    Star
} from 'lucide-react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { formatDistanceToNow } from 'date-fns';

export interface Resume {
    _id: string;
    version: number;
    is_active: boolean;
    uploaded_at: string;
    url: string;
}

interface ResumeCardProps {
    resume: Resume;
    variant: 'spotlight' | 'ghost';
    onSetActive: (id: string) => void;
    onDelete: (id: string) => void;
    onTune: (version: number) => void;
    isProcessing?: boolean;
}

const ResumeCard: React.FC<ResumeCardProps> = memo(({
    resume,
    variant,
    onSetActive,
    onDelete,
    onTune
}) => {
    // Generate a random-ish ATS score for visual demo if not provided (mocking intelligence)
    const mockAiscore = Math.floor(70 + (resume.version * 5) % 30);

    if (variant === 'spotlight') {
        return (
            <Card border className="relative flex flex-col p-8 !bg-white/80 dark:!bg-slate-800/90 border-emerald-300 dark:border-emerald-500/30 ring-4 ring-emerald-500/5 transition-all duration-500 overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <FileText size={160} />
                </div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                             <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-500/10">
                                <Star size={12} fill="currentColor" /> Active Portfolio
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version {resume.version}.0</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">Resume_v{resume.version}.pdf</h3>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mt-1">
                            <Clock size={14} />
                            <span>Active since {formatDistanceToNow(new Date(resume.uploaded_at))} ago</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative flex items-center justify-center w-20 h-20">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    className="text-slate-100 dark:text-slate-700"
                                    strokeWidth="6"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="34"
                                    cx="40"
                                    cy="40"
                                />
                                <circle
                                    className="text-emerald-500"
                                    strokeWidth="6"
                                    strokeDasharray={213.6}
                                    strokeDashoffset={213.6 * (1 - mockAiscore / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="34"
                                    cx="40"
                                    cy="40"
                                />
                            </svg>
                            <span className="absolute text-lg font-black text-slate-900 dark:text-white">{mockAiscore}%</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">ATS Strength</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-auto relative z-10">
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="font-black text-[10px] uppercase tracking-widest bg-indigo-600 shadow-indigo-500/20"
                        onClick={() => onTune(resume.version)}
                    >
                        <Zap size={14} className="mr-1.5" /> Expert Polish
                    </Button>
                    <a href={resume.url} target="_blank" rel="noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" isFullWidth className="font-black text-[10px] uppercase tracking-widest h-full">
                            <Download size={14} className="mr-1.5" /> Download
                        </Button>
                    </a>
                    <Button variant="ghost" size="sm" isFullWidth className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-full" onClick={() => {}}>
                        <ExternalLink size={14} className="mr-1.5" /> Cloud File
                    </Button>
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        isFullWidth 
                        className="font-black text-[10px] uppercase tracking-widest text-rose-400 hover:text-rose-600 hover:bg-rose-50 h-full opacity-50 cursor-not-allowed"
                        disabled
                    >
                        <Trash2 size={14} className="mr-1.5" /> Protected
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card border className="group relative flex items-center gap-6 p-4 !bg-white/40 dark:!bg-slate-800/40 hover:!bg-white dark:hover:!bg-slate-800 transition-all duration-300 border-dashed border-slate-200 dark:border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 dark:border-slate-600">
                <FileText size={20} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">v{resume.version}.0</span>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">Resume_v{resume.version}.pdf</h4>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                    <Clock size={12} />
                    <span>Uploaded {formatDistanceToNow(new Date(resume.uploaded_at))} ago</span>
                    <span className="mx-1">•</span>
                    <span className="text-amber-500 font-bold">{mockAiscore}% Score</span>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onTune(resume.version)}
                    className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    title="Expert Polish"
                >
                    <Zap size={14} />
                </button>
                <button 
                    onClick={() => onSetActive(resume._id)}
                    className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    title="Set as Active"
                >
                    <CheckCircle size={14} />
                </button>
                <button 
                    onClick={() => onDelete(resume._id)}
                    className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                    title="Delete Version"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            
            <a href={resume.url} target="_blank" rel="noreferrer" className="ml-2">
                <ExternalLink size={16} className="text-slate-300 hover:text-indigo-500 transition-colors" />
            </a>
        </Card>
    );
});

ResumeCard.displayName = 'ResumeCard';

export default ResumeCard;
