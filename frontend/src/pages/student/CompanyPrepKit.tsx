import React, { useState } from 'react';
import { 
    Search, BookOpen, Award, 
    Zap, Shield, CheckCircle2,
    TrendingUp, Sparkles,
    ArrowRight, Brain, Lightbulb,
    Target, Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { experienceService } from '../../services/experienceService';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import SkeletonList from '../../components/Skeleton/SkeletonList';
import { motion } from 'framer-motion';

const CompanyPrepKit: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [queryCompany, setQueryCompany] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    React.useEffect(() => {
        const company = searchParams.get('company');
        if (company) {
            setSearchTerm(company);
            setQueryCompany(company);
        }
    }, [searchParams]);

    const { data: prepKit, isLoading, error } = useQuery({
        queryKey: ['prepKit', queryCompany],
        queryFn: () => experienceService.getPrepKit(queryCompany),
        enabled: queryCompany.length > 0,
        retry: false
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setQueryCompany(searchTerm.trim());
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Search */}
            <div className="relative h-64 rounded-[2.5rem] bg-indigo-600 overflow-hidden shadow-2xl flex items-center p-12">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BookOpen size={240} className="text-white" />
                </div>
                <div className="relative z-10 max-w-2xl w-full">
                    <h1 className="text-4xl font-black text-white m-0 tracking-tight flex items-center gap-3">
                        Interview Prep Kits <Sparkles className="text-amber-300 fill-amber-300" size={32} />
                    </h1>
                    <p className="text-indigo-100 text-lg mt-3 font-medium opacity-90">
                        Aggregated "Inside Intelligence" for frequent recruiters.
                    </p>
                    
                    <form onSubmit={handleSearch} className="mt-8 flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search company (e.g., Google, Amazon)..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none text-slate-800 font-bold focus:ring-4 focus:ring-indigo-300 shadow-xl"
                            />
                        </div>
                        <Button type="submit" variant="primary" className="bg-slate-900 px-8 text-base">
                            Fetch Kit
                        </Button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {!queryCompany && (
                    <div className="py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                            <Search size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight">Search for a Company</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">Enter a company name to unlock community insights and AI-generated master guides.</p>
                    </div>
                )}

                {isLoading && (
                    <div className="space-y-8">
                        <SkeletonList count={3} />
                    </div>
                )}

                {error && (
                    <div className="py-20 text-center bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20">
                        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight">Kit Not Available</h3>
                        <p className="text-slate-500 font-medium">{(error as any).response?.data?.message || 'We couldn\'t find any experiences for this company yet.'}</p>
                    </div>
                )}

                {prepKit && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Summary Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* AI Summary Card */}
                            {prepKit.summary ? (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                                        <Brain size={120} />
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                                        <div>
                                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full">AI Master Kit</span>
                                            <h2 className="text-4xl font-black text-slate-800 dark:text-white m-0 mt-3 tracking-tighter italic">
                                                {prepKit.companyName}
                                            </h2>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Company Difficulty</p>
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl font-black text-slate-800 dark:text-white">{prepKit.summary.difficulty_score}%</div>
                                                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-600" 
                                                        style={{ width: `${prepKit.summary.difficulty_score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Round Patterns */}
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <TrendingUp size={16} className="text-indigo-500" /> Interview Process
                                            </h4>
                                            <div className="relative pl-6 space-y-6">
                                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
                                                {prepKit.summary.round_patterns.map((round, i) => (
                                                    <div key={i} className="relative flex items-center gap-4">
                                                        <div className="absolute -left-[23px] w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 z-10" />
                                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 flex-1">
                                                            {round}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Mastery Verdict */}
                                        <div className="space-y-8">
                                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/20">
                                                <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Brain size={16} /> Insights Verdict
                                                </h4>
                                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium italic">
                                                    "{prepKit.summary.verdict}"
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Lightbulb size={16} className="text-amber-500" /> Consolidated Tips
                                                </h4>
                                                <ul className="space-y-3 p-0 m-0 list-none">
                                                    {prepKit.summary.top_tips.map((tip, i) => (
                                                        <li key={i} className="flex gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                                                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                            {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
                                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                                        <Zap size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">AI Summary Locked</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">
                                        {prepKit.message || 'We need at least 3 community experiences to generate a high-quality master kit.'}
                                    </p>
                                </div>
                            )}

                            {/* Question Bank */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm transition-all hover:shadow-lg">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 tracking-tight">
                                    <Target size={24} className="text-rose-500" /> Master Question Bank
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(prepKit.summary?.master_questions || []).map((q, i) => (
                                        <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                            <span className="text-xs font-black text-slate-300 dark:text-slate-600 shrink-0 mt-1">Q{i + 1}</span>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 m-0 leading-relaxed group-hover:text-indigo-600 transition-colors">{q}</p>
                                        </div>
                                    ))}
                                </div>
                                {(!prepKit.summary || prepKit.summary.master_questions.length === 0) && (
                                    <p className="text-center text-slate-400 font-bold italic py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">No specific questions aggregated yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Stories Sidebar */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Recent Peer Stories</h4>
                            {prepKit.experiences.map((exp, i) => (
                                <Card key={i} className="p-6 transition-all hover:translate-x-2 border-slate-200 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                            exp.verdict === 'Selected' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {exp.verdict}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                            <Clock size={10} /> {exp.difficulty}
                                        </span>
                                    </div>
                                    <h5 className="font-black text-slate-800 dark:text-white m-0 text-sm leading-tight italic">"{exp.role}"</h5>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium line-clamp-2">
                                        {exp.tips || 'Shared their journey and questions...'}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
                                            <Award size={10} className="text-amber-500" /> By {exp.is_anonymous ? 'Member' : (exp.student?.name || 'Batchmate')}
                                        </span>
                                        <ArrowRight size={14} className="text-indigo-600" />
                                    </div>
                                </Card>
                            ))}
                            <Button 
                                variant="secondary" 
                                className="w-full font-black uppercase tracking-widest py-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                onClick={() => navigate('/student/peer-insights')}
                            >
                                View All 20+ Stories
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CompanyPrepKit;
