import React, { memo } from 'react';
import { 
    Briefcase,
    Zap, 
    ArrowRight,
    Search,
    Brain,
    Trophy,
    CheckCircle2
} from 'lucide-react';
import Card from '../../../components/Card/Card';
import { motion } from 'framer-motion';

interface PrepKitCardProps {
    company: {
        id: string;
        name: string;
        slug: string;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        kitsCount: number;
        icon?: string;
    };
    onClick: (company: string) => void;
}

const PrepKitCard: React.FC<PrepKitCardProps> = memo(({ company, onClick }) => {
    // Dynamic styles based on difficulty
    const difficultyConfig = {
        Easy: { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
        Medium: { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
        Hard: { color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20' }
    }[company.difficulty];

    // Mock topics for visual flair
    const topics = ['DSA', 'System Design', 'HR Behavioral'];

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card 
                border 
                className="group p-6 !bg-white/70 dark:!bg-slate-800/70 hover:!bg-white dark:hover:!bg-slate-800 border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-xl transition-all h-full flex flex-col cursor-pointer"
                onClick={() => onClick(company.name)}
            >
                {/* Logo & Category */}
                <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        <Briefcase size={28} className="group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${difficultyConfig.border} ${difficultyConfig.bg} ${difficultyConfig.color}`}>
                        {company.difficulty}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                        {company.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        <Zap size={12} className="text-amber-500" /> {company.kitsCount}+ Success Stories
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                        {topics.map(topic => (
                            <span key={topic} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                        <CheckCircle2 size={12} /> AI Optimized
                    </div>
                    <button className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest group-hover:gap-4 transition-all">
                        Master Kit <ArrowRight size={14} />
                    </button>
                </div>
            </Card>
        </motion.div>
    );
});

PrepKitCard.displayName = 'PrepKitCard';

export default PrepKitCard;
