import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import Card from '../../../components/Card/Card';
import { Target, Zap, TrendingUp, Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PredictionData {
    odds: {
        mass: number;
        dream: number;
        superDream: number;
    };
    timeline: {
        daysToReady: number;
        progress: number;
    };
    skillGaps: string[];
}

const PredictiveAnalytics: React.FC = () => {
    const { data: predictor, isLoading } = useQuery({
        queryKey: ['placement-predictor'],
        queryFn: async () => {
            const res = await api.get('/students/placement-predictor');
            return res.data.data as PredictionData;
        }
    });

    if (isLoading) {
        return (
            <Card className="h-full animate-pulse p-6">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-8" />
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                    ))}
                </div>
            </Card>
        );
    }

    const tiers = [
        { key: 'mass', label: 'Mass', color: 'bg-emerald-500', text: 'text-emerald-500', icon: TrendingUp, package: '< 5 LPA' },
        { key: 'dream', label: 'Dream', color: 'bg-indigo-500', text: 'text-indigo-500', icon: Zap, package: '5 - 10 LPA' },
        { key: 'superDream', label: 'Super Dream', color: 'bg-amber-500', text: 'text-amber-500', icon: Target, package: '> 10 LPA' }
    ];

    return (
        <Card border className="h-full p-6 flex flex-col relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Placement Odds</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Tier-based Probability</p>
                </div>
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <TrendingUp size={18} />
                </div>
            </div>

            {/* Odds Bars */}
            <div className="space-y-5 mb-8 relative z-10">
                {tiers.map((tier) => (
                    <div key={tier.key}>
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${tier.color}/10 ${tier.text}`}>
                                    <tier.icon size={12} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tier.label}</span>
                                <span className="text-[9px] font-bold text-slate-400 opacity-60">({tier.package})</span>
                            </div>
                            <span className={`text-xs font-black ${tier.text}`}>{predictor?.odds[tier.key as keyof typeof predictor.odds] || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${predictor?.odds[tier.key as keyof typeof predictor.odds] || 0}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${tier.color} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Timeline Segment */}
            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
                        <Calendar size={18} className="text-indigo-500" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness Timeline</span>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                {predictor?.timeline.daysToReady === 0 ? 'ELITE READY' : `${predictor?.timeline.daysToReady} DAYS LEFT`}
                            </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {predictor?.timeline.daysToReady === 0 
                                ? 'You are peaking for Super Dream roles!' 
                                : `Targeting Dream roles by next month.`}
                        </h4>
                    </div>
                </div>
                
                {predictor?.skillGaps && predictor.skillGaps.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {predictor.skillGaps.map(skill => (
                            <span key={skill} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <AlertCircle size={10} className="text-amber-500" />
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                <button className="w-full mt-6 flex items-center justify-between p-4 bg-slate-900 dark:bg-white rounded-2xl group/btn overflow-hidden relative">
                    <div className="relative z-10 flex flex-col items-start translate-x-0 group-hover/btn:translate-x-2 transition-transform duration-300">
                        <span className="text-[10px] font-black text-white/50 dark:text-slate-400 uppercase tracking-[0.2em]">Upgrade Profile</span>
                        <span className="text-xs font-black text-white dark:text-slate-900 uppercase tracking-widest">Gap Analysis Report</span>
                    </div>
                    <ChevronRight size={18} className="text-white dark:text-slate-900 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                </button>
            </div>
        </Card>
    );
};

export default PredictiveAnalytics;
