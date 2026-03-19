import { Shield, Lock, AlertTriangle } from 'lucide-react';
import Card from '../../Card/Card';
import { AdminSettingsType } from '../../../types/admin';


interface SecuritySettingsProps {
    settings: AdminSettingsType;
    setSettings: React.Dispatch<React.SetStateAction<AdminSettingsType>>;
    toggleSetting: (key: keyof AdminSettingsType) => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ settings, setSettings, toggleSetting }) => {
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Security & Approvals */}
            <Card className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                        <Shield size={22} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Security & Approvals</h2>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Student Manual Approval</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Require admin verification for students</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.requireApprovalForStudents} onChange={() => toggleSetting('requireApprovalForStudents')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Inbound Access Control */}
            <Card className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Lock size={22} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Inbound Access Control</h2>
                </div>
                <div className="flex flex-col gap-3">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Admin IP Whitelist</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Restricts Admin Panel access to these IP addresses only. Leave empty to allow all IPs. Enter one IP per line.</p>
                    <textarea
                        value={settings.adminIpWhitelist?.join('\n') || ''}
                        onChange={(e) => setSettings({ ...settings, adminIpWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) })}
                        placeholder="e.g. 192.168.1.1&#10;110.22.33.44"
                        className="w-full h-32 px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none mt-1"
                    />
                    <div className="flex items-center gap-2 text-[11px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-md border border-orange-100 dark:border-orange-800/30">
                        <AlertTriangle size={12} />
                        <span>Warning: Incorrect IP whitelisting can lock you out of the admin panel. Ensure your current IP is included.</span>
                    </div>
                </div>
            </Card>

            {/* Security & Compliance */}
            <Card className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Lock size={22} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Security & Compliance</h2>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Session Timeout (Hours)</label>
                        <input
                            type="number"
                            value={settings.sessionExpirationHours}
                            onChange={(e) => setSettings({ ...settings, sessionExpirationHours: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                        />
                        <p className="text-xs text-slate-500">Force logout after inactivity. Default is 168 hours (7 days).</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Max Login Attempts</label>
                        <input
                            type="number"
                            value={settings.maxFailedLoginAttempts}
                            onChange={(e) => setSettings({ ...settings, maxFailedLoginAttempts: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                        />
                        <p className="text-xs text-slate-500">Number of failed logins before IP is temporarily banned.</p>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Strong Passwords</h4>
                            <p className="text-xs text-slate-500">Enforce uppercase, numbers, and symbols</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.enforcePasswordComplexity} onChange={() => toggleSetting('enforcePasswordComplexity')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SecuritySettings;
