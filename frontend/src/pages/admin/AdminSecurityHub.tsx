import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Eye, Terminal, Lock, Activity, AlertTriangle } from 'lucide-react';
import Card from '../../components/Card/Card';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminSecurityHub = () => {
    const { data: secData, isLoading } = useQuery({
        queryKey: ['securityHubStats'],
        queryFn: async () => {
            const res = await api.get('/analytics/security-hub');
            return res.data.data;
        }
    });

    if (isLoading) {
        return <div className="p-8 animate-pulse text-slate-400">Loading Security Infrastructure...</div>;
    }

    return (
        <div className="flex flex-col gap-8 animate-fade-in p-6">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <ShieldLock className="text-indigo-600" size={32} />
                        Security Observability Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 m-0">Real-time threat detection, PII audit trail, and system health monitoring.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20 flex items-center gap-2 font-bold text-sm">
                        <ShieldCheck size={18} /> System Secure
                    </div>
                </div>
            </div>

            {/* Score & Critical Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 to-indigo-950 border-none shadow-2xl">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * (secData?.securityScore || 0)) / 100} className="text-indigo-500 transition-all duration-1000" />
                        </svg>
                        <span className="absolute text-3xl font-black text-white">{secData?.securityScore}%</span>
                    </div>
                    <h3 className="text-white font-bold m-0 uppercase tracking-widest text-xs opacity-60">Security Health Score</h3>
                    <p className="text-slate-400 text-xs mt-2 italic">Based on PII hygiene and login anomalies.</p>
                </Card>

                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Activity size={16} /> Live Security Alerts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {secData?.criticalAlerts?.length > 0 ? secData.criticalAlerts.map((alert: any, idx: number) => (
                            <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 transition-all hover:scale-[1.01] ${
                                alert.severity === 'HIGH' 
                                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700' 
                                    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700'
                            }`}>
                                <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-bold text-sm mb-1">{alert.message}</p>
                                    <button className="text-xs font-black uppercase tracking-tighter opacity-70 hover:opacity-100">Investigate &rarr;</button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                                <ShieldCheck size={32} className="mb-2 opacity-50" />
                                <p className="font-medium text-sm">No critical threats detected in the last 24h.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Failed Logins Timeline */}
                <Card className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight flex items-center gap-2">
                                <Terminal size={20} className="text-indigo-600" />
                                Authentication Anomalies
                            </h3>
                            <p className="text-sm text-slate-500 m-0">Daily failed login attempts (potential brute force tracking).</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={secData?.failedLoginTimeline}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* PII Audit Section */}
                <Card className="p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Lock size={120} />
                    </div>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight flex items-center gap-2">
                                <Eye size={20} className="text-amber-500" />
                                PII Reveal Audit Trail
                            </h3>
                            <p className="text-sm text-slate-500 m-0">Top actors accessing sensitive data in the last 7 days.</p>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {secData?.piiAccessLeaders?.length > 0 ? secData.piiAccessLeaders.map((actor: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                        {actor._id?.slice(-2).toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white m-0">Admin ID: {actor._id?.slice(-8)}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Last Access: {new Date(actor.lastAccess).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{actor.totalReveals}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Total Reveals</span>
                                </div>
                            </div>
                        )) : (
                            <div className="h-48 flex flex-col items-center justify-center text-slate-400 italic text-sm">
                                No PII access events recorded recently.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// Helper Icon as Lucide doesn't have ShieldLock in this version or I misremembered name
const ShieldLock = ({ className, size }: { className?: string, size?: number }) => (
    <div className={`relative ${className}`}>
        <ShieldCheck size={size} />
        <Lock size={(size || 24) * 0.4} className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4" />
    </div>
);

export default AdminSecurityHub;
