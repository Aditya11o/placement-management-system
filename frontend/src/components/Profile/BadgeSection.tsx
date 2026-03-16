import React from 'react';
import { Award, Zap, MessageCircle, ShieldCheck, Target, Share2, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../Card/Card';

interface Badge {
    type: string;
    earned_at: string;
}

interface BadgeSectionProps {
    badges: Badge[];
}

const badgeConfig: Record<string, { label: string; description: string; color: string; icon: any; shadow: string }> = {
    INSIGHT_GURU: {
        label: 'Insight Guru',
        description: 'Elite Interview Knowledge Sharer',
        color: 'from-purple-600 to-indigo-700',
        shadow: 'shadow-indigo-500/40',
        icon: MessageCircle
    },
    PROFILE_PRO: {
        label: 'Identity Pro',
        description: '100% Comprehensive Career Profile',
        color: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/40',
        icon: ShieldCheck
    },
    STREAK_MASTER: {
        label: 'Consistency King',
        description: 'Advanced 7-Day Performance Streak',
        color: 'from-amber-400 to-orange-600',
        shadow: 'shadow-amber-500/40',
        icon: Zap
    }
};

const BadgeSection: React.FC<BadgeSectionProps> = ({ badges }) => {
    return (
        <Card className="col-span-1 lg:col-span-12 p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden group">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                <Award className="text-amber-500" size={24} />
                <h2 className="text-2xl m-0 font-black italic tracking-tight uppercase">Credential <br />Achievements.</h2>
            </div>

            {badges.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <Target size={48} className="mb-4 text-slate-200" />
                    <h4 className="text-sm font-black italic uppercase tracking-widest text-slate-400">Zero Achievement Anomalies</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-2 italic">Contribute insights or complete milestones to unlock digital credentials.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {badges.map((badge, idx) => {
                        const config = badgeConfig[badge.type];
                        if (!config) return null;
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.1, type: "spring" }}
                                className="flex flex-col items-center group/item relative"
                            >
                                <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${config.color} ${config.shadow} flex items-center justify-center shadow-2xl group-hover/item:scale-110 group-hover/item:-rotate-12 transition-all duration-500 relative overflow-hidden group/badge`}>
                                    <Icon className="text-white w-10 h-10 group-hover/item:scale-125 transition-transform" />
                                    
                                    {/* Glassmorphic Action Overlay */}
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md opacity-0 group-hover/badge:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                                        <button 
                                            className="w-full py-2 bg-white text-slate-900 text-[8px] font-black uppercase rounded-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                            onClick={() => {
                                                const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
                                                window.open(url, '_blank');
                                            }}
                                        >
                                            <Linkedin size={10} /> Career Network
                                        </button>
                                        <button 
                                            className="w-full py-2 bg-white/20 text-white text-[8px] font-black uppercase rounded-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`Badge Earned: ${config.label} (${badge.type})`);
                                                // Assuming a toast context could be used if available, but for now just copying text
                                            }}
                                        >
                                            <Share2 size={10} /> Copy Meta
                                        </button>
                                    </div>
                                    
                                    {/* Shimmer Effect */}
                                    <div className="absolute top-0 -left-full w-1/2 h-full bg-white/20 skew-x-[-20deg] group-hover/item:left-[150%] transition-all duration-1000" />
                                </div>
                                <div className="text-center mt-4 space-y-1">
                                    <div className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">{config.label}</div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{config.description}</div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

export default BadgeSection;
