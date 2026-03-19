import React, { useState, useEffect, memo } from 'react';
import { 
    Clock, 
    Users, 
    ExternalLink, 
    Calendar, 
    Video, 
    Briefcase, 
    GraduationCap, 
    MapPin, 
    CheckCircle2,
    Zap,
    ArrowRight,
    PlayCircle
} from 'lucide-react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInSeconds, isPast, isFuture } from 'date-fns';

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

interface EventIdentityCardProps {
    event: Event;
    onJoin: (id: string, link: string) => void;
}

const EventIdentityCard: React.FC<EventIdentityCardProps> = memo(({ event, onJoin }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        if (!event.startTime) return;
        
        const updateTimer = () => {
            const now = new Date();
            const start = new Date(event.startTime!);
            const diff = differenceInSeconds(start, now);
            setTimeLeft(diff > 0 ? diff : 0);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [event.startTime]);

    const formatTimeLeft = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const isLive = event.startTime ? (isPast(new Date(event.startTime)) && differenceInSeconds(new Date(), new Date(event.startTime)) < 7200) : false;
    const isUpcoming = event.startTime && isFuture(new Date(event.startTime));
    const showCountdown = isUpcoming && timeLeft > 0 && timeLeft < 86400; // Show countdown if event is within 24 hours

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'WEBINAR': return { icon: Video, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Webinar', theme: 'from-indigo-600 to-blue-700' };
            case 'PPT': return { icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Pre-Placement Talk', theme: 'from-purple-600 to-pink-700' };
            case 'DRIVE': return { icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Recruitment Drive', theme: 'from-emerald-600 to-teal-800' };
            default: return { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Workshop', theme: 'from-amber-600 to-orange-700' };
        }
    };

    const { icon: Icon, color, bg, label, theme } = getTypeDetails(event.type);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full"
        >
            <Card className="p-0 overflow-hidden h-full flex flex-col bg-white dark:bg-slate-900 border-none shadow-premium hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] transition-all duration-500 rounded-[3rem] group">
                {/* Event Banner & Identity */}
                <div className={`h-40 bg-gradient-to-br ${theme} relative overflow-hidden p-8 flex flex-col justify-end`}>
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-500" />
                    
                    {/* Status Floating Badges */}
                    <div className="absolute top-6 left-8 right-8 flex justify-between items-start z-10">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border border-white/20 font-black text-[9px] uppercase tracking-widest text-white shadow-xl`}>
                            <Icon size={12} className="text-white/80" />
                            {label}
                        </div>
                        
                        {isLive ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-red-500/30 animate-pulse">
                                <PlayCircle size={14} /> LIVE NOW
                            </div>
                        ) : showCountdown ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white font-black text-[9px] tracking-widest border border-white/10 uppercase">
                                <Clock size={12} className="text-amber-400" /> Starts in: {formatTimeLeft(timeLeft)}
                            </div>
                        ) : null}
                    </div>

                    <div className="relative z-10">
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] italic mb-1">Company Spotlight</div>
                        <div className="text-lg font-black text-white italic tracking-tighter uppercase leading-tight">{event.company_name}</div>
                    </div>

                    {/* Background Visual Element */}
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
                </div>

                <div className="px-8 pb-8 pt-6 relative flex-1 flex flex-col">
                    {/* Title and Stats Row */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight italic group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                            {event.title}
                        </h3>
                        {/* Attendee Avatar Stack (Mock) */}
                        <div className="flex -space-x-2 flex-shrink-0 pt-1">
                             {[1,2,3].map(i => (
                                 <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black overflow-hidden shadow-sm">
                                      {i === 3 ? <span className="text-slate-500">+{(event.attendees || []).length}</span> : <div className="w-full h-full bg-indigo-500/20" />}
                                 </div>
                             ))}
                        </div>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mb-8 opacity-70 italic line-clamp-2">
                        {event.description}
                    </p>

                    {/* Logistics Hub */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group/item hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Calendar size={12} className="text-indigo-500" /> Date & Time
                            </div>
                            <div className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter italic">
                                {event.startTime ? format(new Date(event.startTime), 'MMM do, h:mm a') : 'To Be Decided'}
                            </div>
                        </div>
                        <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group/item hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <MapPin size={12} className="text-emerald-500" /> Access
                            </div>
                            <div className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter italic">
                                {event.link ? 'Virtual Portal' : 'On Campus'}
                            </div>
                        </div>
                    </div>

                    {/* Speaker Spotlight (Mock info since not in schema) */}
                    <div className="mb-10 flex items-center gap-4 p-4 rounded-3xl bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                         <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500">
                              <Users size={18} />
                         </div>
                         <div className="flex-1">
                              <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Keynote Speaker</div>
                              <div className="text-xs font-black text-slate-800 dark:text-white uppercase italic">Recruitment Lead @ {event.company_name}</div>
                         </div>
                    </div>

                    {/* Action Hub */}
                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                        <Button 
                            className={`flex-1 rounded-2xl h-14 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 group/btn ${isRegistered ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-900 border-none shadow-xl shadow-slate-200 dark:shadow-none hover:bg-indigo-600 text-white'}`}
                            onClick={() => {
                                setIsRegistered(true);
                                onJoin(event._id, event.link);
                            }}
                        >
                            {isRegistered ? (
                                <><CheckCircle2 size={16} className="mr-3" /> Registered</>
                            ) : isLive ? (
                                <><Zap size={16} className="mr-3 animate-pulse text-amber-400" /> Join Session Now</>
                            ) : (
                                <><ArrowRight size={16} className="mr-3 group-hover/btn:translate-x-1 transition-transform" /> Register & RSVP</>
                            )}
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="w-14 h-14 rounded-2xl p-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border-none hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                            onClick={() => window.open(event.link, '_blank')}
                        >
                            <ExternalLink size={20} strokeWidth={2.5} />
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
});

EventIdentityCard.displayName = 'EventIdentityCard';

export default EventIdentityCard;
