import React from 'react';
import { Award, Zap, MessageCircle, ShieldCheck, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../Card/Card';

interface Badge {
    type: string;
    earned_at: string;
}

interface BadgeSectionProps {
    badges: Badge[];
}

const badgeConfig: Record<string, { label: string; description: string; color: string; icon: any }> = {
    INSIGHT_GURU: {
        label: 'Insight Guru',
        description: 'Shared 5+ interview experiences',
        color: 'from-purple-500 to-indigo-600',
        icon: MessageCircle
    },
    PROFILE_PRO: {
        label: 'Profile Pro',
        description: 'Completed 100% of profile profile',
        color: 'from-emerald-500 to-teal-600',
        icon: ShieldCheck
    },
    STREAK_MASTER: {
        label: 'Streak Master',
        description: 'Maintained a 7-day prep streak',
        color: 'from-orange-500 to-rose-600',
        icon: Zap
    }
};

const BadgeSection: React.FC<BadgeSectionProps> = ({ badges }) => {
    return (
        <Card className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                <Award className="text-amber-500" size={24} />
                <h2 className="text-lg m-0 font-bold">Achievements & Badges</h2>
            </div>

            {badges.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Target size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">Earn badges by sharing insights and completing your profile.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {badges.map((badge, idx) => {
                        const config = badgeConfig[badge.type];
                        if (!config) return null;
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col items-center group relative"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                                    <Icon className="text-white w-8 h-8" />
                                    
                                    {/* Action Overlay */}
                                    <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                                        <button 
                                            className="w-full py-1 bg-white text-slate-900 text-[8px] font-black uppercase rounded hover:bg-indigo-50 transition-colors"
                                            onClick={() => {
                                                const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
                                                window.open(url, '_blank');
                                            }}
                                        >
                                            LinkedIn
                                        </button>
                                        <button 
                                            className="w-full py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded hover:bg-indigo-700 transition-colors"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`<a href="${window.location.origin}" target="_blank"><img src="${config.icon}" alt="${config.label}" /></a>`);
                                                alert('Embed code copied!');
                                            }}
                                        >
                                            Embed
                                        </button>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-800 mt-2 text-center">{config.label}</span>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

export default BadgeSection;
