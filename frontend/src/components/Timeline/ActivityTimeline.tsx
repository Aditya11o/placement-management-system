import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Clock, CheckCircle2, AlertCircle, Info, User, Shield, Briefcase, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface Log {
    _id: string;
    action: string;
    description: string;
    created_at: string;
    user_role: string;
    metadata?: any;
}

interface ActivityTimelineProps {
    userId: string;
}

const actionConfig: Record<string, { icon: any, color: string, bg: string }> = {
    'LOGIN': { icon: User, color: 'text-blue-600', bg: 'bg-blue-100' },
    'UPDATE_STATUS': { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
    'APPLY_JOB': { icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    'SEND_MESSAGE': { icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    'VERIFY_DOCUMENT': { icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-100' },
    'DEFAULT': { icon: Info, color: 'text-slate-600', bg: 'bg-slate-100' }
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ userId }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['user-timeline', userId],
        queryFn: async () => {
            const res = await api.get(`/logs/user/${userId}/timeline`);
            return res.data.data;
        },
        enabled: !!userId
    });

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-1/4" />
                            <div className="h-3 bg-slate-100 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 text-red-500 text-sm py-4">
                <AlertCircle size={16} />
                <span>Failed to load activity timeline.</span>
            </div>
        );
    }

    const logs: Log[] = data || [];

    if (logs.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 italic text-sm">
                No recent activity recorded for this user.
            </div>
        );
    }

    return (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent dark:before:from-slate-800 dark:before:via-slate-800">
            {logs.map((log) => {
                const config = actionConfig[log.action] || actionConfig.DEFAULT;
                const Icon = config.icon;

                return (
                    <div key={log._id} className="relative flex items-start gap-4 group">
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${config.bg} ${config.color} shrink-0 ring-4 ring-white dark:ring-slate-900 z-10 transition-transform group-hover:scale-110`}>
                            <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start gap-2 mb-1">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">
                                    {log.action.replace(/_/g, ' ')}
                                </h4>
                                <time className="text-[10px] font-medium text-slate-400 whitespace-nowrap flex items-center gap-1">
                                    <Clock size={10} />
                                    {format(new Date(log.created_at), 'MMM d, h:mm a')}
                                </time>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                "{log.description}"
                            </p>
                            {log.metadata?.justification && (
                                <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 rounded text-[10px] text-indigo-700 dark:text-indigo-400">
                                    <span className="font-bold uppercase mr-1">Justification:</span>
                                    {log.metadata.justification}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ActivityTimeline;
