import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Check, CheckCheck, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface Notification {
    _id: string;
    title?: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    isRead: boolean;
    link?: string;
    createdAt: string;
}

const fetchNotifications = async (): Promise<Notification[]> => {
    const res = await api.get('/notifications?limit=20');
    return res.data?.data ?? [];
};

const NotificationPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // ── Fetch notifications ─────────────────────────────────────────────────
    const { data: notifications = [] } = useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        enabled: !!user,
        refetchInterval: 300_000, // Passive fallback. WebSockets handle instant invalidation.
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // ── Mark single as read ─────────────────────────────────────────────────
    const markReadMutation = useMutation({
        mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    // ── Mark all as read ────────────────────────────────────────────────────
    const markAllMutation = useMutation({
        mutationFn: () => api.put('/notifications/read-all'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            markReadMutation.mutate(notification._id);
        }

        if (notification.link) {
            setIsOpen(false);
            navigate(notification.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'WARNING': return <AlertTriangle size={14} className="text-amber-500" />;
            case 'ERROR': return <AlertCircle size={14} className="text-red-500" />;
            default: return <Info size={14} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                className={`p-2 rounded-full transition-all duration-200 border shadow-sm relative ${isOpen
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200 ring-2 ring-indigo-500/20'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                    }`}
                aria-label="Notifications"
            >
                <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 border-2 border-white shadow-sm animate-premium-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-sm m-0">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllMutation.mutate()}
                                    disabled={markAllMutation.isPending}
                                    className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold hover:text-indigo-800 transition-colors disabled:opacity-50"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={14} /> Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                    <Bell size={24} className="opacity-20" />
                                </div>
                                <p className="text-xs font-medium">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`flex items-start gap-3 px-4 py-4 transition-all duration-200 relative group cursor-pointer ${n.isRead ? 'bg-white opacity-90' : 'bg-indigo-50/40'
                                        }`}
                                >
                                    {!n.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                                    )}

                                    {/* Icon */}
                                    <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${n.isRead ? 'bg-slate-50' : 'bg-white shadow-sm'
                                        }`}>
                                        {getIcon(n.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-[13px] leading-snug m-0 ${n.isRead ? 'text-slate-500' : 'text-slate-800 font-semibold'}`}>
                                                {n.title || 'System Notification'}
                                            </p>
                                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-0.5">
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                        <p className={`text-[12px] leading-relaxed mt-1 m-0 ${n.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {n.message}
                                        </p>
                                    </div>

                                    {/* Mark read button (if unread) */}
                                    {!n.isRead && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markReadMutation.mutate(n._id);
                                            }}
                                            disabled={markReadMutation.isPending}
                                            className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                            title="Mark as read"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications');
                                }}
                                className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider"
                            >
                                View all activity
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
