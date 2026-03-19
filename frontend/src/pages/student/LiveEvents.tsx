import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { 
    Calendar, 
    Clock, 
    Search, 
    Zap, 
    TrendingUp, 
    Award, 
    ShieldCheck, 
    ChevronRight, 
    ArrowRight, 
    Play, 
    Star,
    Users
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { isPast } from 'date-fns';
import EmptyState from '../../components/EmptyState/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import EventIdentityCard from './components/EventIdentityCard';

interface Event {
    _id: string;
    title: string;
    description: string;
    type: 'WEBINAR' | 'PPT' | 'DRIVE' | 'WORKSHOP';
    startTime?: string;
    link: string;
    company_name: string;
    attendees?: string[];
}

const LiveEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const { addToast } = useToast();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data?.data || []);
        } catch (error) {
            addToast('Failed to load events', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinEvent = async (eventId: string, link: string) => {
        try {
            await api.post(`/events/${eventId}/join`);
            addToast('Registered for event! Opening link...', 'success');
            setTimeout(() => {
                if (link) window.open(link, '_blank');
            }, 1000);
            fetchEvents(); // Refresh attendee count
        } catch (error: any) {
            if (error.response?.data?.message === 'Already joined this event') {
                if (link) window.open(link, '_blank');
            } else {
                addToast('Failed to register', 'error');
            }
        }
    };

    const eventTypes = ['All', 'WEBINAR', 'PPT', 'DRIVE', 'WORKSHOP'];

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             e.company_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'All' || e.type === selectedType;
        return matchesSearch && matchesType;
    });

    const liveEventsCount = events.filter(e => e.startTime ? (isPast(new Date(e.startTime)) && (new Date().getTime() - new Date(e.startTime).getTime()) < 7200000) : false).length;

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 p-4 lg:p-10 bg-slate-50 dark:bg-slate-900/10 min-h-screen">
            
            {/* Immersive Event Hero Marquee */}
            <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl bg-slate-900 min-h-[450px] flex items-center p-8 lg:p-20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-slate-900 to-amber-600/20" />
                <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-amber-500 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-3xl text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-xl"
                        >
                            <Zap size={14} className="text-amber-400 animate-pulse" />
                            Live Opportunity Hub
                        </motion.div>
                        
                        <h1 className="text-6xl lg:text-8xl font-black text-white m-0 tracking-tighter leading-[0.85] italic">
                            Event <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-amber-400">Marquee.</span>
                        </h1>
                        
                        <p className="text-slate-400 text-lg lg:text-2xl mt-10 font-bold leading-relaxed max-w-xl italic">
                            The bridge between learning and recruitment. Join elite webinars, PPTs, and recruitment drives live.
                        </p>

                        <div className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
                             <div className="flex flex-col">
                                  <span className="text-4xl font-black text-white">{events.length}</span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Upcoming Events</span>
                             </div>
                             <div className="w-[1px] h-12 bg-slate-800 hidden lg:block" />
                             <div className="flex flex-col">
                                  <span className="text-4xl font-black text-red-500">{liveEventsCount}</span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Live Sessions</span>
                             </div>
                             <div className="w-[1px] h-12 bg-slate-800 hidden lg:block" />
                             <div className="flex flex-col">
                                  <span className="text-4xl font-black text-indigo-400">4.5k+</span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">RSVPs last week</span>
                             </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex w-96 h-96 relative items-center justify-center">
                         <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-[spin_60s_linear_infinite]" />
                         <div className="absolute inset-10 border-2 border-amber-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                         <div className="w-64 h-64 bg-slate-800 rounded-[3rem] shadow-2xl flex items-center justify-center border border-slate-700 relative z-20 overflow-hidden group">
                              <Play size={80} className="text-indigo-500/20 group-hover:scale-110 group-hover:text-indigo-500/40 transition-all duration-700" fill="currentColor" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex flex-col justify-end p-8">
                                   <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Featured Speaker</div>
                                   <div className="text-lg font-black text-white leading-tight italic">Industry Leaders <br />Session Insights</div>
                              </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                     {/* Search & Discovery Hub */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col items-center gap-8 shadow-sm">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={24} />
                            <input 
                                type="text" 
                                placeholder="Search events, companies, or topics (e.g. 'Amazon PPT')..." 
                                className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-black text-lg italic uppercase tracking-tight"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 w-full justify-center">
                            {eventTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-8 py-4 rounded-[1.5rem] whitespace-nowrap font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                                        selectedType === type 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-300'
                                    }`}
                                >
                                    {type === 'PPT' ? 'Pre-Placement Talks' : type.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Events Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-96 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-[3rem]" />
                            ))}
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <EmptyState 
                            variant="broadcasts"
                            title="No Results Matching Criteria"
                            description="Try changing your search terms or exploring other event categories."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filteredEvents.map((event) => (
                                    <EventIdentityCard 
                                        key={event._id}
                                        event={event}
                                        onJoin={handleJoinEvent}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Sidebar intelligence */}
                <div className="lg:col-span-4 sticky top-10 flex flex-col gap-10">
                    
                    {/* My Event Calendar Card (Mock logic for UX) */}
                    <Card className="bg-slate-900 text-white border-0 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calendar size={180} className="rotate-12" />
                        </div>
                        <div className="relative z-10">
                             <div className="w-16 h-16 rounded-3xl bg-indigo-600 border border-indigo-500/30 flex items-center justify-center mb-10">
                                <Clock size={28} className="text-white" />
                            </div>
                            <h3 className="text-3xl font-black mb-4 italic uppercase tracking-tight leading-tight">My <br />Upcoming.</h3>
                            <div className="space-y-6 mb-10">
                                 {events.slice(0, 2).map((e, i) => (
                                     <div key={i} className="flex gap-4 items-center group/item cursor-pointer">
                                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover/item:scale-150 transition-transform" />
                                          <div className="flex-1">
                                               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{e.company_name}</div>
                                               <div className="text-sm font-black italic">{e.title}</div>
                                          </div>
                                          <ArrowRight size={14} className="text-slate-700 group-hover/item:text-indigo-400 transition-colors" />
                                     </div>
                                 ))}
                            </div>
                            <Button 
                                variant="primary" 
                                className="bg-indigo-600 text-white hover:bg-white hover:text-indigo-900 border-0 font-black w-full h-16 rounded-[1.5rem] uppercase tracking-widest italic transition-all shadow-xl"
                            >
                                View My Calendar
                            </Button>
                        </div>
                    </Card>

                    {/* Pro Hosting Protocols */}
                    <Card className="p-10 border-slate-200/60 dark:border-slate-800 rounded-[3.5rem] bg-white dark:bg-slate-900">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-4 italic font-black">
                            <ShieldCheck size={20} className="text-indigo-500" /> Event Protocols
                        </h4>
                        <div className="space-y-10">
                            {[
                                { title: 'Punctuality', desc: 'Join 10 mins early to avoid missing keys.', icon: Clock },
                                { title: 'Engagement', desc: 'Prepare 2-3 questions for the Q&A.', icon: Zap },
                                { title: 'Formal Decor', desc: 'Maintain professional conduct in chat.', icon: Award }
                            ].map((rule, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <rule.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-slate-800 dark:text-white italic uppercase">{rule.title}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 opacity-80">{rule.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Trending Sessions */}
                    <div className="p-8 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-[3.5rem] border border-indigo-100 dark:border-indigo-500/10">
                         <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-8 italic flex items-center gap-3">
                              <Star size={14} className="fill-indigo-400" /> High Demand
                         </h4>
                         <div className="space-y-6">
                              {events.slice(0, 3).map((item, i) => (
                                   <div key={i} className="flex items-center justify-between group cursor-default">
                                        <div className="flex flex-col">
                                             <span className="text-sm font-black text-slate-800 dark:text-white italic group-hover:text-indigo-600 transition-colors uppercase">{item.company_name}</span>
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{(item.attendees || []).length}+ Registered</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
                                   </div>
                              ))}
                         </div>
                    </div>
                </div>
            </div>

            {/* Career Growth Protocol */}
            <Card className="bg-indigo-600 border-none relative overflow-hidden p-12 rounded-[4rem] group shadow-2xl">
                <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest mb-6">
                            <Zap size={14} className="text-amber-400" />
                            Strategic Prep
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 italic tracking-tight leading-[0.9] uppercase">Maximize Your <br />Network Equity.</h2>
                        <p className="text-indigo-100/70 text-lg font-bold max-w-2xl italic leading-relaxed">
                            System research suggests preparing at least 3 thoughtful questions about the role's tech stack and team culture before joining any Pre-Placement Talk.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                         <Button className="bg-white text-indigo-900 hover:bg-slate-900 hover:text-white px-10 h-16 rounded-[1.5rem] font-black uppercase tracking-widest italic transition-all shadow-2xl">
                            Unlock Prep Checklist
                         </Button>
                    </div>
                </div>
                
                {/* Immersive Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:opacity-30 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full blur-[60px] -ml-10 -mb-10" />
            </Card>
        </div>
    );
};

export default LiveEvents;
