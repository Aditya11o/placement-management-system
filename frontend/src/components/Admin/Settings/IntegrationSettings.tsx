import { Bell, Zap, Send, Loader2, History } from 'lucide-react';
import Card from '../../Card/Card';
import { useMutation } from '@tanstack/react-query';
import { AdminSettingsType } from '../../../types/admin';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';


interface IntegrationSettingsProps {
    settings: AdminSettingsType;
    setSettings: React.Dispatch<React.SetStateAction<AdminSettingsType>>;
    toggleSetting: (key: keyof AdminSettingsType) => void;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ settings, setSettings, toggleSetting }) => {
    const { addToast } = useToast();

    const testWebhookMutation = useMutation({
        mutationFn: async (url: string) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: '🚀 *Success!* The Placement Management System webhook integration is active and working correctly.'
                })
            });
            if (!response.ok) throw new Error('Webhook failed');
            return response;
        },
        onSuccess: () => {
            addToast('Test payload successfully delivered to webhook!', 'success');
        },
        onError: () => {
            addToast('Failed to reach webhook. Ensure CORS allows client requests, or check the URL.', 'error');
        }
    });

    const handleTestWebhook = () => {
        if (!settings.systemWebhookUrl) {
            addToast('Please enter a webhook URL first.', 'info');
            return;
        }
        testWebhookMutation.mutate(settings.systemWebhookUrl);
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Notifications */}
            <Card className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Bell size={22} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Notifications</h2>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Email Alerts</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive daily digest of platform activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.emailNotifications} onChange={() => toggleSetting('emailNotifications')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Integrations & Webhooks */}
            <Card className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Zap size={22} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Integrations</h2>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">System Webhook URL (Slack/Discord)</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="url"
                                value={settings.systemWebhookUrl}
                                onChange={(e) => setSettings({ ...settings, systemWebhookUrl: e.target.value })}
                                placeholder="https://hooks.slack.com/services/..."
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-mono"
                            />
                            <button
                                onClick={handleTestWebhook}
                                disabled={testWebhookMutation.isPending || !settings.systemWebhookUrl}
                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                {testWebhookMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Test Connection
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 italic">Get instant alerts for new companies and high-tier placements.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tier-1 Salary Threshold (LPA)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                value={settings.tier1SalaryThreshold}
                                onChange={(e) => setSettings({ ...settings, tier1SalaryThreshold: parseInt(e.target.value) })}
                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                            />
                        </div>
                        <p className="text-xs text-slate-500">Jobs above this CTC are classified as Tier-1 for celebratory alerts.</p>
                    </div>

                    {/* Calendar Integration */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                <History size={18} />
                            </div>
                            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 italic">Calendar & Scheduling (Beta)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google Calendar API Key</label>
                                <input
                                    type="password"
                                    value={settings.googleCalendarApiKey}
                                    onChange={(e) => setSettings({ ...settings, googleCalendarApiKey: e.target.value })}
                                    placeholder="AIzaSy..."
                                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-xs font-mono"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google Client ID</label>
                                <input
                                    type="text"
                                    value={settings.googleCalendarClientId}
                                    onChange={(e) => setSettings({ ...settings, googleCalendarClientId: e.target.value })}
                                    placeholder="12345-abcde.apps.googleusercontent.com"
                                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-xs font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Auto-Schedule Interviews</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Automatically reserve calendar slots when students are moved to INTERVIEW stage</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.autoScheduleInterviews} onChange={() => setSettings({ ...settings, autoScheduleInterviews: !settings.autoScheduleInterviews })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default IntegrationSettings;
