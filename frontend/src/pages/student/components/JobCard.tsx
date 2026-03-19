import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, Bookmark, BookmarkCheck, Zap, Calendar } from 'lucide-react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { UIJob } from '../../../components/JobModal/JobModal';

interface JobCardProps {
    job: UIJob;
    onApply: (jobId: string) => void;
    onToggleSave: (jobId: string, e: React.MouseEvent) => void;
    onSelect: (job: UIJob) => void;
    onPrefetch: (jobId: string) => void;
    isApplying: boolean;
    isSaved: boolean;
    variants: any;
    viewMode?: 'grid' | 'list';
}

const JobCard: React.FC<JobCardProps> = memo(({ 
    job, 
    onApply, 
    onToggleSave, 
    onSelect, 
    onPrefetch,
    isApplying, 
    isSaved,
    variants,
    viewMode = 'grid'
}) => {
    const isHighMatch = (job as any).matchScore >= 80;

    if (viewMode === 'list') {
        return (
            <motion.div 
                variants={variants}
                onMouseEnter={() => onPrefetch(job._id)}
                className="w-full"
            >
                <Card border className="group relative flex items-center gap-6 p-4 !bg-white/80 dark:!bg-slate-800/90 hover:!bg-indigo-50/30 dark:hover:!bg-indigo-500/5 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden" onClick={() => onSelect(job)}>
                    {/* Brand Accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Logo */}
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-400 shrink-0 border border-slate-100 dark:border-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {job.company?.company_name?.charAt(0) || 'C'}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="col-span-1 md:col-span-1">
                            <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-50 truncate">
                                {job.title}
                            </h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest truncate">
                                {job.company?.company_name}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-xs font-semibold truncate">{job.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <IndianRupeeBadge salary={job.salary_package} />
                        </div>

                        <div className="flex items-center gap-3">
                            {isHighMatch && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-600 text-[9px] font-black uppercase tracking-tighter border border-indigo-500/20">
                                    <Zap size={10} className="fill-current" />
                                    High Match
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                <Calendar size={12} />
                                {new Date(job.deadline).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onToggleSave(job._id, e); }}
                            className={`p-2 rounded-lg transition-all ${isSaved ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'}`}
                        >
                            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                        <Button 
                            variant={job.hasApplied ? 'secondary' : 'primary'}
                            size="xs"
                            onClick={(e) => { e.stopPropagation(); onApply(job._id); }}
                            disabled={job.status !== 'ACTIVE' || isApplying || job.hasApplied}
                            className="rounded-lg font-black uppercase tracking-widest min-w-[80px]"
                        >
                            {job.hasApplied ? 'Applied' : 'Apply'}
                        </Button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div 
            variants={variants} 
            onMouseEnter={() => onPrefetch(job._id)}
            className="h-full"
        >
            <Card border hoverable className="flex flex-col h-full p-6 group !bg-white/80 dark:!bg-slate-800/90 transition-all duration-500 relative overflow-hidden">
                {/* High Match Glow */}
                {isHighMatch && (
                    <div className="absolute top-0 right-0 p-4">
                        <div className="relative group/match">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-150 animate-pulse" />
                            <div className="relative flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30">
                                <Zap size={12} className="fill-current" />
                                High Match
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-400 shrink-0 border border-slate-100 dark:border-slate-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                            {job.company?.company_name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex flex-col pt-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 max-w-[200px]" title={job.title}>
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 opacity-60">
                                <Building size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
                                    {job.company?.company_name || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location & Package */}
                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                            <MapPin size={12} className="text-indigo-500" />
                            <span className="truncate">{job.location}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Package</span>
                        <IndianRupeeBadge salary={job.salary_package} />
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                     <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[9px] font-black uppercase tracking-tighter rounded-md border border-indigo-500/5">
                        MIN CGPA: {job.min_cgpa}
                     </span>
                     <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-md">
                        {job.type}
                     </span>
                </div>

                {/* Final Actions */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-50 dark:border-slate-700/30">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl border-slate-200 dark:border-slate-700"
                        onClick={() => onSelect(job)}
                    >
                        Review
                    </Button>
                    <Button
                        variant={job.hasApplied ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onApply(job._id); }}
                        disabled={job.status !== 'ACTIVE' || isApplying || job.hasApplied}
                        isLoading={isApplying}
                        className="flex-[1.5] font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl shadow-lg shadow-indigo-500/10"
                    >
                        {job.hasApplied ? 'Done' : 'Apply Now'}
                    </Button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); onToggleSave(job._id, e); }}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${isSaved ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:text-indigo-500'}`}
                    >
                        {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                </div>
            </Card>
        </motion.div>
    );
});

const IndianRupeeBadge = ({ salary }: { salary: number | string | undefined }) => (
    <div className="flex items-center gap-1 text-xs font-black text-indigo-700 dark:text-indigo-400">
        <span className="text-sm">₹</span>
        <span>{salary || 'N/A'}</span>
        <span className="text-[10px] text-slate-400 ml-0.5">LPA</span>
    </div>
);

JobCard.displayName = 'JobCard';

export default JobCard;
