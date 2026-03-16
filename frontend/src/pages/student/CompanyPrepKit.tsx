import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, BookOpen, 
    Zap, Shield, CheckCircle2,
    TrendingUp, Sparkles,
    ArrowRight, Brain, Lightbulb,
    Target, Clock, Globe, Fingerprint,
    Command,
    X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { experienceService } from '../../services/experienceService';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import SkeletonList from '../../components/Skeleton/SkeletonList';
import { motion, AnimatePresence } from 'framer-motion';
import PrepKitCard from './components/PrepKitCard';

const CompanyPrepKit: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [queryCompany, setQueryCompany] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const company = searchParams.get('company');
        if (company) {
            setSearchTerm(company);
            setQueryCompany(company);
        }
    }, [searchParams]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { data: trendingCompanies, isLoading: isTrendingLoading } = useQuery({
        queryKey: ['trendingCompanies'],
        queryFn: () => experienceService.getTrendingCompanies(),
    });

    const { data: prepKit, isLoading, error } = useQuery({
        queryKey: ['prepKit', queryCompany],
        queryFn: () => experienceService.getPrepKit(queryCompany),
        enabled: queryCompany.length > 0,
        retry: false
    });

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (searchTerm.trim()) {
            setQueryCompany(searchTerm.trim());
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (companyName: string) => {
        setSearchTerm(companyName);
        setQueryCompany(companyName);
        setShowSuggestions(false);
    };

    const filteredSuggestions = trendingCompanies?.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5) || [];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Immersive Hero Section */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 min-h-[450px] flex items-center justify-center p-8 lg:p-16">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-purple-600/20" />
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px]" />
                </div>
                
                <div className="relative z-10 max-w-4xl w-full text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
                    >
                        <Brain size={14} /> AI-Powered Interview Intelligence
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl lg:text-7xl font-black text-white m-0 tracking-tight leading-none"
                    >
                        Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 italic">Interview.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg lg:text-xl mt-6 font-bold max-w-2xl mx-auto leading-relaxed"
                    >
                        Access crowdsourced "Inside Intelligence" and AI-optimized question banks for top-tier tech companies.
                    </motion.p>
                    
                    {/* Intelligent Search Bar */}
                    <div className="mt-12 max-w-2xl mx-auto relative" ref={searchRef}>
                        <form onSubmit={handleSearch} className="group relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-indigo-400">
                                <Search size={24} />
                            </div>
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Target Company (e.g., Google, Amazon)..."
                                className="w-full pl-16 pr-32 py-6 rounded-[2rem] border-none bg-white text-slate-800 text-lg font-black focus:ring-8 focus:ring-indigo-500/20 shadow-2xl transition-all placeholder:text-slate-300"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {searchTerm && (
                                    <button 
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                <Button type="submit" variant="primary" className="h-12 px-6 rounded-full font-black uppercase tracking-widest bg-slate-900 border-none hover:bg-indigo-600 shadow-xl shadow-indigo-500/20">
                                    Fetch Kit
                                </Button>
                            </div>
                        </form>

                        {/* Autocomplete Suggestions */}
                        <AnimatePresence>
                            {showSuggestions && searchTerm.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    className="absolute top-full left-0 right-0 mt-4 p-2 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                                >
                                    <div className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 flex justify-between items-center">
                                        Suggested Kits
                                        <Command size={12} />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {filteredSuggestions.length > 0 ? filteredSuggestions.map((c: any) => (
                                            <button
                                                key={c.id}
                                                onClick={() => handleSuggestionClick(c.name)}
                                                className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors rounded-2xl group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                                                        <Globe size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-800">{c.name}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Prep Kit</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                                        c.difficulty === 'Hard' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                                                    }`}>
                                                        {c.difficulty}
                                                    </span>
                                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="p-8 text-center">
                                                <Fingerprint size={32} className="mx-auto text-slate-200 mb-2" />
                                                <p className="text-xs font-bold text-slate-400 italic">No existing kit found. AI will generate one for "{searchTerm}"</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-0">
                
                {/* Discovery State: Trending Kits */}
                {!queryCompany && (
                    <div className="space-y-10 animate-fade-in">
                        <div className="flex flex-wrap items-center justify-between gap-6 px-4">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Trending Collections</h2>
                                <p className="text-slate-500 font-medium mt-1">Jump start your prep with kits being reviewed by 2k+ peers.</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">Most Popular</span>
                                <span className="px-4 py-2 bg-slate-50 text-slate-400 rounded-full text-xs font-black uppercase tracking-widest border border-slate-100">Recent</span>
                            </div>
                        </div>

                        {isTrendingLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <SkeletonList count={6} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {trendingCompanies?.map((company: any) => (
                                    <PrepKitCard 
                                        key={company.id} 
                                        company={company} 
                                        onClick={handleSuggestionClick} 
                                    />
                                ))}
                            </div>
                        )}

                        {/* Interactive Insights Banner */}
                        <div className="p-1 calc:p-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[2.5rem] mt-10 shadow-2xl">
                             <div className="p-10 bg-slate-900 rounded-[2.25rem] flex flex-col lg:flex-row items-center justify-between gap-10">
                                <div className="max-w-xl text-center lg:text-left">
                                    <h3 className="text-3xl font-black text-white m-0 tracking-tight italic">
                                        Missing a Company?
                                    </h3>
                                    <p className="text-slate-400 font-bold mt-4 leading-relaxed">
                                        Our AI engine can synthesize custom prep kits in seconds by analyzing millions of interview artifacts. Just type any company name in the search above.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                     <div className="w-24 h-24 rounded-3xl bg-white/5 flex flex-col items-center justify-center border border-white/10 group hover:border-indigo-500 transition-colors">
                                        <TrendingUp className="text-indigo-400 group-hover:scale-110 transition-transform" size={32} />
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">Scale kit</span>
                                     </div>
                                      <div className="w-24 h-24 rounded-3xl bg-white/5 flex flex-col items-center justify-center border border-white/10 group hover:border-purple-500 transition-colors">
                                        <Target className="text-purple-400 group-hover:scale-110 transition-transform" size={32} />
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">Targeted</span>
                                     </div>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="space-y-12">
                        <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-[3rem] animate-pulse" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="h-96 bg-slate-100 dark:bg-slate-800/50 rounded-[3rem] animate-pulse" />
                            </div>
                            <div className="space-y-6">
                                <SkeletonList count={3} />
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-32 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border border-rose-100 dark:border-rose-900/20 shadow-xl"
                    >
                        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-500">
                            <Shield size={40} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Vault Access Restricted</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto leading-relaxed">
                            {(error as any).response?.data?.message || 'The data for this company is currently insufficient for a high-quality master kit. Contribute your experience to unlock it!'}
                        </p>
                        <Button className="mt-8 px-10 rounded-full" onClick={() => navigate('/student/peer-insights')}>
                            Contribute Now
                        </Button>
                    </motion.div>
                )}

                {prepKit && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Summary Column */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* AI Summary Card */}
                            {prepKit.summary ? (
                                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 p-12 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity rotate-12 group-hover:rotate-6 duration-700">
                                        <Brain size={240} />
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-8 mb-12 relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30">
                                                <Trophy size={36} />
                                            </div>
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                                                    <Sparkles size={12} fill="currentColor" /> Premium AI Kit
                                                </div>
                                                <h2 className="text-5xl font-black text-slate-900 dark:text-white m-0 mt-3 tracking-tighter uppercase italic">
                                                    {prepKit.companyName}
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-end">
                                                <TrendingUp size={12} /> Recruitment Bar
                                            </p>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="text-4xl font-black text-slate-900 dark:text-white">{prepKit.summary.difficulty_score}%</div>
                                                <div className="w-32 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                                        style={{ width: `${prepKit.summary.difficulty_score}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-bold text-rose-500 uppercase mt-1">High Complexity</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                                        {/* Round Patterns */}
                                        <div className="space-y-8">
                                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                                <div className="w-8 h-[2px] bg-indigo-500" />
                                                Interview Pipeline
                                            </h4>
                                            <div className="relative pl-8 space-y-8">
                                                <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-500/50 via-slate-100 dark:via-slate-800 to-transparent" />
                                                {prepKit.summary.round_patterns.map((round, i) => (
                                                    <div key={i} className="relative flex items-center gap-6 group/item">
                                                        <div className="absolute -left-[31px] w-8 h-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center z-10 group-hover/item:border-indigo-500 group-hover/item:text-indigo-500 transition-all font-black text-[10px]">
                                                            0{i + 1}
                                                        </div>
                                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-default">
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                                {round}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Strategic Insights */}
                                        <div className="space-y-10">
                                            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group/insight">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/insight:scale-125 transition-transform duration-700">
                                                    <Zap size={64} className="text-indigo-500" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                                                    <Fingerprint size={16} /> Mastery Verdict
                                                </h4>
                                                <p className="text-slate-300 text-sm leading-relaxed font-bold italic">
                                                    "{prepKit.summary.verdict}"
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                                    <div className="w-8 h-[2px] bg-amber-500" />
                                                    Strategic Playbook
                                                </h4>
                                                <ul className="space-y-4 p-0 m-0 list-none">
                                                    {prepKit.summary.top_tips.map((tip, i) => (
                                                        <li key={i} className="flex gap-4 p-4 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-2xl border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                                                            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                                                                <CheckCircle2 size={14} />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                                                                {tip}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center group">
                                    <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center mx-auto mb-8 text-amber-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                        <Zap size={48} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Intelligence Engine Locked</h3>
                                    <p className="text-slate-500 font-bold max-w-sm mx-auto mt-4 leading-relaxed">
                                        {prepKit.message || 'We need a threshold of 5 community insights to synthesize an AI Master Kit. Share your experience to help us reach the goal.'}
                                    </p>
                                    <Button className="mt-8 rounded-full" variant="outline" onClick={() => navigate('/student/peer-insights')}>Contribute Experiences</Button>
                                </div>
                            )}

                            {/* Question Bank */}
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 p-12 shadow-sm">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                            <Target size={24} />
                                        </div>
                                        Master Question Repository
                                    </h3>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">{(prepKit.summary?.master_questions || []).length} Total Tasks</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(prepKit.summary?.master_questions || []).map((q, i) => (
                                        <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-5 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:border-indigo-100 dark:hover:border-slate-700 transition-all">
                                            <div className="flex flex-col items-center gap-2 shrink-0">
                                                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">Step</span>
                                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-800 dark:text-white text-xs group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-relaxed italic group-hover:text-indigo-600 transition-colors">"{q}"</p>
                                                <div className="flex gap-2">
                                                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-[8px] font-black uppercase rounded text-slate-500">Core Pattern</span>
                                                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[8px] font-black uppercase rounded">Technical</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {(!prepKit.summary || prepKit.summary.master_questions.length === 0) && (
                                    <div className="text-center py-20 px-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl opacity-50">
                                        <Command size={40} className="mx-auto mb-4 text-slate-300" />
                                        <p className="text-slate-400 font-bold italic">No specialized tasks aggregated for this company yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Stories Sidebar */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between px-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 flex items-center justify-center text-[8px] text-indigo-500 leading-none">P</div>
                                    Peer Perspectives
                                </h4>
                                <span className="text-[10px] font-bold text-slate-300">{prepKit.experiences.length} Stories</span>
                            </div>

                            <div className="space-y-4">
                                {prepKit.experiences.map((exp, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 5 }}
                                    >
                                        <Card className="p-8 transition-all border-slate-200/60 dark:border-slate-800/60 hover:shadow-2xl hover:!bg-white dark:hover:!bg-slate-800/90 relative overflow-hidden group/card shadow-sm backdrop-blur-sm">
                                            {exp.verdict === 'Selected' && (
                                                <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-white rounded-bl-xl shadow-lg">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-center mb-6">
                                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                    exp.verdict === 'Selected' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-50 dark:bg-slate-500/10 text-slate-500'
                                                }`}>
                                                    {exp.verdict}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                                                    <Clock size={10} className="text-indigo-500" /> {exp.difficulty}
                                                </div>
                                            </div>

                                            <h5 className="font-black text-slate-900 dark:text-white m-0 text-base leading-tight italic group-hover/card:text-indigo-600 transition-colors">
                                                "{exp.role}"
                                            </h5>
                                            
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 font-bold leading-relaxed line-clamp-3">
                                                {exp.tips || 'A comprehensive guide through technical and behavioral evaluations...'}
                                            </p>

                                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                        {exp.student?.name?.[0] || 'M'}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase truncate max-w-[100px]">
                                                        {exp.is_anonymous ? 'Member' : (exp.student?.name || 'Peer')}
                                                    </span>
                                                </div>
                                                <button onClick={() => navigate('/student/peer-insights')} className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all shadow-sm">
                                                    <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            <Button 
                                variant="outline" 
                                className="w-full font-black uppercase tracking-widest py-8 rounded-[2rem] border-slate-200 dark:border-slate-800 hover:border-indigo-600 group shadow-sm bg-white dark:bg-slate-900"
                                onClick={() => navigate('/student/peer-insights')}
                            >
                                Explorer Vault <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                            </Button>

                            {/* Sidebar Tip */}
                            <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group/tip">
                                <div className="absolute top-0 left-0 p-4 opacity-10 group-hover/tip:rotate-12 transition-transform duration-700">
                                    <Sparkles size={120} />
                                </div>
                                <h4 className="font-black text-[10px] uppercase tracking-widest mb-4 opacity-80">Pro Prep Tip</h4>
                                <p className="text-sm font-bold leading-relaxed relative z-10 italic">
                                    "When preparing for {prepKit.companyName}, focus on the STAR method for behavioral rounds and clear complexity analysis for technical tasks."
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CompanyPrepKit;
