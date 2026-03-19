import React, { useState } from 'react';
import { 
    Zap, AlertCircle, 
    Brain, Lightbulb,
    X
} from 'lucide-react';
import Button from '../../Button/Button';
import { motion } from 'framer-motion';

interface ResumeFitCheckProps {
    jobTitle: string;
    onClose: () => void;
}

const ResumeFitCheck: React.FC<ResumeFitCheckProps> = ({ jobTitle, onClose }) => {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [analysis, setAnalysis] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runAnalysis = async () => {
        setStatus('LOADING');
        setError(null);
        
        // Simulate a deterministic keyword check
        setTimeout(() => {
            const mockAnalysis: any = {
                match_score: 85,
                verdict: "Your profile shows strong alignment with the core requirements of this role. Focus on highlighting your leadership experience.",
                suggestions: [
                    { original: "Worked on frontend tasks.", suggested: "Spearheaded frontend development using React and Redux, improving load times by 40%." },
                    { original: "Knows Python.", suggested: "Architected scalable backends using Python/Django, handling 10k+ concurrent users." }
                ],
                gaps: ["Cloud Architecture", "System Design", "Unit Testing"]
            };
            setAnalysis(mockAnalysis);
            setStatus('SUCCESS');
        }, 1200);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 m-0 flex items-center gap-2 uppercase tracking-tight">
                        Profile Fit-Check <Zap className="text-amber-400 fill-amber-400" size={20} />
                    </h3>
                    <p className="text-xs text-slate-500 m-0 font-bold uppercase tracking-widest mt-1">Smart Match Engine</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {status === 'IDLE' && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                            <Brain size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Compare your Resume</h4>
                        <p className="text-slate-500 text-sm max-w-xs mb-8">
                            We'll compare your active resume against the <b>{jobTitle}</b> role to find gaps and suggest rewrites.
                        </p>
                        <Button variant="primary" icon={Zap} onClick={runAnalysis} className="px-10 font-black shadow-xl shadow-indigo-200 dark:shadow-none bg-indigo-600">
                            Start Profile Analysis
                        </Button>
                    </div>
                )}

                {status === 'LOADING' && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="relative w-24 h-24 mb-6">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                                <Brain size={32} />
                            </div>
                        </div>
                        <p className="text-slate-800 dark:text-slate-100 font-bold animate-pulse">Analyzing Experience...</p>
                        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">Scanning requirements for {jobTitle}</p>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="h-full flex flex-col items-center justify-center text-center bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30 p-8">
                        <AlertCircle className="text-rose-500 mb-4" size={48} />
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Analysis Failed</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{error}</p>
                        <Button variant="secondary" onClick={runAnalysis}>Try Again</Button>
                    </div>
                )}

                {status === 'SUCCESS' && analysis && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Match Score Card */}
                        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Zap size={80} />
                            </div>
                            <div className="flex justify-between items-end mb-4 relative z-10">
                                <div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Match Strength</span>
                                    <h4 className={`text-5xl font-black ${getScoreColor(analysis.match_score)} m-0 mt-1`}>
                                        {analysis.match_score}%
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                        analysis.match_score >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        {analysis.match_score >= 80 ? 'Strong Contender' : 'Requires Tuning'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed m-0 font-medium">
                                {analysis.verdict}
                            </p>
                        </div>

                        {/* Suggestions */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="text-indigo-500" size={18} />
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider m-0">Bullet Point Rewrites</h4>
                            </div>
                            <div className="space-y-4">
                                {analysis.suggestions.map((s: any, i: number) => (
                                    <div key={i} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                                        <div className="p-3 bg-rose-50/50 dark:bg-rose-900/10 border-b border-rose-100 dark:border-rose-900/20">
                                            <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest m-0">Current</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-through opacity-70 italic">{s.original}</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50/30 dark:bg-emerald-900/10">
                                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest m-0 flex items-center gap-1.5">
                                                Optimization Suggestion <Brain size={10} />
                                            </p>
                                            <p className="text-xs text-slate-800 dark:text-slate-100 mt-1 font-bold leading-relaxed">{s.suggested}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skill Gaps */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="text-rose-500" size={18} />
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider m-0">Top Skill Gaps</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {analysis.gaps.map((gap: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-100 dark:border-rose-900/30">
                                        {gap}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black text-center m-0">
                    Always review system suggestions before updating your resume.
                </p>
            </div>
        </div>
    );
};

export default ResumeFitCheck;
