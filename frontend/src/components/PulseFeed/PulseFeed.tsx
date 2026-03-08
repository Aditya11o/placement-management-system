import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, UserPlus, Briefcase, FileText, CheckCircle, XCircle, LogIn, BellRing, Settings, LucideIcon } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';

interface PulseEvent {
    _id: string;
    user_id: string;
    user_role: string;
    action: string;
    description: string;
    created_at: string;
}

const PulseFeed: React.FC = () => {
    const { socket, isConnected } = useSocket();
    const [events, setEvents] = useState<PulseEvent[]>([]);
    const feedRef = useRef<HTMLDivElement>(null);

    // Initial Fetch of the latest 20 events
    const { data: initialData, isLoading } = useQuery({
        queryKey: ['adminPulseFeed'],
        queryFn: async () => {
            const res = await api.get('/admin/pulse');
            return res.data;
        },
        staleTime: 0, // Always fetch fresh on mount
    });

    useEffect(() => {
        if (initialData?.data) {
            setEvents(initialData.data);
        }
    }, [initialData]);

    useEffect(() => {
        if (!socket) return;

        // Listen for newly created logs broadcast by Mongoose Post-Save hook
        const handleAdminPulse = (newEvent: PulseEvent) => {
            setEvents((prev) => {
                // Prepend new event and keep array at max 50 items to prevent DOM bloat
                const updated = [newEvent, ...prev].slice(0, 50);
                return updated;
            });
        };

        socket.on('admin_pulse', handleAdminPulse);

        return () => {
            socket.off('admin_pulse', handleAdminPulse);
        };
    }, [socket]);

    // Helper to map Action Types to Icons and Colors
    const getActionMeta = (action: string): { icon: LucideIcon | ((desc: string) => LucideIcon), color: string, bg: string } => {
        switch (action) {
            case 'REGISTER': return { icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' };
            case 'LOGIN': return { icon: LogIn, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' };
            case 'CREATE_JOB': return { icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' };
            case 'UPDATE_JOB_STATUS': return { icon: (desc: string) => (desc.includes('false') || desc.includes('Rejected') ? XCircle : CheckCircle), color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' };
            case 'SUBMIT_APPLICATION': return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' };
            case 'UPDATE_APPLICATION_STATUS': return { icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' };
            case 'UPDATE_SETTINGS': return { icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' };
            default: return { icon: BellRing, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' };
        }
    };

    // Humanize relative time
    const timeAgo = (dateStr: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        if (seconds < 5) return 'Just now';

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + 'y ago';
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + 'm ago';
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + 'd ago';
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + 'h ago';
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + 'm ago';
        return Math.floor(seconds) + 's ago';
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-slate-800 dark:text-white m-0 tracking-tight">Live Command Center</h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={`relative flex h-2.5 w-2.5`}>
                        {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {isConnected ? 'LIVE' : 'OFFLINE'}
                    </span>
                </div>
            </div>

            {/* Scrolling Feed Container */}
            <div
                ref={feedRef}
                className="flex-1 overflow-y-auto p-4 custom-scrollbar"
                style={{ maxHeight: '400px' }}
            >
                {isLoading && events.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-slate-400 gap-2">
                        <Activity className="animate-pulse opacity-50" size={24} />
                        <span className="text-sm">Connecting to datastream...</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-slate-400 text-sm italic">
                        No recent activity found.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                        {events.map((ev, index) => {
                            const meta = getActionMeta(ev.action);
                            const IconComponent = typeof meta.icon === 'function' ? meta.icon(ev.description) : meta.icon;

                            // Highlight the very first newly arrived item
                            const isNew = index === 0 && (new Date().getTime() - new Date(ev.created_at).getTime()) < 10000;

                            return (
                                <div key={ev._id} className={`relative flex items-center gap-3 group is-active transition-all duration-500 ${isNew ? 'animate-fade-in bg-indigo-50/50 dark:bg-indigo-500/10 rounded-xl -mx-2 px-2' : ''}`}>
                                    {/* Icon Marker */}
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 z-10 shrink-0 ${meta.bg} ${meta.color} shadow-sm transition-transform group-hover:scale-110`}>
                                        {React.createElement(IconComponent as React.ElementType, { size: 16 })}
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex-1 min-w-0 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[10px] font-bold tracking-wider uppercase ${meta.color}`}>{ev.action.replace(/_/g, ' ')}</span>
                                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{timeAgo(ev.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug m-0">{ev.description}</p>
                                        <span className="text-[11px] text-slate-400 mt-1 block font-medium opacity-60">
                                            By {ev.user_role.toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Fade */}
            <div className="h-6 w-full bg-gradient-to-t from-white dark:from-slate-900 to-transparent absolute bottom-0 z-10 pointer-events-none"></div>
        </div>
    );
};

export default PulseFeed;
