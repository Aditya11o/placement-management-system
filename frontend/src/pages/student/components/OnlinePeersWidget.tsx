import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import Card from '../../Card/Card';
import { Users, Video, MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnlinePeer {
    _id: string;
    name: string;
    branch: string;
    skills: string[];
    profile_image_url?: string;
}

const OnlinePeersWidget: React.FC = () => {
    const { data: onlinePeers, isLoading } = useQuery({
        queryKey: ['online-peers'],
        queryFn: async () => {
            const res = await api.get('/students/online-peers');
            return res.data.data as OnlinePeer[];
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <Card className="h-full flex flex-col p-6 animate-pulse">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card border className="h-full flex flex-col p-6 overflow-hidden relative group">
            {/* Ambient Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Users size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Online Pairs</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Active Preppers</p>
                    </div>
                </div>
                {onlinePeers && onlinePeers.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{onlinePeers.length} LIVE</span>
                    </motion.div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1 relative z-10">
                {onlinePeers && onlinePeers.length > 0 ? (
                    onlinePeers.map((peer) => (
                        <motion.div 
                            key={peer._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all duration-300 group/item"
                        >
                            <div className="relative">
                                <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm overflow-hidden">
                                    {peer.profile_image_url ? (
                                        <img src={peer.profile_image_url} alt={peer.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-sm">
                                            {peer.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                                    {peer.name}
                                    {peer.skills.includes('React') && <Sparkles size={10} className="text-amber-400" />}
                                </h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{peer.branch}</p>
                            </div>

                            <div className="hidden group-hover/item:flex items-center gap-1">
                                <button className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-110 transition-all">
                                    <Video size={14} />
                                </button>
                                <button className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:scale-110 transition-all">
                                    <MessageSquare size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                        <Users size={32} className="text-slate-300 mb-3" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No peers online</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                <button className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-none">
                    Start Prep Group
                </button>
            </div>
        </Card>
    );
};

export default OnlinePeersWidget;
