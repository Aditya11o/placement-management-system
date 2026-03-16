import React, { useState, useEffect } from 'react';
import { 
    Plus, Video, Layout, Sparkles, Hash, Target, 
    MessageSquare, Activity, Globe, Zap, ArrowRight,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import PrepRoomCard from './components/PrepRoomCard';

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

    const templates = [
        { title: 'Google Technical Practice', topic: 'TECHNICAL', icon: Target, desc: 'DSA & Coding rounds' },
        { title: 'System Design deep-dive', topic: 'SYSTEM_DESIGN', icon: Layout, desc: 'High-level architecture' },
        { title: 'HR & Behavorial Mock', topic: 'BEHAVIORAL', icon: MessageSquare, desc: 'STAR method practice' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 p-4 lg:p-10 bg-slate-50 dark:bg-slate-900/10 min-h-screen">
            
            {/* Immersive Hero Section */}
            <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl bg-slate-900 min-h-[400px] flex items-center p-8 lg:p-20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-slate-900 to-emerald-600/20" />
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Live Collaboration Workspace
                        </motion.div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black text-white m-0 tracking-tighter leading-[0.9] italic">
                            Don't Prep <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Alone.</span>
                        </h1>
                        
                        <p className="text-slate-400 text-lg lg:text-xl mt-8 font-bold leading-relaxed max-w-lg">
                            Join real-time Huddles to solve DSA, brainstorm System Design, or practice mock behaviorals with your peers.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 w-full lg:w-auto">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="px-10 py-8 rounded-[2rem] bg-indigo-600 hover:bg-white hover:text-indigo-600 shadow-2xl shadow-indigo-500/20 font-black text-xl group h-20 uppercase tracking-widest border-none transition-all"
                            onClick={() => setIsCreating(true)}
                        >
                            <Plus className="mr-3 group-hover:rotate-90 transition-transform" strokeWidth={3} /> Launch New Room
                        </Button>
                        <div className="flex items-center justify-center lg:justify-start gap-4 px-6 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <Activity size={14} className="text-indigo-400" /> Currently Active: {rooms.length} Sessions
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-16">
                
                {/* Presence Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 p-8 flex flex-wrap items-center justify-between gap-8 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-300">
                                    {(String.fromCharCode(64 + i))}
                                </div>
                            ))}
                            <div className="w-12 h-12 rounded-2xl border-4 border-white dark:border-slate-900 bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                                +12
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-black text-slate-800 dark:text-white">Active Peers</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live in technical sessions</div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {['All Rooms', 'Technical', 'System Design', 'HR Mock'].map(tab => (
                            <button key={tab} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                tab === 'All Rooms' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                            }`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rooms Grid */}
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tight italic flex items-center gap-4">
                        <Globe className="text-indigo-500" /> Active Huddles
                    </h2>
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1,2,3].map(i => <div key={i} className="h-80 bg-white dark:bg-slate-900 animate-pulse rounded-[2.5rem] border border-slate-100 dark:border-slate-800" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {rooms.map((room) => (
                                <PrepRoomCard 
                                    key={room._id} 
                                    room={room} 
                                    onJoin={handleJoinRoom} 
                                />
                            ))}

                            {/* "Empty" Card for Room Creation CTA */}
                            {rooms.length > 0 && (
                                <motion.div
                                    whileHover={{ scale: 0.98 }}
                                    className="relative rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-indigo-500 transition-colors"
                                    onClick={() => setIsCreating(true)}
                                >
                                    <div className="w-16 h-16 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-6">
                                        <Plus size={32} />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-800 dark:group-hover:text-white transition-colors">Launch Yours</h4>
                                    <p className="text-xs font-bold text-slate-400 mt-2">Set your own topic & goal</p>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {rooms.length === 0 && !loading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
                        >
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-400">
                                <Layout size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight italic uppercase">Quiet in the Vault</h3>
                            <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                                No huddles are active. Be the catalyst—start a room and your peers will join shortly.
                            </p>
                            <Button className="mt-10 px-12 rounded-full h-14 uppercase tracking-widest font-black" onClick={() => setIsCreating(true)}>
                                Start First Session
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Platform Features */}
                <div className="pt-10">
                    <div className="flex items-center gap-6 mb-12">
                         <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase">Workspace Utilities</h2>
                         <div className="flex-1 h-[2px] bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Video, title: 'Encrypted Video', desc: 'Secure P2P communication logic.', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            { icon: Layout, title: 'Collaborative Canvas', desc: 'Shared whiteboards for diagrams.', color: 'text-purple-500', bg: 'bg-purple-50' },
                            { icon: Hash, title: 'Snippets & Code', desc: 'In-room real-time code sharing.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { icon: Activity, title: 'Low Latency', desc: 'Optimized for remote collaboration.', color: 'text-amber-500', bg: 'bg-amber-50' }
                        ].map((feature, i) => (
                            <Card key={i} className="p-10 border-slate-200/60 dark:border-slate-800/60 hover:shadow-2xl hover:-translate-y-2 transition-all rounded-[2.5rem] bg-white dark:bg-slate-900 group">
                                <div className={`w-14 h-14 rounded-2xl ${feature.bg} dark:bg-white/5 flex items-center justify-center ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={28} />
                                </div>
                                <h4 className="font-black text-slate-800 dark:text-white mb-2 text-lg tracking-tight uppercase italic">{feature.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{feature.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Room Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 lg:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                            onClick={() => setIsCreating(false)}
                        />
                        <motion.div 
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-white/20"
                        >
                            {/* Left Side: Creative Hero */}
                            <div className="hidden lg:flex bg-slate-900 p-16 flex-col justify-between relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-emerald-600/20" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-10">
                                        <Zap size={24} />
                                    </div>
                                    <h2 className="text-4xl font-black text-white leading-tight italic uppercase tracking-tighter">
                                        Set the Stage for <br /><span className="text-indigo-400">Success.</span>
                                    </h2>
                                    <p className="text-slate-400 font-bold mt-6 leading-relaxed">
                                        Choose a template or customize your huddle. Rooms with specific titles attract 2x more participants.
                                    </p>
                                </div>
                                
                                <div className="relative z-10 space-y-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quick Templates</div>
                                    {templates.map(t => (
                                        <button 
                                            key={t.title}
                                            onClick={() => setNewRoom({...newRoom, title: t.title, topic: t.topic as any})}
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                    <t.icon size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-white uppercase italic">{t.title}</div>
                                                    <div className="text-[10px] text-slate-500 font-bold">{t.desc}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Form */}
                            <div className="p-10 lg:p-20">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Launch Huddle</h2>
                                    <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                        <X size={24} className="text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateRoom} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Target size={14} className="text-indigo-500" /> Room Identity
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Room Title (e.g. SDE-1 Brainstorming)"
                                            className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-500 font-black text-lg transition-all"
                                            value={newRoom.title}
                                            onChange={e => setNewRoom({...newRoom, title: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Sparkles size={14} className="text-purple-500" /> Topic Concentration
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'TECHNICAL', icon: Target },
                                                { id: 'BEHAVIORAL', icon: MessageSquare },
                                                { id: 'SYSTEM_DESIGN', icon: Layout },
                                                { id: 'HR_CHITCHAT', icon: Hash }
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setNewRoom({...newRoom, topic: t.id as any})}
                                                    className={`px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-2 ${
                                                        newRoom.topic === t.id 
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <t.icon size={16} />
                                                    {t.id.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button isFullWidth type="submit" size="lg" className="h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] bg-slate-900 group">
                                            Rocket Launch <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrepRooms;
