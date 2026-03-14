import React from 'react';
import { motion } from 'framer-motion';
import { 
    Trophy, ArrowUpRight, CheckCircle2, 
    AlertCircle, Sparkles, TrendingUp,
    Shield
} from 'lucide-react';
import Card from '../Card/Card';
import Button from '../Button/Button';

interface Recommendation {
    task: string;
    points: number;
    category: 'PROFILE' | 'PREP' | 'ENGAGEMENT';
}

interface ReadinessMeterProps {
    score: number;
    label: string;
    recommendations: Recommendation[];
}

const ReadinessMeter: React.FC<ReadinessMeterProps> = ({ score, label, recommendations }) => {
    // Circle math
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getStatusColor = () => {
        if (score > 85) return 'text-emerald-500';
        if (score > 70) return 'text-indigo-500';
        if (score > 40) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getStatusBg = () => {
        if (score > 85) return 'bg-emerald-50';
        if (score > 70) return 'bg-indigo-50';
        if (score > 40) return 'bg-amber-50';
        return 'bg-rose-50';
    };

    return (
        <Card className="flex flex-col h-full bg-white dark:bg-slate-900 border-none shadow-xl shadow-indigo-100/20 dark:shadow-none p-0 overflow-hidden rounded-[2.5rem]">
            {/* Upper Section with Meter */}
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={16} /> Readiness Status
                    </h3>
                    <div className={`px-4 py-1.5 rounded-full ${getStatusBg()} ${getStatusColor()} text-[10px] font-black uppercase tracking-widest`}>
                        {label}
                    </div>
                </div>

                <div className="relative flex justify-center py-6">
                    {/* Background Circle */}
                    <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-slate-100 dark:text-slate-800"
                        />
                        <motion.circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={getStatusColor()}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter"
                        >
                            {score}%
                        </motion.span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready</span>
                    </div>
                </div>
            </div>

            {/* Recommendations / Roadmap */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-8 pt-6">
                <div className="mb-6 flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        Improvement roadmap
                    </h4>
                    <Sparkles size={14} className="text-amber-400" />
                </div>

                <div className="space-y-3">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group flex items-center gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center shrink-0">
                                    <ArrowUpRight size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 m-0 truncate group-hover:text-indigo-600 transition-colors">
                                        {rec.task}
                                    </p>
                                </div>
                                <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                                    +{rec.points}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-6 text-center italic text-slate-400 text-xs font-medium">
                            <Trophy className="mx-auto mb-3 text-amber-400" size={24} />
                            You are at maximum readiness!
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center italic font-black text-sm">
                        Q1
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0 mb-0.5">Current Phase</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 m-0 leading-tight">Foundation & Profile</p>
                    </div>
                    <Button variant="ghost" size="sm" className="p-2 h-auto text-indigo-600">
                        <Shield size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ReadinessMeter;
