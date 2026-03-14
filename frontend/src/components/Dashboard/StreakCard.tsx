import React from 'react';
import { Flame, Star, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../Card/Card';

interface StreakCardProps {
    streak: number;
    longest: number;
    points: number;
}

const StreakCard: React.FC<StreakCardProps> = ({ streak, longest, points }) => {
    return (
        <Card className="relative overflow-hidden border-orange-100 bg-gradient-to-br from-orange-50/50 to-white">
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none rotate-12">
                <Flame size={120} className="text-orange-500" />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
                        <Flame className="text-white w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 m-0">Prep Streak</h2>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest m-0">Daily Momentum</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500 justify-end">
                        <Star size={14} className="fill-amber-500" />
                        <span className="text-sm font-black">{points} XP</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-4xl font-black text-slate-900 leading-none">{streak}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Current Days</span>
                </div>
                
                <div className="h-10 w-px bg-slate-200" />

                <div className="flex flex-col">
                    <span className="text-xl font-bold text-slate-800 leading-none">{longest}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Best Streak</span>
                </div>
            </div>

            <div className="mt-6 flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                            i < (streak % 8) ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'bg-slate-100'
                        }`} 
                    />
                ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-3">
                {streak === 0 ? "Start your journey today!" : `${7 - (streak % 7)} days until next milestone`}
            </p>
        </Card>
    );
};

export default StreakCard;
