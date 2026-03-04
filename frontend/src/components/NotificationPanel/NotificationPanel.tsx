import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import api from '../../services/api';

interface Notification {
    _id: string;
    message: string;
    type: string;
    is_read: boolean;
    createdAt: string;
}

const fetchNotifications = async (): Promise<Notification[]> => {
    const res = await api.get('/notifications?limit=20');
    return res.data?.data ?? [];
};

const NotificationPanel = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // ── Fetch notifications ─────────────────────────────────────────────────
    const { data: notifications = [] } = useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        enabled: !!user,
        refetchInterval: 30_000, // Poll every 30s for new notifications
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

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

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors bg-white shadow-sm border border-slate-200 relative"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-[15px] m-0">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllMutation.mutate()}
                                    disabled={markAllMutation.isPending}
                                    className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors disabled:opacity-50"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={14} /> Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                                <Bell size={32} className="opacity-30" />
                                <p className="text-sm">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.is_read ? 'bg-white' : 'bg-indigo-50/60'
                                        }`}
                                >
                                    {/* Unread dot */}
                                    <div className="mt-1.5 shrink-0">
                                        {!n.is_read ? (
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 block" />
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-transparent block" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[13px] m-0 ${n.is_read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
                                            {n.message}
                                        </p>
                                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </div>

                                    {/* Mark read button */}
                                    {!n.is_read && (
                                        <button
                                            onClick={() => markReadMutation.mutate(n._id)}
                                            disabled={markReadMutation.isPending}
                                            className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors mt-0.5 disabled:opacity-50"
                                            title="Mark as read"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
