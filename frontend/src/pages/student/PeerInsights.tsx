import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Search, Filter, Plus, MessageSquare, 
    ChevronRight, Eye, 
    Sparkles,
    Globe, Zap, Flame, Award, Heart, Users,
    ShieldCheck
} from 'lucide-react';
import { experienceService, InterviewExperience } from '../../services/experienceService';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import SkeletonList from '../../components/Skeleton/SkeletonList';
import { motion } from 'framer-motion';
import ShareExperienceModal from '../../components/Insights/ShareExperienceModal';
import { aiService } from '../../services/aiService';
import InsightStoryCard from './components/InsightStoryCard';

const PeerInsights: React.FC = () => {
    const { addToast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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

    const categories = [
        { name: 'All Insights', icon: Globe },
        { name: 'FAANG', icon: Flame },
        { name: 'High Difficulty', icon: Award },
        { name: 'My Applications', icon: Heart },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 p-4 lg:p-10 bg-slate-50 dark:bg-slate-900/10 min-h-screen">
            
            {/* Cinematic Hero Section */}
            <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl bg-indigo-950 min-h-[400px] flex items-center p-8 lg:p-20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-indigo-950 to-purple-600/20" />
                <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-3xl text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-xl"
                        >
                            <Sparkles size={14} className="animate-pulse" />
                            Community Intelligence Hub
                        </motion.div>
                        
                        <h1 className="text-6xl lg:text-8xl font-black text-white m-0 tracking-tighter leading-[0.85] italic">
                            The Inside <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-indigo-300">Vault.</span>
                        </h1>
                        
                        <p className="text-indigo-200/60 text-lg lg:text-2xl mt-10 font-bold leading-relaxed max-w-xl italic">
                            No NDA. No censorship. Just real interview stories from your batchmates who already paved the way.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 w-full lg:w-80">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="px-10 py-8 rounded-[2.5rem] bg-white text-indigo-900 hover:bg-indigo-600 hover:text-white shadow-2xl shadow-indigo-500/10 font-black text-xl group h-24 uppercase tracking-widest border-none transition-all"
                            onClick={() => setIsShareModalOpen(true)}
                        >
                            <Plus className="mr-3 group-hover:rotate-90 transition-transform" strokeWidth={3} /> Spill Yours
                        </Button>
                        <div className="flex items-center justify-center lg:justify-start gap-4 px-6 text-indigo-400/60 text-[10px] font-black uppercase tracking-widest italic">
                            <Users size={14} /> Total Insights: {experiences.length * 12 + 154} Contributions
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* Interaction Bar */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col lg:flex-row items-center gap-6 shadow-sm">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={24} />
                            <input 
                                type="text" 
                                placeholder="Search 'Google SDE'... "
                                className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-black text-lg italic"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="p-2 px-6 bg-slate-900 text-white rounded-[1.5rem] flex items-center gap-3 h-16 shadow-lg">
                                <Filter size={18} className="text-indigo-400" />
                                <select 
                                    className="bg-transparent border-none outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer pr-4"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                >
                                    <option value="" className="bg-slate-900">All Levels</option>
                                    <option value="Easy" className="bg-slate-900">Easy</option>
                                    <option value="Medium" className="bg-slate-900">Medium</option>
                                    <option value="Hard" className="bg-slate-900">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex flex-wrap gap-4 scrollbar-hide overflow-x-auto pb-4">
                        {categories.map((cat, i) => (
                            <button 
                                key={cat.name} 
                                className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border-2 ${
                                    i === 0 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                                }`}
                            >
                                <cat.icon size={16} />
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Insights Feed */}
                    <div className="space-y-8">
                        {isLoading ? (
                            <SkeletonList count={4} />
                        ) : experiences.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-32 text-center bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800"
                            >
                                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-indigo-400">
                                    <MessageSquare size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight italic uppercase">Total Silence</h3>
                                <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed italic opacity-70">
                                    No experiences found for this query. Be the one to provide the first piece of intel.
                                </p>
                                <Button className="mt-10 px-12 rounded-full h-16 uppercase tracking-widest font-black bg-indigo-600 shadow-xl shadow-indigo-500/20" onClick={() => setIsShareModalOpen(true)}>
                                    Submit First Story
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {experiences.map((exp) => (
                                    <InsightStoryCard 
                                        key={exp._id}
                                        exp={exp}
                                        onView={(exp) => addToast(`Viewing ${exp.company_name} story (Detailed View coming soon)`, 'info')}
                                        onVote={id => voteMutation.mutate(id)}
                                        onSummarize={handleSummarize}
                                        summary={summaries[exp._id]}
                                        currentUserVoted={exp.upvotes.includes(user?._id || '')}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Intelligence */}
                <div className="lg:col-span-4 sticky top-10 flex flex-col gap-10">
                    
                    <Card className="bg-slate-900 dark:bg-black text-white border-0 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Award size={180} className="rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-10 shadow-lg shadow-indigo-500/20">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 italic uppercase tracking-tight">Become a <br /><span className="text-indigo-400">Contributor.</span></h3>
                            <p className="text-indigo-100/60 text-sm leading-relaxed mb-10 font-bold italic">
                                Your journey is someone else's playbook. Share your story to earn higher 'Insider Confidence' and help your batchmates get placed.
                            </p>
                            <Button 
                                variant="primary" 
                                className="bg-white text-slate-900 hover:bg-indigo-400 hover:text-white border-0 font-black w-full h-16 rounded-[1.5rem] uppercase tracking-widest italic transition-all"
                                onClick={() => setIsShareModalOpen(true)}
                            >
                                Submit Insight Now
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-10 border-slate-200/60 dark:border-slate-800 rounded-[3.5rem] bg-white dark:bg-slate-900">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-4 italic">
                            <ShieldCheck size={20} className="text-indigo-500" /> Vault Etiquette
                        </h4>
                        <div className="space-y-8">
                            {[
                                { title: 'Keep it Real', desc: 'Detailed rounds are better than short summaries.', icon: Sparkles },
                                { title: 'Ghost Mode', desc: 'Use anonymous sharing if you value privacy.', icon: Globe },
                                { title: 'Help Peers', desc: 'Share actual questions to build better prep.', icon: Zap }
                            ].map((rule, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        <rule.icon size={20} />
                                    </div>
                                    <div className="flex-1 border-b border-slate-50 dark:border-slate-800 pb-2">
                                        <div className="text-sm font-black text-slate-800 dark:text-white italic uppercase">{rule.title}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 opacity-80">{rule.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Contributor Hall of Fame (Mock) */}
                    <div className="p-6">
                         <div className="flex items-center justify-between mb-8 px-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Top Contributors</h4>
                              <ChevronRight size={16} className="text-slate-300" />
                         </div>
                         <div className="space-y-6">
                              {[
                                   { name: 'Aditya Halder', branch: 'CSE', count: 12 },
                                   { name: 'Rohan Sharma', branch: 'IT', count: 8 },
                                   { name: 'Priya Singh', branch: 'ECE', count: 5 }
                              ].map((user, i) => (
                                   <div key={i} className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400">
                                                  {user.name[0]}
                                             </div>
                                             <div>
                                                  <div className="text-sm font-black text-slate-800 dark:text-white italic">{user.name}</div>
                                                  <div className="text-[9px] font-bold text-slate-400 uppercase">{user.branch}</div>
                                             </div>
                                        </div>
                                        <div className="text-[10px] font-black text-indigo-500 uppercase">
                                             {user.count} Posts
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ShareExperienceModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
            />
        </div>
    );
};

export default PeerInsights;
