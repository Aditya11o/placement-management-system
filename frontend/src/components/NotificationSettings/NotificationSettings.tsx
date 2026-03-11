import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, RotateCcw, Info, BellRing, Volume2, Moon, Calendar, ShieldCheck, ShieldAlert, Mail, Clock } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import Card from '../Card/Card';
import Button from '../Button/Button';
import { useEffect, useState } from 'react';

interface NotificationEvent {
    key: string;
    label: string;
    description?: string;
    channels: string[];
}

interface NotificationPrefsResponse {
    success: boolean;
    data: {
        preferences: Record<string, { push: boolean; email: boolean } | boolean>;
        availableEvents: NotificationEvent[];
        emailFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
        quietHours: {
            enabled: boolean;
            start: string;
            end: string;
        };
    };
}

const NotificationSettings: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const { registerPush, pushPermission } = useSocket();

    const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('pms_notification_sound') !== 'false');
    const [isDndMode, setIsDndMode] = useState(() => localStorage.getItem('pms_notification_dnd') === 'true');

    useEffect(() => {
        localStorage.setItem('pms_notification_sound', soundEnabled.toString());
    }, [soundEnabled]);

    useEffect(() => {
        localStorage.setItem('pms_notification_dnd', isDndMode.toString());
    }, [isDndMode]);

    const { data, isLoading, isError } = useQuery<NotificationPrefsResponse>({
        queryKey: ['notificationPrefs'],
        queryFn: async () => {
            const res = await api.get('/notification-prefs');
            return res.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedPrefs: any) => {
            return api.put('/notification-prefs', updatedPrefs);
        },
        onSuccess: () => {
            addToast('Notification preferences updated successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] });
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Failed to update preferences', 'error');
        }
    });

    const resetMutation = useMutation({
        mutationFn: async () => {
            return api.delete('/notification-prefs');
        },
        onSuccess: () => {
            addToast('Preferences reset to defaults', 'success');
            queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] });
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Reset failed', 'error');
        }
    });

    if (isLoading) {
        return (
            <Card className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </Card>
        );
    }

    if (isError || !data?.success) {
        return (
            <Card className="p-8 text-center text-slate-800 dark:text-white">
                <p className="text-red-500 font-medium">Failed to load notification settings.</p>
                <Button variant="ghost" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] })}>Retry</Button>
            </Card>
        );
    }

    const { preferences, availableEvents } = data.data;

    const handleToggle = (eventKey: string, channel: 'push' | 'email', currentVal: boolean) => {
        const currentPref = preferences[eventKey];
        let newVal: any;

        if (typeof currentPref === 'boolean') {
            newVal = { push: true, email: true };
            newVal[channel] = !currentVal;
        } else {
            newVal = { ...currentPref, [channel]: !currentVal };
        }

        updateMutation.mutate({ [eventKey]: newVal });
    };

    const getPrefValue = (eventKey: string, channel: 'push' | 'email'): boolean => {
        const pref = preferences[eventKey];
        if (pref === undefined) return true;
        if (typeof pref === 'boolean') return pref;
        return pref[channel] ?? true;
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Alert Preferences</h2>
                    <p className="text-sm text-slate-500">Choose how you want to be notified for different platform events.</p>
                </div>
                <Button
                    variant="ghost"
                    icon={RotateCcw}
                    onClick={() => resetMutation.mutate()}
                    isLoading={resetMutation.isPending}
                    size="sm"
                >
                    Reset Defaults
                </Button>
            </div>

            {/* Premium Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Browser Push Tracking */}
                <Card className="p-5 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                            {pushPermission === 'granted' ? <ShieldCheck size={22} /> : <BellRing size={22} />}
                        </div>
                        {pushPermission !== 'granted' ? (
                            <Button size="sm" onClick={registerPush}>Enable Push</Button>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </div>
                        )}
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Browser Notifications</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Get real-time updates directly on your desktop even when the platform is closed.
                    </p>
                </Card>

                {/* Device Controls */}
                <Card className="p-5 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                                    <Volume2 size={18} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notification Sound</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={soundEnabled}
                                    onChange={() => setSoundEnabled(!soundEnabled)}
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                    <Moon size={18} />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quiet Hours</span>
                                    {data.data.quietHours.enabled && (
                                        <p className="text-[10px] text-indigo-600 font-bold">
                                            Silenced {data.data.quietHours.start} - {data.data.quietHours.end}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={data.data.quietHours.enabled}
                                    onChange={() => updateMutation.mutate({
                                        quietHours: { ...data.data.quietHours, enabled: !data.data.quietHours.enabled }
                                    })}
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Quiet Hours Settings Grid Segment - NEW */}
                {data.data.quietHours.enabled && (
                    <Card className="p-5 border-slate-200 dark:border-slate-800 col-span-1 border-l-4 border-l-indigo-500 bg-indigo-50/10 animate-fade-in">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={16} className="text-indigo-600" />
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Scheduled Silence Window</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={data.data.quietHours.start}
                                        onChange={(e) => updateMutation.mutate({
                                            quietHours: { ...data.data.quietHours, start: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={data.data.quietHours.end}
                                        onChange={(e) => updateMutation.mutate({
                                            quietHours: { ...data.data.quietHours, end: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 italic">
                                * System will suppress all non-critical notifications during this time.
                            </p>
                        </div>
                    </Card>
                )}

                {/* Manual DND Override */}
                <Card className={`p-5 border-slate-200 dark:border-slate-800 flex flex-col justify-center ${isDndMode ? 'bg-amber-50/10 border-amber-200' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDndMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                <ShieldAlert size={18} />
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Manual Do Not Disturb</span>
                                {isDndMode && <p className="text-[10px] text-amber-600 font-bold">Overrides all schedules</p>}
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isDndMode}
                                onChange={() => setIsDndMode(!isDndMode)}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                        </label>
                    </div>
                </Card>

                {/* Email Frequency - NEW */}
                <Card className="p-5 border-slate-200 dark:border-slate-800 col-span-1 md:col-span-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Email Delivery Frequency</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Choose how often you want to receive notification emails.</p>
                            </div>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                            <button
                                onClick={() => updateMutation.mutate({ emailFrequency: 'IMMEDIATE' })}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${data.data.emailFrequency === 'IMMEDIATE'
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <BellRing size={16} />
                                Immediate
                            </button>
                            <button
                                onClick={() => updateMutation.mutate({ emailFrequency: 'DAILY' })}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${data.data.emailFrequency === 'DAILY'
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Clock size={16} />
                                Daily wrap
                            </button>
                            <button
                                onClick={() => updateMutation.mutate({ emailFrequency: 'WEEKLY' })}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${data.data.emailFrequency === 'WEEKLY'
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Calendar size={16} />
                                Weekly
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Push / In-App</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {availableEvents.map((event) => (
                                <tr key={event.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-700 dark:text-slate-200">{event.label}</span>
                                            {event.description && <span className="text-xs text-slate-400 mt-0.5">{event.description}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {event.channels.includes('push') ? (
                                            <label className="relative inline-flex items-center cursor-pointer justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getPrefValue(event.key, 'push')}
                                                    onChange={() => handleToggle(event.key, 'push', getPrefValue(event.key, 'push'))}
                                                    disabled={updateMutation.isPending}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                            </label>
                                        ) : (
                                            <span className="text-slate-300 dark:text-slate-700 text-xs text-slate-800 dark:text-white">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {event.channels.includes('email') ? (
                                            <label className="relative inline-flex items-center cursor-pointer justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getPrefValue(event.key, 'email')}
                                                    onChange={() => handleToggle(event.key, 'email', getPrefValue(event.key, 'email'))}
                                                    disabled={updateMutation.isPending}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                            </label>
                                        ) : (
                                            <span className="text-slate-300 dark:text-slate-700 text-xs text-slate-800 dark:text-white">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 flex gap-3 items-start">
                <Info className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    <strong>Pro-tip:</strong> Disabling push notifications will only hide real-time alerts. You can still view all your notifications by clicking the bell icon in the navigation bar.
                </p>
            </div>
        </div >
    );
};

export default NotificationSettings;
