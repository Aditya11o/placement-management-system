import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, Zap, ChevronRight } from 'lucide-react';
import Card from '../Card/Card';

interface Insight {
    title: string;
    description: string;
    type: 'trend' | 'warning' | 'opportunity';
}

interface AiStrategicInsightsProps {
    data: {
        summary: string;
        insights: Insight[];
        recommendations: string[];
    } | null;
    isLoading: boolean;
}

const AiStrategicInsights = ({ data, isLoading }: AiStrategicInsightsProps) => {
    if (isLoading) {
        return (
            <Card className="p-8 border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-slate-900 relative overflow-hidden h-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg animate-pulse" />
                    <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                    <div className="h-4 w-full bg-slate-50 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-50 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-20 w-full bg-slate-50 dark:bg-slate-800 rounded animate-pulse" />
                </div>
            </Card>
        );
    }

    if (!data) return null;

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
            case 'opportunity': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            default: return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={16} />;
            case 'opportunity': return <Zap size={16} />;
            default: return <TrendingUp size={16} />;
        }
    };

    return (
        <Card className="p-8 border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-slate-900 relative overflow-hidden group h-full">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white m-0 tracking-tight">AI Strategic Insights</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gemini Intelligence Engine</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-6">
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                    "{data.summary}"
                </p>

                <div className="space-y-3">
                    {data.insights.map((insight, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-xl border ${getTypeStyles(insight.type)} flex flex-col gap-1`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {getIcon(insight.type)}
                                <span className="text-xs font-black uppercase tracking-tight">{insight.title}</span>
                            </div>
                            <p className="text-sm font-medium opacity-90">{insight.description}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Strategic Recommendations</h4>
                    <div className="space-y-3">
                        {data.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex gap-3 items-start group/rec">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 group-hover/rec:scale-125 transition-transform" />
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-snug">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    Deep Data Analysis <ChevronRight size={14} />
                </button>
            </div>
        </Card>
    );
};

export default AiStrategicInsights;
