import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { Calendar, Video, Briefcase, GraduationCap, MapPin, Clock, ExternalLink, Sparkles, Users } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import { format, isPast } from 'date-fns';
import EmptyState from '../../components/EmptyState/EmptyState';

interface Event {
    _id: string;
    title: string;
    description: string;
    type: 'WEBINAR' | 'PPT' | 'DRIVE' | 'WORKSHOP';
    startTime: string;
    link: string;
    company_name: string;
    attendees: string[];
}

const LiveEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('/api/v1/events');
            setEvents(res.data.data);
        } catch (error) {
            addToast('Failed to load events', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinEvent = async (eventId: string, link: string) => {
        try {
            await axios.post(`/api/v1/events/${eventId}/join`);
            addToast('Registered for event! Opening link...', 'success');
            window.open(link, '_blank');
            fetchEvents(); // Refresh attendee count
        } catch (error: any) {
            if (error.response?.data?.message === 'Already joined this event') {
                window.open(link, '_blank');
            } else {
                addToast('Failed to register', 'error');
            }
        }
    };

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'WEBINAR': return { icon: Video, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Webinar' };
            case 'PPT': return { icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Pre-Placement Talk' };
            case 'DRIVE': return { icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Recruitment Drive' };
            default: return { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Workshop' };
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-12">
            <PageHeader 
                title="Live Event Hub"
                subtitle="Exclusive webinars, recruitment drives, and pre-placement talks."
            />

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(n => (
                        <Card key={n} border className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800">
                             <div className="h-full w-full" />
                        </Card>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <EmptyState 
                    illustration="/src/assets/illustrations/empty_events.png"
                    title="No Upcoming Events"
                    description="Stay tuned! We'll notify you when companies schedule new PPTs or webinars."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => {
                        const { icon: Icon, color, bg, label } = getTypeDetails(event.type);
                        const isLive = isPast(new Date(event.startTime)) && !isPast(new Date(new Date(event.startTime).getTime() + 2 * 60 * 60 * 1000));
                        
                        return (
                            <Card key={event._id} className="group overflow-hidden border-none shadow-premium hover:shadow-2xl transition-all duration-500">
                                <div className="p-6 relative">
                                    {/* Type Tag */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bg} ${color} text-[10px] font-bold uppercase tracking-wider`}>
                                            <Icon size={14} />
                                            {label}
                                        </div>
                                        {isLive && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black animate-pulse">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                LIVE NOW
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{event.description}</p>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="flex flex-col gap-3 mb-8">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Clock size={16} className="text-slate-400" />
                                            <span className="text-xs font-medium">{format(new Date(event.startTime), 'MMM do, h:mm a')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Users size={16} className="text-slate-400" />
                                            <span className="text-xs font-medium">{event.attendees.length} Students Registered</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span className="text-xs font-medium">{event.company_name} Virtual Hub</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button 
                                        variant={isLive ? 'primary' : 'secondary'} 
                                        isFullWidth 
                                        className={isLive ? 'action-glow-indigo' : ''}
                                        icon={ExternalLink}
                                        onClick={() => handleJoinEvent(event._id, event.link)}
                                    >
                                        {isLive ? 'Join Session Now' : 'Register & Join'}
                                    </Button>

                                    {/* Subtle Mesh Glow Background for Group Hover */}
                                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-all duration-700" />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* AI Insights Card */}
            <Card className="bg-slate-900 border-none relative overflow-hidden p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-white mb-3">Maximize Your PPT Experience</h2>
                        <p className="text-slate-400 text-sm max-w-xl">
                            Our AI suggests preparing at least 3 thoughtful questions about the role's tech stack and team culture before joining any Pre-Placement Talk.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <div className="p-4 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 backdrop-blur-xl">
                            <Sparkles className="text-indigo-400" size={32} />
                        </div>
                    </div>
                </div>
                
                {/* Decorative Mesh */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 blur-3xl" />
            </Card>
        </div>
    );
};

export default LiveEvents;
