import React, { useState } from 'react';
import { Sparkles, ArrowRight, Brain, UserCheck, ChevronRight, X, RotateCcw, Play, CheckCircle2 } from 'lucide-react';
import { aiService, InterviewQuestions } from '../../services/aiService';
import Button from '../Button/Button';
import { motion, AnimatePresence } from 'framer-motion';
import ProfessionalInterviewSim from './ProfessionalInterviewSim';

interface InterviewSimulatorProps {
    jobTitle: string;
    jobDescription?: string;
    skills?: string[];
    onClose: () => void;
}

const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ jobTitle, jobDescription, skills, onClose }) => {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'PRACTICING' | 'FINISHED'>('IDLE');
    const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
    const [currentCategory, setCurrentCategory] = useState<'technical' | 'behavioral'>('technical');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isHighStakes, setIsHighStakes] = useState(false);
    const [showHighStakesSim, setShowHighStakesSim] = useState(false);

    const startSession = async () => {
        setStatus('LOADING');
        try {
            const data = await aiService.generateMockInterview({ title: jobTitle, description: jobDescription, skills });
            setQuestions(data);
            setStatus('PRACTICING');
            setCurrentCategory('technical');
            setCurrentIdx(0);
        } catch (err) {
            console.error(err);
            setStatus('IDLE');
        }
    };

    const handleNext = () => {
        if (!questions) return;

        if (currentIdx < 4) {
            setCurrentIdx(prev => prev + 1);
        } else if (currentCategory === 'technical') {
            setCurrentCategory('behavioral');
            setCurrentIdx(0);
        } else {
            setStatus('FINISHED');
        }
    };

    const currentQuestion = questions ? questions[currentCategory][currentIdx] : '';
    const totalQuestions = 10;
    const answeredCount = status === 'FINISHED' ? 10 : (currentCategory === 'technical' ? currentIdx : 5 + currentIdx);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0">AI Interview Sim</h3>
                        <p className="text-xs text-slate-500 m-0 font-medium">Practicing for: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{jobTitle}</span></p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {status === 'IDLE' && (
                        <motion.div 
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center max-w-md"
                        >
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                                <Play size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4">Master Your Interview</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                Our AI will generate 5 technical and 5 behavioral questions tailored specifically to this job role. Ready to practice?
                            </p>
                            <Button size="lg" className="w-full shadow-xl shadow-indigo-200/50 dark:shadow-none font-bold" onClick={startSession}>
                                Start AI Session <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {status === 'LOADING' && (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <div className="relative w-24 h-24 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                                    <Brain size={32} className="animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">AI is Analyzing Job Data</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Crafting high-relevance interview questions...</p>
                        </motion.div>
                    )}

                    {status === 'PRACTICING' && !showHighStakesSim && (
                        <motion.div 
                            key="practicing"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full max-w-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        currentCategory === 'technical' 
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    }`}>
                                        {currentCategory} Round
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">Question {currentIdx + 1} of 5</span>
                                </div>
                                <div className="text-xs font-bold text-slate-500">
                                    Overall Progress: {Math.round((answeredCount / totalQuestions) * 100)}%
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                {currentCategory === 'technical' ? (
                                    <Brain className="absolute -right-8 -bottom-8 text-indigo-500/5 rotate-12" size={160} />
                                ) : (
                                    <UserCheck className="absolute -right-8 -bottom-8 text-emerald-500/5 -rotate-12" size={160} />
                                )}
                                
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug relative z-10 m-0">
                                    "{currentQuestion}"
                                </p>
                            </div>

                            <div className="mt-8 mb-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-12 h-6 rounded-full relative transition-colors ${isHighStakes ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isHighStakes ? 'left-7' : 'left-1'}`} />
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isHighStakes} onChange={() => setIsHighStakes(!isHighStakes)} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">High-Stakes Video Mode</span>
                                        <span className="text-[10px] font-medium text-slate-500">Enable AI video analysis & STAR coaching</span>
                                    </div>
                                    {isHighStakes && <Sparkles size={16} className="text-indigo-500 animate-pulse" />}
                                </label>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/10 h-32 flex flex-col justify-between">
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 m-0 uppercase flex items-center gap-2">
                                        <Brain size={12} /> Pro Tip
                                    </p>
                                    <p className="text-[13px] text-slate-600 dark:text-slate-400 italic font-medium leading-relaxed">
                                        {currentCategory === 'technical' 
                                            ? "Explain your thought process step-by-step. Don't just give the final answer."
                                            : "Use the STAR method (Situation, Task, Action, Result) for this response."}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 shrink-0">
                                    {isHighStakes ? (
                                        <Button size="lg" className="px-10 h-auto font-black shrink-0 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" onClick={() => setShowHighStakesSim(true)}>
                                            Enter Video Sim <ChevronRight className="ml-2" />
                                        </Button>
                                    ) : (
                                        <Button size="lg" className="px-10 h-auto font-black shrink-0" onClick={handleNext}>
                                            Next Question <ChevronRight className="ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'PRACTICING' && showHighStakesSim && (
                        <div className="fixed inset-0 z-[100] bg-black">
                            <ProfessionalInterviewSim 
                                jobTitle={jobTitle}
                                question={currentQuestion}
                                onClose={() => {
                                    setShowHighStakesSim(false);
                                    handleNext();
                                }}
                            />
                        </div>
                    )}

                    {status === 'FINISHED' && (
                        <motion.div 
                            key="finished"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center max-w-md"
                        >
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">Practice Complete!</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                Great job! You've successfully practiced 10 high-relevance questions. Consistent practice is the secret to getting placed.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="secondary" className="w-full font-bold" onClick={startSession}>
                                    <RotateCcw size={16} className="mr-2" /> Repeat
                                </Button>
                                <Button variant="primary" className="w-full font-bold" onClick={onClose}>
                                    Close Sim
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom progress bar */}
            {status !== 'IDLE' && status !== 'LOADING' && (
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    />
                </div>
            )}
        </div>
    );
};

export default InterviewSimulator;
