import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Sparkles, User, GraduationCap, 
    ChevronRight, ExternalLink, Zap, 
    CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import Button from '../Button/Button';
import Card from '../Card/Card';

interface Candidate {
    student: {
        _id: string;
        name: string;
        email: string;
        branch: string;
        cgpa: number;
        skills: string[];
    };
    matchScore: number;
    matchReason: string;
}

interface CandidateMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    jobTitle: string;
}

const CandidateMatchModal = ({ isOpen, onClose, jobId, jobTitle }: CandidateMatchModalProps) => {
    const { data: candidates = [], isLoading, error } = useQuery<Candidate[]>({
        queryKey: ['candidateMatches', jobId],
        queryFn: async () => {
            const res = await api.get(`/analytics/match-candidates/${jobId}`);
            return res.data.data || [];
        },
        enabled: isOpen && !!jobId
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white m-0 tracking-tight">Talent Matching Engine</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 m-0">Top candidates for <span className="text-indigo-600 dark:text-indigo-400 font-bold">{jobTitle}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-indigo-600 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                                        <Sparkles size={24} className="animate-pulse" />
                                    </div>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Calculating candidate suitability...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                                <AlertCircle size={48} className="text-rose-500 opacity-50" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Analysis Failed</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm">We couldn't generate matches at this time. Please try again later.</p>
                            </div>
                        ) : candidates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                                <Zap size={48} className="text-amber-500 opacity-50" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Precise Matches</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm">No candidates currently meet the hard eligibility requirements for this graduation year and branch.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {candidates.map((candidate, idx) => (
                                    <motion.div
                                        key={candidate.student._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className="p-5 h-full border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex flex-col group relative overflow-hidden" hoverable>
                                            {/* Match Score Badge */}
                                            <div className="absolute top-0 right-0 p-4">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-2xl font-black ${candidate.matchScore >= 80 ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                                        {candidate.matchScore}%
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-70">Match Score</span>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                    <User size={24} />
                                                </div>
                                                <div className="flex-1 pr-12">
                                                    <h3 className="text-[17px] font-bold text-slate-900 dark:text-white m-0 tracking-tight leading-tight">{candidate.student.name}</h3>
                                                    <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400">
                                                        <GraduationCap size={14} className="shrink-0" />
                                                        <span className="text-xs font-semibold uppercase tracking-wider truncate">{candidate.student.branch} • {candidate.student.cgpa} CGPA</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 mb-4 flex-1">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <CheckCircle2 size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Why it's a match</span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                    "{candidate.matchReason}"
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => window.open(`/admin/students?id=${candidate.student._id}`, '_blank')}
                                                    className="flex-1 py-2 px-4 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Full Profile <ExternalLink size={12} />
                                                </button>
                                                <button className="py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/btn">
                                                    Invite <ChevronRight size={14} className="inline ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Sparkles size={12} className="text-indigo-500" />
                            Heuristic Based Suggestions
                         </div>
                         <Button variant="secondary" onClick={onClose}>Close Matcher</Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CandidateMatchModal;
