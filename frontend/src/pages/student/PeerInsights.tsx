import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Search, Filter, Plus, ThumbsUp, MessageSquare, 
    Briefcase, Building, ChevronRight, User, Eye, 
    Star, ArrowRight, ShieldCheck, Sparkles, Loader2 
} from 'lucide-react';
import { experienceService, InterviewExperience } from '../../services/experienceService';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import SkeletonList from '../../components/Skeleton/SkeletonList';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import ShareExperienceModal from '../../components/Insights/ShareExperienceModal';
import { aiService } from '../../services/aiService';

const PeerInsights: React.FC = () => {
    const { addToast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedExp, setSelectedExp] = useState<InterviewExperience | null>(null);
    const [summaries, setSummaries] = useState<Record<string, { content: string, loading: boolean }>>({});

    const handleSummarize = async (e: React.MouseEvent, exp: InterviewExperience) => {
        e.stopPropagation();
        if (summaries[exp._id]) return;

        setSummaries(prev => ({ ...prev, [exp._id]: { content: '', loading: true } }));
        try {
            const summary = await aiService.summarizeExperience(exp);
            setSummaries(prev => ({ ...prev, [exp._id]: { content: summary, loading: false } }));
        } catch (err) {
            setSummaries(prev => ({ ...prev, [exp._id]: { content: 'Failed to generate summary.', loading: false } }));
        }
    };

    const { data, isLoading } = useQuery<{ data: InterviewExperience[], pagination: any }>({
        queryKey: ['experiences', searchTerm, difficulty],
        queryFn: () => experienceService.getExperiences({ 
            company: searchTerm, 
            difficulty: difficulty || undefined 
        }),
        refetchInterval: 300_000, 
    });

    const voteMutation = useMutation({
        mutationFn: (id: string) => experienceService.voteExperience(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
        },
        onError: () => addToast('Failed to vote', 'error')
    });

    const experiences = data?.data || [];

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Hard': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'Selected': return 'bg-emerald-500';
            case 'Rejected': return 'bg-rose-500';
            case 'Waitlisted': return 'bg-amber-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex justify-between items-start flex-wrap gap-6">
                <div className="max-w-xl">
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight flex items-center gap-3">
                        Peer Insights <Sparkles className="text-indigo-500" size={32} />
                    </h1>
                    <p className="text-slate-500 text-lg leading-relaxed m-0">
                        Real interview stories from your batchmates. Learn from their journeys, questions, and mistakes.
                    </p>
                </div>
                <Button 
                    variant="primary" 
                    icon={Plus} 
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none font-bold px-8"
                    onClick={() => setIsShareModalOpen(true)}
                >
                    Share Your Story
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex-1 relative min-w-[260px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by company or role..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                    <Filter size={18} className="text-slate-400" />
                    <select 
                        className="bg-transparent border-none outline-none font-semibold text-slate-600 dark:text-slate-300 text-sm cursor-pointer"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="">All Difficulty</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Insights Feed */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {isLoading ? (
                        <SkeletonList count={4} />
                    ) : experiences.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No experiences found</h3>
                            <p className="text-slate-500 mb-8 max-w-xs">Be the first to share your journey and help others in their preparation.</p>
                            <Button variant="primary" onClick={() => setIsShareModalOpen(true)}>Share Story</Button>
                        </Card>
                    ) : (
                        experiences.map((exp) => (
                            <motion.div 
                                key={exp._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card 
                                    className="group overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    onClick={() => setSelectedExp(exp)}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    {exp.company_name[0]}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors m-0">
                                                        {exp.role} @ {exp.company_name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${getDifficultyColor(exp.difficulty)}`}>
                                                            {exp.difficulty}
                                                        </span>
                                                        <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                                                            <Eye size={12} /> {exp.view_count || 0} views
                                                        </span>
                                                        <span className="text-slate-400 text-xs font-medium">
                                                            {formatDistanceToNow(new Date(exp.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${getVerdictColor(exp.verdict)} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} title={exp.verdict} />
                                        </div>

                                        <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed mb-4 font-medium italic">
                                            "{exp.tips || exp.rounds[0]?.details || "Shared an insightful interview experience. Click to view detailed rounds and questions."}"
                                        </p>

                                        {summaries[exp._id] ? (
                                            <div className="mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 animate-fade-in">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles size={14} className="text-indigo-600" />
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Summary</span>
                                                </div>
                                                {summaries[exp._id].loading ? (
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <Loader2 size={12} className="animate-spin" /> Distilling insights...
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                                                        {summaries[exp._id].content}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={(e) => handleSummarize(e, exp)}
                                                className="mb-6 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-all group/btn"
                                            >
                                                <div className="p-1 px-2 rounded-md bg-indigo-50 group-hover/btn:bg-indigo-100 transition-colors">
                                                    Generate Magic Summary ✨
                                                </div>
                                            </button>
                                        )}

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {exp.is_anonymous ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><User size={14} /></div>
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anonymous Peer</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <img src={exp.student?.profile_picture || '/default-avatar.png'} alt="" className="w-7 h-7 rounded-full object-cover" />
                                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{exp.student?.name}</span>
                                                    </div>
                                                )}
                                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                                                    {exp.rounds.length} Rounds
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                        exp.upvotes.includes(user?._id || '') 
                                                        ? 'bg-indigo-600 text-white' 
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        voteMutation.mutate(exp._id);
                                                    }}
                                                >
                                                    <ThumbsUp size={14} /> {exp.upvotes.length}
                                                </button>
                                                <span className="p-2 text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                                    <ArrowRight size={18} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 sticky top-8 flex flex-col gap-6">
                    <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-0 p-8 shadow-2xl shadow-indigo-200 dark:shadow-none overflow-hidden relative">
                        <Sparkles size={120} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
                        <h3 className="text-2xl font-black mb-4 relative z-10">Contribute & Grow</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-6 opacity-90 font-medium relative z-10">
                            Interview experiences are the most valuable resource for students. By sharing your story, you help build the "Inside Intelligence" that gets everyone placed.
                        </p>
                        <Button 
                            variant="primary" 
                            className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 font-black w-full"
                            onClick={() => setIsShareModalOpen(true)}
                        >
                            Start Sharing
                        </Button>
                    </Card>

                    <Card className="p-6 border-slate-200">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck size={16} /> Community Rules
                        </h4>
                        <ul className="space-y-4 p-0 m-0 list-none">
                            <li className="flex gap-3 text-sm text-slate-600 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                                Keep it professional and constructive.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                                Avoid sharing highly confidential company data.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                                Be honest about questions asked.
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <ShareExperienceModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
            />
            {/* Detailed View Modal can be added here */}
        </div>
    );
};

export default PeerInsights;
