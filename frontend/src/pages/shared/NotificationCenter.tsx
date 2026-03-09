import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    Info,
    Trash2,
    CheckCheck,
    Search,
    ArrowLeft,
    Loader2,
    Calendar,
    Check,
    Layers,
    ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button/Button';

interface Notification {
    _id: string;
    title?: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    isRead: boolean;
    link?: string;
    avatar?: string;
    actions?: Array<{
        label: string;
        url: string;
        method: string;
        color: string;
    }>;
    createdAt: string;
    // Grouping fields
    isGroup?: boolean;
    count?: number;
    ids?: string[];
}

interface NotificationResponse {
    success: boolean;
    data: Notification[];
    pagination: {
        total: number;
        totalPages: number;
        page: number;
    };
}

const NotificationCenter: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    // Filtering state
    const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('ALL');

    // UX Improvements State
    const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(new Set());
    const [undoTimeouts, setUndoTimeouts] = useState<Record<string, any>>({});

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(undoTimeouts).forEach(clearTimeout);
        };
    }, [undoTimeouts]);

    // Fetch notifications
    const { data, isLoading } = useQuery<NotificationResponse>({
        queryKey: ['notifications', filter, selectedType],
        queryFn: async () => {
            const res = await api.get('/notifications?limit=100'); // Higher limit for center
            return res.data;
        }
    });

    const notifications = data?.data || [];

    // Mutations
    const markReadMutation = useMutation({
        mutationFn: async (ids: string | string[]) => {
            if (Array.isArray(ids)) {
                const results = await Promise.all(ids.map(id => api.put(`/notifications/${id}/read`)));
                return results[0]; // Return any one of the results to satisfy type
            }
            return api.put(`/notifications/${ids}/read`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const markAllMutation = useMutation({
        mutationFn: () => api.put('/notifications/read-all'),
        onSuccess: () => {
            addToast('All notifications marked as read', 'success');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (ids: string | string[]) => {
            if (Array.isArray(ids)) {
                const results = await Promise.all(ids.map(id => api.delete(`/notifications/${id}`)));
                return results[0];
            }
            return api.delete(`/notifications/${ids}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleDelete = (n: Notification) => {
        const idToGhost = n._id; // Use primary ID for ghosting logic
        const idsToDelete = n.isGroup ? n.ids! : [n._id];

        // 1. Ghost the notification immediately in UI
        setPendingDeletions(prev => {
            const next = new Set(prev);
            next.add(idToGhost);
            return next;
        });

        // 2. Set a timeout for real deletion (5 seconds)
        const timeoutId = setTimeout(() => {
            deleteMutation.mutate(idsToDelete);
            setPendingDeletions(prev => {
                const next = new Set(prev);
                next.delete(idToGhost);
                return next;
            });
        }, 5000);

        setUndoTimeouts(prev => ({ ...prev, [idToGhost]: timeoutId }));

        // 3. Show Undo Toast
        addToast(
            n.isGroup ? `Deleted group of ${n.count} notifications` : 'Notification deleted',
            'info',
            5000,
            {
                label: 'Undo',
                onClick: () => {
                    clearTimeout(timeoutId);
                    setPendingDeletions(prev => {
                        const next = new Set(prev);
                        next.delete(idToGhost);
                        return next;
                    });
                    setUndoTimeouts(prev => {
                        const next = { ...prev };
                        delete next[idToGhost];
                        return next;
                    });
                    addToast('Deletion undone', 'success', 2000);
                }
            }
        );
    };

    const clearAllMutation = useMutation({
        mutationFn: () => api.delete('/notifications'),
        onSuccess: () => {
            addToast('All notifications cleared', 'success');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const getIcon = (n: Notification) => {
        if (n.avatar) {
            return (
                <img
                    src={n.avatar}
                    alt="Source"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(n.title || 'U')}&background=random`;
                    }}
                />
            );
        }

        switch (n.type) {
            case 'SUCCESS': return <CheckCircle size={20} className="text-emerald-500" />;
            case 'WARNING': return <AlertTriangle size={20} className="text-amber-500" />;
            case 'ERROR': return <AlertCircle size={20} className="text-red-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesStatus = filter === 'ALL' || (filter === 'UNREAD' && !n.isRead) || (filter === 'READ' && n.isRead);
        const matchesType = selectedType === 'ALL' || n.type === selectedType;
        const matchesSearch = n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.title && n.title.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesType && matchesSearch;
    });

    const handleAction = async (n: Notification) => {
        if (!n.isRead) {
            const idsToMark = n.isGroup ? n.ids! : [n._id];
            markReadMutation.mutate(idsToMark);
        }
        if (n.link) navigate(n.link);
    };

    const triggerActionMutation = useMutation({
        mutationFn: ({ id, idx }: { id: string, idx: number }) => api.post(`/notifications/${id}/action`, { actionIdx: idx }),
        onSuccess: (data) => {
            addToast(data.data.message || 'Action executed', 'success');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleButtonClick = async (e: React.MouseEvent, n: Notification, idx: number) => {
        e.stopPropagation();
        triggerActionMutation.mutate({ id: n._id, idx });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-medium">Loading your alerts...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors dark:hover:bg-slate-800"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Notification Center
                            <span className="text-sm font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {data?.pagination.total || 0}
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm">Stay updated with important system events and activities.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={CheckCheck}
                        onClick={() => markAllMutation.mutate()}
                        disabled={markAllMutation.isPending || !notifications.some(n => !n.isRead)}
                    >
                        Mark all as read
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to clear all notifications?')) {
                                clearAllMutation.mutate();
                            }
                        }}
                        disabled={clearAllMutation.isPending || notifications.length === 0}
                    >
                        Clear all
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 sticky top-4 z-10 shadow-sm backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    {/* Status Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full lg:w-auto">
                        {(['ALL', 'UNREAD', 'READ'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`flex-1 lg:flex-none px-6 py-2 text-sm font-semibold rounded-lg transition-all ${filter === s
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm dark:text-white'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                            >
                                {s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block" />

                    {/* Search & Type Filters */}
                    <div className="flex flex-1 gap-4 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 dark:text-white cursor-pointer"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="ALL">All Levels</option>
                            <option value="INFO">Information</option>
                            <option value="SUCCESS">Success</option>
                            <option value="WARNING">Warning</option>
                            <option value="ERROR">Error</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center bg-slate-50/50 border-dashed border-2 dark:bg-slate-900/20 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Bell className="text-slate-400 opacity-40" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">No notifications found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">
                            Try adjusting your filters or search terms to find what you're looking for.
                        </p>
                        {(filter !== 'ALL' || selectedType !== 'ALL' || searchTerm) && (
                            <Button
                                variant="secondary"
                                className="mt-4"
                                onClick={() => {
                                    setFilter('ALL');
                                    setSelectedType('ALL');
                                    setSearchTerm('');
                                }}
                            >
                                Reset All Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredNotifications
                        .filter(n => !pendingDeletions.has(n._id))
                        .map((n) => (
                            <div
                                key={n._id}
                                className={`group p-4 bg-white dark:bg-slate-900 border rounded-2xl border-l-4 transition-all hover:shadow-md cursor-pointer ${n.isRead
                                    ? 'border-transparent bg-white dark:bg-slate-900'
                                    : 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-900/10'
                                    }`}
                                onClick={() => handleAction(n)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`shrink-0 ${n.avatar ? '' : 'mt-1 p-2 rounded-xl ' + (n.isRead ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700')
                                        }`}>
                                        {getIcon(n)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`text-base m-0 leading-tight truncate ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white font-bold'}`}>
                                                        {n.title || 'System Alert'}
                                                    </h4>
                                                    {n.isGroup && (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold uppercase tracking-wider">
                                                            <Layers size={10} />
                                                            {n.count} Grouped
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                                    <Calendar size={12} />
                                                    {formatDate(n.createdAt)}
                                                </span>

                                                {/* Action Menu (Visible on hover) */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                    {!n.isRead && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const ids = n.isGroup ? n.ids! : [n._id];
                                                                markReadMutation.mutate(ids);
                                                            }}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(n);
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <p className={`text-sm leading-relaxed mb-0 ${n.isRead ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {n.message}
                                        </p>

                                        {n.actions && n.actions.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {n.actions.map((action, actionIdx) => (
                                                    <button
                                                        key={actionIdx}
                                                        onClick={(e) => handleButtonClick(e, n, actionIdx)}
                                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 
                                                        ${action.color === 'indigo' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
                                                                action.color === 'red' ? 'bg-red-500 text-white hover:bg-red-600' :
                                                                    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'}`}
                                                    >
                                                        {action.label === 'Accept' && <Check size={14} />}
                                                        {action.label === 'Reject' && <Trash2 size={14} />}
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {n.link && !n.actions?.length && (
                                            <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 group/link">
                                                View Details
                                                <ChevronRight size={14} className="transition-transform group-hover/link:translate-x-0.5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                )}

                {data?.pagination && data.pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                        {/* Simple Pagination could go here if needed, 
                            but limit=100 covers most recent alerts for now. */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
