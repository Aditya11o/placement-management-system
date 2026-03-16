import React, { memo } from 'react';
import { 
    ThumbsUp, 
    Eye, 
    Sparkles, 
    Loader2, 
    ArrowRight,
    User,
    Building,
    Calendar,
    Star
} from 'lucide-react';
import Card from '../../../components/Card/Card';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { InterviewExperience } from '../../../services/experienceService';

interface InsightStoryCardProps {
    exp: InterviewExperience;
    onView: (exp: InterviewExperience) => void;
    onVote: (id: string) => void;
    onSummarize: (e: React.MouseEvent, exp: InterviewExperience) => void;
    summary?: { content: string, loading: boolean };
    currentUserVoted: boolean;
}

const InsightStoryCard: React.FC<InsightStoryCardProps> = memo(({ 
    exp, 
    onView, 
    onVote, 
    onSummarize, 
    summary, 
    currentUserVoted 
}) => {
    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
            case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
            case 'Hard': return 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20';
        }
    };

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case 'Selected': return 'border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10';
            case 'Rejected': return 'border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-500/10';
            default: return 'border-slate-300 text-slate-600 bg-slate-50 dark:bg-slate-500/10';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            <Card 
                className="p-0 overflow-hidden border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] h-full flex flex-col group bg-white dark:bg-slate-900"
                onClick={() => onView(exp)}
            >
                <div className="p-8">
                    {/* Header: Company & Verdict */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-5">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-slate-100 dark:border-slate-700">
                                {exp.company_name[0]}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors m-0 leading-tight italic tracking-tight">
                                    {exp.role}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                        <Building size={14} className="text-indigo-500" /> {exp.company_name}
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar size={12} /> {formatDistanceToNow(new Date(exp.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getVerdictStyle(exp.verdict)}`}>
                            {exp.verdict}
                        </div>
                    </div>

                    {/* Metadata Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getDifficultyColor(exp.difficulty)} shadow-sm`}>
                            {exp.difficulty} Difficulty
                        </span>
                        <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-2">
                            <Star size={12} className="text-amber-500" /> {exp.rounds.length} Rounds
                        </span>
                    </div>

                    {/* Content Teaser */}
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-3 text-sm leading-relaxed mb-8 font-bold italic opacity-80 group-hover:opacity-100 transition-opacity">
                        "{exp.tips || exp.rounds[0]?.details || "Deep technical experience shared. Tap to read the full breakdown of questions and strategy."}"
                    </p>

                    {/* AI Wisdom Section */}
                    {summary ? (
                        <div className="mb-8 p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100/50 dark:border-indigo-500/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Sparkles size={40} className="text-indigo-500" />
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={14} className="text-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">AI Quick Summary</span>
                            </div>
                            {summary.loading ? (
                                <div className="flex items-center gap-3 text-sm text-slate-400 font-bold">
                                    <Loader2 size={16} className="animate-spin text-indigo-500" /> 
                                    <span>Distilling peak insights...</span>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                                    {summary.content}
                                </p>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={(e) => onSummarize(e, exp)}
                            className="mb-8 flex items-center gap-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] group/sum transition-all"
                        >
                            <span className="px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 group-hover/sum:bg-indigo-600 group-hover/sum:text-white shadow-sm transition-all flex items-center gap-3">
                                <Sparkles size={14} className="group-hover/sum:animate-pulse" />
                                Unlock AI Insights
                            </span>
                        </button>
                    )}

                    {/* Footer: Author & Engagement */}
                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {exp.is_anonymous ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm"><User size={18} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Insider Anonymous</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Verified Student</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <img src={exp.student?.profile_picture || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">{exp.student?.name}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Verified Student</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Eye size={16} />
                                <span className="text-xs font-black">{exp.view_count || 0}</span>
                            </div>
                            <button 
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                    currentUserVoted 
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white'
                                }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onVote(exp._id);
                                }}
                            >
                                <ThumbsUp size={16} className={currentUserVoted ? 'fill-current' : ''} />
                                <span>{exp.upvotes.length} Help</span>
                            </button>
                            <div className="lg:hidden text-indigo-600">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
});

InsightStoryCard.displayName = 'InsightStoryCard';

export default InsightStoryCard;
