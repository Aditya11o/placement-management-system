import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Target, Star, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../Card/Card';

interface NextBestActionProps {
    stats: any;
}

const iconMap: any = {
    Briefcase: Briefcase,
    Target: Target,
    Star: Star,
    Zap: Zap
};

/** Heuristic-based action generator */
const getRuleBasedActions = (stats: any) => {
    const actions = [];
    
    if (!stats) return [
        { title: 'Post a Job', description: 'Start your first recruitment drive.', icon: 'Briefcase', link: '/recruiter/jobs' }
    ];

    if (stats.activeJobs === 0) {
        actions.push({ title: 'Post a New Job', description: 'You have no active drives. Create one to find talent.', icon: 'Briefcase', link: '/recruiter/jobs' });
    }
    
    if (stats.pendingApplications > 5) {
        actions.push({ title: 'Review Applications', description: `${stats.pendingApplications} students are waiting for feedback.`, icon: 'Target', link: '/recruiter/applications' });
    }

    if (stats.upcomingInterviews > 0) {
        actions.push({ title: 'Interview Schedule', description: `Prepare for ${stats.upcomingInterviews} interviews today.`, icon: 'Star', link: '/recruiter/interviews' });
    }

    // Default catch-all
    if (actions.length < 2) {
        actions.push({ title: 'System Healthy', description: 'All clear! Keep track of your placement metrics.', icon: 'Zap', link: '/recruiter/dashboard' });
    }

    return actions;
};

const NextBestAction: React.FC<NextBestActionProps> = ({ stats }) => {
    const navigate = useNavigate();
    const actions = getRuleBasedActions(stats);

    return (
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Target size={80} className="text-indigo-600" />
            </div>

            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Target className="text-white w-4 h-4" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 m-0 leading-tight">Action Center</h2>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest m-0">System Recommendations</p>
                </div>
            </div>

            <div className="space-y-3">
                {actions.map((action, idx) => {
                    const Icon = iconMap[action.icon] || Zap;
                    return (
                        <motion.button
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => navigate(action.link)}
                            className="w-full flex items-center gap-4 p-3 rounded-xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all group text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                                <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 m-0 group-hover:text-indigo-600 transition-colors truncate">
                                    {action.title}
                                </h4>
                                <p className="text-xs text-slate-500 m-0 line-clamp-1">
                                    {action.description}
                                </p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-100/50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Deterministic Prioritization</span>
                <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Refresh</button>
            </div>
        </Card>
    );
};

export default NextBestAction;
