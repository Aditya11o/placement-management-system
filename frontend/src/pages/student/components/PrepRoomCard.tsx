import React, { memo } from 'react';
import { 
    ArrowRight,
    Video,
    Layout,
    Hash,
    Target,
    Clock,
    Shield
} from 'lucide-react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { motion } from 'framer-motion';

interface PrepRoomCardProps {
    room: {
        _id: string;
        title: string;
        host: {
            _id: string;
            name: string;
            profile_image_url: string;
        };
        topic: 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'HR_CHITCHAT';
        participants: string[];
        max_participants: number;
        created_at: string;
    };
    onJoin: (roomId: string) => void;
}

const PrepRoomCard: React.FC<PrepRoomCardProps> = memo(({ room, onJoin }) => {
    const isFull = room.participants.length >= room.max_participants;

    const topicConfig = {
        TECHNICAL: { color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: Target },
        BEHAVIORAL: { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: Shield },
        SYSTEM_DESIGN: { color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', icon: Layout },
        HR_CHITCHAT: { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: Hash }
    }[room.topic];

    const TopicIcon = topicConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="p-0 overflow-hidden border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] h-full flex flex-col group bg-white dark:bg-slate-900">
                <div className="p-8">
                    {/* Header: Topic & Live Status */}
                    <div className="flex items-center justify-between mb-8">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${topicConfig.bg} ${topicConfig.color} border border-current opacity-80`}>
                            <TopicIcon size={12} />
                            {room.topic.replace('_', ' ')}
                        </div>
                        
                        {!isFull && (
                            <div className="flex items-center gap-1.5 text-emerald-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                            </div>
                        )}
                    </div>

                    {/* Room Info */}
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors italic">
                        {room.title}
                    </h3>

                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-indigo-500" />
                            {new Date(room.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="flex items-center gap-1.5">
                            <Video size={12} className="text-purple-500" />
                            HD Active
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center justify-between mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="flex -space-x-3">
                            {room.participants.length > 0 ? (
                                room.participants.slice(0, 4).map((_, i) => (
                                    <div key={i} className="w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-900 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-black text-white shadow-lg">
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))
                            ) : (
                                <div className="w-10 h-10 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                                    ?
                                </div>
                            )}
                            {room.participants.length > 4 && (
                                <div className="w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-900 bg-slate-900 text-white flex items-center justify-center text-[10px] font-black z-10 shadow-lg">
                                    +{room.participants.length - 4}
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Capacity</div>
                            <div className={`text-sm font-black ${isFull ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                                {room.participants.length} / {room.max_participants}
                            </div>
                        </div>
                    </div>

                    {/* Host Meta */}
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 dark:border-slate-700">
                            {room.host.profile_image_url ? (
                                <img src={room.host.profile_image_url} alt={room.host.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                room.host.name.charAt(0)
                            )}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">
                            Hosted by <span className="text-slate-900 dark:text-slate-200 font-black">{room.host.name}</span>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="mt-auto p-2 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                        isFullWidth 
                        onClick={() => onJoin(room._id)}
                        disabled={isFull}
                        className={`rounded-2xl font-black h-14 uppercase tracking-widest ${
                            isFull 
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' 
                            : 'bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-500/10'
                        }`}
                    >
                        {isFull ? 'Session Occupied' : 'Join Huddle'}
                        {!isFull && <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />}
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
});

PrepRoomCard.displayName = 'PrepRoomCard';

export default PrepRoomCard;
