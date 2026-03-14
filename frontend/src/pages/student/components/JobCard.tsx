import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, DollarSign, Calendar, Send, CheckCircle, Bookmark, BookmarkCheck } from 'lucide-react';
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
}

const JobCard: React.FC<JobCardProps> = memo(({ 
    job, 
    onApply, 
    onToggleSave, 
    onSelect, 
    onPrefetch,
    isApplying, 
    isSaved,
    variants 
}) => {
    return (
        <motion.div 
            variants={variants} 
            onMouseEnter={() => onPrefetch(job._id)}
            className="h-full"
        >
            <Card border hoverable className="flex flex-col h-full p-8 group !bg-white/80 dark:!bg-slate-800/90 transition-all duration-500">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400 shrink-0 border border-slate-100 dark:border-slate-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                            {job.company?.company_name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex flex-col pt-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 leading-tight group-hover:text-indigo-600 transition-colors truncate max-w-[180px]" title={job.title}>
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1.5 opacity-60">
                                <Building size={12} />
                                <span className="text-xs font-black uppercase tracking-widest truncate max-w-[120px]">
                                    {job.company?.company_name || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {job.status === 'ACTIVE' ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 tracking-wider border border-emerald-500/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Open
                            </div>
                        ) : (
                            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/10 text-red-600 tracking-wider">Closed</div>
                        )}
                        <button 
                            onClick={(e) => onToggleSave(job._id, e)}
                            className={`p-2 rounded-xl transition-all duration-300 ${isSaved ? 'bg-indigo-500 text-white rotate-[360deg] shadow-lg shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:text-indigo-500'}`}
                        >
                            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                        </button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8 py-6 border-y border-slate-100 dark:border-slate-700/50">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                            <MapPin size={14} className="text-indigo-500" />
                            <span className="truncate">{job.location}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Package</span>
                        <div className="flex items-center gap-2 text-sm font-black text-indigo-700 dark:text-indigo-400">
                             ₹{job.salary_package} LPA
                        </div>
                    </div>
                </div>

                {/* Tags & Meta */}
                <div className="flex flex-wrap gap-2 mb-8">
                     <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-tighter rounded-lg border border-indigo-500/5">
                        CGPA: {job.min_cgpa}
                     </span>
                     <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-tighter rounded-lg">
                        {job.type}
                     </span>
                     <div className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                         <Calendar size={12} />
                         {new Date(job.deadline).toLocaleDateString()}
                     </div>
                </div>

                {/* Final Actions */}
                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 z-20 transition-all duration-500">
                    <Button 
                        isFullWidth 
                        variant="ghost" 
                        size="sm" 
                        className="font-black text-[10px] uppercase tracking-widest py-3 border border-slate-200 dark:border-slate-600 rounded-xl"
                        onClick={() => onSelect(job)}
                    >
                        Review
                    </Button>
                    <Button
                        isFullWidth
                        variant={job.hasApplied ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => onApply(job._id)}
                        disabled={job.status !== 'ACTIVE' || isApplying || job.hasApplied}
                        isLoading={isApplying}
                        icon={job.hasApplied ? CheckCircle : Send}
                        className="font-black text-[10px] uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-indigo-500/10"
                    >
                        {job.hasApplied ? 'Done' : 'Apply'}
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
});

JobCard.displayName = 'JobCard';

export default JobCard;
