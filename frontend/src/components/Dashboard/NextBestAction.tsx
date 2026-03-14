import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Target, Star, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { aiService } from '../../services/aiService';
import Card from '../Card/Card';

interface NextBestActionProps {
    stats: any;
}

const iconMap = {
    Briefcase: Briefcase,
    Target: Target,
    Star: Star,
    Zap: Zap
};

const NextBestAction: React.FC<NextBestActionProps> = ({ stats }) => {
    const navigate = useNavigate();
    
    const { data: actions = [], isLoading } = useQuery({
        queryKey: ['nextActions', stats],
        queryFn: () => aiService.getNextActions(stats),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    if (isLoading) {
        return (
            <Card className="border-indigo-100 bg-indigo-50/20">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-indigo-500 w-5 h-5" />
                    <h2 className="text-lg font-bold text-slate-800 m-0">AI Next Steps</h2>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    if (actions.length === 0) return null;

    return (
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles size={80} className="text-indigo-600" />
            </div>

            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Sparkles className="text-white w-4 h-4" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 m-0 leading-tight">AI Navigator</h2>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest m-0">Personalized for you</p>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Powered by Gemini AI</span>
                <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Refresh Actions</button>
            </div>
        </Card>
    );
};

export default NextBestAction;
