import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, ArrowRight, ShieldAlert, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

interface AIAction {
    id: string;
    title: string;
    description: string;
    type: 'alert' | 'opportunity' | 'success';
    actionLabel: string;
    icon: any;
}

const mockActions: AIAction[] = [
    {
        id: '1',
        title: 'Action Required: Low CS Interview Conversion',
        description: 'AI detected a 15% drop in CS interview conversions week-over-week. Suggestion: Schedule an emergency mock interview drive focusing on System Design.',
        type: 'alert',
        actionLabel: 'Schedule Drive',
        icon: ShieldAlert,
    },
    {
        id: '2',
        title: 'Opportunity: Top Talent Unplaced',
        description: '12 high-GPA students in Mechanical Engineering are still unplaced. Auto-match their profiles with pending core engineering roles?',
        type: 'opportunity',
        actionLabel: 'Auto-Match Profiles',
        icon: Sparkles,
    },
    {
        id: '3',
        title: 'Trend Identified: Rising Cloud Ops Roles',
        description: '3 new companies posted Cloud/DevOps roles today. Notify the pre-final year AWS Certification cohort?',
        type: 'opportunity',
        actionLabel: 'Notify Cohort',
        icon: TrendingUp,
    }
];

const AiActionCenter = () => {
    const [actions, setActions] = useState<AIAction[]>(mockActions);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAction = (id: string) => {
        setProcessingId(id);
        // Simulate API call and success animation
        setTimeout(() => {
            setProcessingId(null);
            setActions(prev => prev.filter(a => a.id !== id));
        }, 1500);
    };

    if (actions.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={32} />
                    <div>
                        <h3 className="text-lg font-bold m-0">All clear!</h3>
                        <p className="text-sm text-slate-500 m-0">No pending AI actions. Your platform is running optimally.</p>
                    </div>
                </div>
                <Sparkles className="text-emerald-500/20" size={48} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-2 px-1">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Lightbulb size={18} className="animate-pulse" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white m-0">
                    Intelligent Action Center
                </h2>
                <div className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700">
                    {actions.length} Pending
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action, index) => {
                    const isProcessing = processingId === action.id;
                    const Icon = action.icon;

                    const colorStyles = action.type === 'alert'
                        ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 hover:border-rose-300 dark:hover:border-rose-800'
                        : 'border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 hover:border-indigo-300 dark:hover:border-indigo-800';

                    const iconStyles = action.type === 'alert'
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white'
                        : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white';

                    return (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                            className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${colorStyles}`}
                        >
                            {/* Decorative background glow */}
                            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 pointer-events-none
                                ${action.type === 'alert' ? 'bg-rose-500' : 'bg-indigo-500'}
                            `} />

                            <div className="relative z-10 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-snug m-0">
                                        {action.title}
                                    </h3>
                                    <div className={`shrink-0 p-2 rounded-xl transition-colors duration-300 ${iconStyles}`}>
                                        <Icon size={18} />
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0 h-16 overflow-hidden">
                                    {action.description}
                                </p>
                            </div>

                            <div className="relative z-10 mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-700/30">
                                <button
                                    onClick={() => handleAction(action.id)}
                                    disabled={isProcessing}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                                        ${action.type === 'alert'
                                            ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-100 dark:border-rose-900'
                                            : 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-100 dark:border-indigo-900'
                                        } disabled:opacity-70 disabled:cursor-wait
                                    `}
                                >
                                    <span className="flex items-center gap-2">
                                        {isProcessing ? (
                                            <>
                                                <Zap className="animate-pulse" size={16} /> Executing AI Task...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} /> {action.actionLabel}
                                            </>
                                        )}
                                    </span>
                                    {!isProcessing && <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AiActionCenter;
