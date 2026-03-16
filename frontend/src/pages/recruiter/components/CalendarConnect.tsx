import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const CalendarConnect: React.FC = () => {
    const { addToast } = useToast();
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        checkCalendarStatus();
    }, []);

    const checkCalendarStatus = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
                // Assuming tokens are present if user.calendar_tokens is not null
                // Note: Auth controller 'getMe' should return presence of tokens
                setIsConnected(!!response.data.data.calendar_tokens);
            }
        } catch (error) {
            console.error('Failed to check calendar status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const response = await api.get('/auth/google');
            if (response.data.success) {
                const url = response.data.data;
                const width = 600;
                const height = 700;
                const left = window.screenX + (window.outerWidth - width) / 2;
                const top = window.screenY + (window.outerHeight - height) / 2;
                
                window.open(
                    url,
                    'Connect Google Calendar',
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                const handleMessage = async (event: MessageEvent) => {
                    if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
                        const { code } = event.data;
                        await finalizeConnection(code);
                        window.removeEventListener('message', handleMessage);
                    }
                };

                window.addEventListener('message', handleMessage);
            }
        } catch (error) {
            addToast('Failed to initiate Google connection', 'error');
        } finally {
            setIsConnecting(false);
        }
    };

    const finalizeConnection = async (code: string) => {
        try {
            const response = await api.post('/auth/google/tokens', { code });
            if (response.data.success) {
                setIsConnected(true);
                addToast('Google Calendar connected successfully!', 'success');
            }
        } catch (error) {
            addToast('Failed to save calendar tokens', 'error');
        }
    };

    if (isLoading) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className={`p-3 rounded-xl ${isConnected ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0">Calendar Sync</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                            {isConnected 
                                ? 'Your Google Calendar is connected. Interviews will be automatically synced.'
                                : 'Connect your Google Calendar to automatically schedule interviews and send invitations.'}
                        </p>
                    </div>
                </div>
                
                {isConnected ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                        <CheckCircle2 size={14} />
                        Connected
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                        {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <ExternalLink size={18} />}
                        Connect Google
                    </button>
                )}
            </div>

            {isConnected && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <AlertCircle size={20} className="text-indigo-600 shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                        Reminders are automatically sent to students 24 hours before each interview.
                    </span>
                </div>
            )}
        </div>
    );
};

export default CalendarConnect;
