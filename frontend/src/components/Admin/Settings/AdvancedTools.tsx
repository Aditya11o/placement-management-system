import { History, Zap, Shield, AlertTriangle, Database, Trash2, Eraser, Loader2 } from 'lucide-react';
import Card from '../../Card/Card';
import { UseMutationResult } from '@tanstack/react-query';
import { AdminSettingsType } from '../../../types/admin';


interface AdvancedToolsProps {
    settings: AdminSettingsType;
    toggleSetting: (key: keyof AdminSettingsType) => void;
    healthData: any;
    setPurgeConfig: (config: { isOpen: boolean; type: 'LOGS' | 'APPLICATIONS' | 'STUDENTS' | null }) => void;
    masterExportMutation: UseMutationResult<any, any, void, any>;
}

const AdvancedTools: React.FC<AdvancedToolsProps> = ({
    settings,
    toggleSetting,
    healthData,
    setPurgeConfig,
    masterExportMutation
}) => {
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Maintenance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <History size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Obsolete Logs</span>
                    </div>
                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {healthData?.data?.obsoleteLogs || 0}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Older than 90 days</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Zap size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Prunable Apps</span>
                    </div>
                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {healthData?.data?.obsoleteApplications || 0}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Rejected/Withdrawn {'>'} 6mo</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Shield size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Inactive Students</span>
                    </div>
                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {healthData?.data?.inactiveStudents || 0}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Pending {'>'} 3 months</p>
                </div>
            </div>

            <Card className="flex flex-col gap-6 border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertTriangle size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-red-800 dark:text-red-400 m-0">Danger Zone</h2>
                        <p className="text-xs text-red-500/70 font-medium italic">High-impact destructive actions. All purges are logged for audit.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Maintenance Tasks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-white/50 dark:bg-slate-900/50 flex flex-col gap-3 group">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <Database size={18} />
                                <h4 className="font-bold text-sm">Prune Obsolete Logs</h4>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">Remove audit logs older than 90 days to optimize database storage and performance.</p>
                            <button
                                onClick={() => setPurgeConfig({ isOpen: true, type: 'LOGS' })}
                                className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-100 dark:border-red-900/30"
                            >
                                <Trash2 size={14} /> Purge Records
                            </button>
                        </div>

                        <div className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-white/50 dark:bg-slate-900/50 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <Eraser size={18} />
                                <h4 className="font-bold text-sm">Cleanup Registrations</h4>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">Delete student accounts that remained in 'PENDING' status for over 90 days without approval.</p>
                            <button
                                onClick={() => setPurgeConfig({ isOpen: true, type: 'STUDENTS' })}
                                className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-100 dark:border-red-900/30"
                            >
                                <Trash2 size={14} /> Prune Inactive
                            </button>
                        </div>
                    </div>

                    {/* Critical System Actions */}
                    <div className="p-4 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-100/20 dark:bg-red-900/10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <h4 className="font-bold text-sm text-red-800 dark:text-red-400">Maintenance Mode</h4>
                                <p className="text-[10px] text-red-600/70 font-medium">Immediately disconnects all active non-admin sessions.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.maintenanceMode} onChange={() => toggleSetting('maintenanceMode')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-red-600"></div>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-red-200/50 dark:border-red-800/30 flex items-center justify-between gap-4">
                            <div className="flex flex-col flex-1">
                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    Compliance Export
                                    <span className="py-0.5 px-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[8px] rounded uppercase">Safe</span>
                                </h4>
                                <p className="text-[10px] text-slate-500">Download a full JSON archive of all system data excluding passwords.</p>
                            </div>
                            <button
                                onClick={() => masterExportMutation.mutate()}
                                disabled={masterExportMutation.isPending}
                                className="shrink-0 flex items-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-md disabled:opacity-50"
                            >
                                {masterExportMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <History size={14} />}
                                Export System State
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdvancedTools;
