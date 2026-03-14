import React, { useState, useEffect } from 'react';
import { Users, Plus, Clock, Video, Layout, Sparkles, Hash, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';

interface PrepRoom {
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
}

const PrepRooms: React.FC = () => {
    const [rooms, setRooms] = useState<PrepRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newRoom, setNewRoom] = useState({ title: '', topic: 'TECHNICAL', max_participants: 5 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/students/prep-rooms');
            setRooms(res.data.data);
        } catch (err) {
            console.error('Error fetching rooms:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/students/prep-rooms', newRoom);
            navigate(`/student/prep-rooms/${res.data.data._id}`);
        } catch (err) {
            console.error('Error creating room:', err);
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        try {
            await api.post(`/students/prep-rooms/${roomId}/join`);
            navigate(`/student/prep-rooms/${roomId}`);
        } catch (err) {
            console.error('Error joining room:', err);
        }
    };

    const topicColors: Record<string, string> = {
        TECHNICAL: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400',
        BEHAVIORAL: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
        SYSTEM_DESIGN: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400',
        HR_CHITCHAT: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400'
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-900/40">
            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Sparkles size={12} />
                        <span>Real-time Collaboration</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">Collaborative Prep Rooms</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Don't study alone. Join a virtual room to practice mock interviews, 
                        brainstorm system design, or whiteboard technical problems with your peers.
                    </p>
                </div>
                <Button 
                    size="lg" 
                    className="h-16 px-8 rounded-2xl shadow-2xl shadow-indigo-200 dark:shadow-none font-black text-lg group"
                    onClick={() => setIsCreating(true)}
                >
                    <Plus className="mr-2 group-hover:rotate-90 transition-transform" /> Create Private Room
                </Button>
            </div>

            {/* Create Room Modal/Overlay */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Create Prep Room</h2>
                                <form onSubmit={handleCreateRoom} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Room Title</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Amazon L4 Technical Prep"
                                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                                            value={newRoom.title}
                                            onChange={e => setNewRoom({...newRoom, title: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Focus Topic</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'HR_CHITCHAT'].map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setNewRoom({...newRoom, topic: t as any})}
                                                    className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${
                                                        newRoom.topic === t 
                                                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'
                                                    }`}
                                                >
                                                    {t.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button variant="ghost" isFullWidth onClick={() => setIsCreating(false)}>Cancel</Button>
                                        <Button isFullWidth type="submit">Launch Room</Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rooms Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <motion.div
                            key={room._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                        >
                            <Card className="p-0 overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl h-full flex flex-col group">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${topicColors[room.topic]}`}>
                                            {room.topic}
                                        </div>
                                        <div className="flex -space-x-2">
                                            {room.participants.length > 0 && [...Array(Math.min(room.participants.length, 3))].map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                    P{i+1}
                                                </div>
                                            ))}
                                            {room.participants.length > 3 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">
                                                    +{room.participants.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {room.title}
                                    </h3>
                                    
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-400 mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={16} />
                                            <span>{room.participants.length} / {room.max_participants}</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} />
                                            <span>{new Date(room.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                                            {room.host.profile_image_url ? (
                                                <img src={room.host.profile_image_url} alt={room.host.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-black text-slate-300">{room.host.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">Host</div>
                                            <div className="text-xs font-black text-slate-700 dark:text-slate-200">{room.host.name}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto p-2 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                                    <Button 
                                        isFullWidth 
                                        className="rounded-2xl font-black h-12"
                                        onClick={() => handleJoinRoom(room._id)}
                                        disabled={room.participants.length >= room.max_participants}
                                    >
                                        {room.participants.length >= room.max_participants ? 'Room Full' : 'Join Session'}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    {rooms.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Layout size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">No Active Rooms</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Be the first to start a collaboration session and invite your batchmates.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Tips */}
            <div className="mt-20">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Features of Prep Rooms</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Video, title: 'Video Calls', desc: 'Secure audio/video calling within the browser.' },
                        { icon: Layout, title: 'Shared Whiteboard', desc: 'Solve system design problems on a mutual canvas.' },
                        { icon: Hash, title: 'Session Chat', desc: 'Exchange links and snippets in real-time.' },
                        { icon: Target, title: 'Industry Topics', desc: 'Focused rooms for Tech, HR, or System Design.' }
                    ].map((feature, i) => (
                        <Card key={i} className="p-6 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all rounded-3xl">
                            <feature.icon className="text-indigo-600 mb-4" size={28} />
                            <h4 className="font-black text-slate-800 dark:text-white mb-2">{feature.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal">{feature.desc}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrepRooms;
