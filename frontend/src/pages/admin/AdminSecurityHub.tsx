import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Eye, Terminal, Lock, Activity, AlertTriangle, Smartphone, ChevronRight, X, Settings } from 'lucide-react';
import Card from '../../components/Card/Card';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSecurityHub = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    // const { user } = useAuth(); // Removed unused
    
    // Stats Query
    const { data: secData, isLoading } = useQuery({
        queryKey: ['securityHubStats'],
        queryFn: async () => {
            const res = await api.get('/analytics/security-hub');
            return res.data.data;
        }
    });

    // 2FA Setup State
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [setupStep, setSetupStep] = useState(1);
    const [setupData, setSetupData] = useState<{ qrCodeUrl: string; secret: string } | null>(null);
    const [otpCode, setOtpCode] = useState('');

    // 2FA Mutations
    const setup2FAMutation = useMutation({
        mutationFn: () => api.post('/admin/2fa/setup'),
        onSuccess: (res) => {
            setSetupData(res.data);
            setSetupStep(2);
        },
        onError: (err: any) => addToast(err.response?.data?.message || 'Failed to initiate 2FA setup', 'error')
    });

    const verifySetupMutation = useMutation({
        mutationFn: (token: string) => api.post('/admin/2fa/verify', { token }),
        onSuccess: () => {
            addToast('2FA enabled successfully', 'success');
            setShow2FASetup(false);
            setSetupStep(1);
            setOtpCode('');
            queryClient.invalidateQueries({ queryKey: ['securityHubStats'] });
        },
        onError: (err: any) => addToast(err.response?.data?.message || 'Invalid code', 'error')
    });

    if (isLoading) {
        return <div className="p-8 animate-pulse text-slate-400">Loading Security Infrastructure...</div>;
    }

    return (
        <div className="flex flex-col gap-8 animate-fade-in p-6 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <ShieldLock className="text-indigo-600" size={32} />
                        Security Observability Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 m-0 font-medium">Real-time threat detection, PII audit trail, and multi-factor authentication.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20 flex items-center gap-2 font-bold text-sm">
                        <ShieldCheck size={18} /> System Secure
                    </div>
                </div>
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Security Score */}
                <Card className="p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 to-indigo-950 border-none shadow-xl">
                    <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={276} strokeDashoffset={276 - (276 * (secData?.securityScore || 0)) / 100} className="text-indigo-500 transition-all duration-1000" />
                        </svg>
                        <span className="absolute text-2xl font-black text-white">{secData?.securityScore || 0}%</span>
                    </div>
                    <h3 className="text-white font-bold m-0 uppercase tracking-widest text-[10px] opacity-60">Security Health Score</h3>
                </Card>

                {/* 2FA Configuration Card */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
                    <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Smartphone size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white m-0">2FA Protection</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium leading-relaxed">
                            Add an extra layer of security to your account using an authenticator app.
                        </p>
                        <button 
                            onClick={() => setShow2FASetup(true)}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Settings size={14} /> Configure MFA
                        </button>
                    </div>
                </Card>

                {/* RBAC Controls Card */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
                    <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <Lock size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white m-0">RBAC Policy</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium leading-relaxed">
                            Manage department heads and sub-admin roles with branch-level isolation.
                        </p>
                        <button 
                            onClick={() => window.location.href='/admin/rbac'}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2"
                        >
                            Access RBAC <ChevronRight size={14} />
                        </button>
                    </div>
                </Card>

                {/* PII Audit Card */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
                    <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                <Eye size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white m-0">Audit Status</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{secData?.piiAccessLeaders?.[0]?.totalReveals || 0}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest m-0">Peak Access Score</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase">Active</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Alert Ticker */}
            {secData?.criticalAlerts?.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
                    <AlertTriangle className="text-red-600 shrink-0 animate-pulse" size={24} />
                    <div className="flex-1 overflow-hidden relative h-6">
                        <div className="absolute inset-0 flex items-center gap-12 animate-marquee">
                            {secData.criticalAlerts.map((alert: any, i: number) => (
                                <span key={i} className="text-red-700 font-bold text-sm whitespace-nowrap tracking-tight uppercase">• {alert.message}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Login Anomalies */}
                <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white m-0 tracking-tight flex items-center gap-2">
                                <Terminal size={20} className="text-indigo-600" />
                                Authentication Anomalies
                            </h3>
                            <p className="text-sm text-slate-500 m-0 font-medium">Daily failed login attempts (potential brute force tracking).</p>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={secData?.failedLoginTimeline}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* PII Audit Activity */}
                <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6 pt-2">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white m-0 tracking-tight flex items-center gap-2">
                                <Eye size={20} className="text-amber-500" />
                                PII Reveal Audit Trail
                            </h3>
                            <p className="text-sm text-slate-500 m-0 font-medium">Top actors accessing sensitive student data.</p>
                        </div>
                    </div>

                    <div className="space-y-3 mt-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                        {secData?.piiAccessLeaders?.length > 0 ? secData.piiAccessLeaders.map((actor: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                                <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                                        {actor._id?.slice(-2).toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black m-0 tracking-tight">Admin ID: {actor._id?.slice(-8)}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-1">
                                            <Activity size={10} /> Last: {new Date(actor.lastAccess).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black text-slate-900 dark:text-white block leading-none">{actor.totalReveals}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Total Events</span>
                                </div>
                            </div>
                        )) : (
                            <div className="h-48 flex flex-col items-center justify-center text-slate-400 italic text-sm">
                                <Activity size={32} className="mb-2 opacity-20" />
                                No PII access events recorded recently.
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* MFA Setup Modal Overlay */}
            <AnimatePresence>
                {show2FASetup && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-white/10"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Multi-Factor Auth</h2>
                                    <button onClick={() => setShow2FASetup(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                                        <X size={20} />
                                    </button>
                                </div>

                                {setupStep === 1 ? (
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <ShieldCheck size={40} className="text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Enhance Account Security</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed px-4">
                                            Setup TOTP-based authentication using Google Authenticator, Authy, or any compatible app.
                                        </p>
                                        <button 
                                            onClick={() => setup2FAMutation.mutate()}
                                            disabled={setup2FAMutation.isPending}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {setup2FAMutation.isPending ? 'Connecting...' : 'Start Setup'}
                                            {!setup2FAMutation.isPending && <ChevronRight size={18} />}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl flex flex-col items-center border border-slate-100 dark:border-slate-700">
                                            {setupData?.qrCodeUrl ? (
                                                <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 rounded-2xl shadow-sm border-4 border-white dark:border-slate-600" />
                                            ) : (
                                                <div className="w-48 h-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl" />
                                            )}
                                            <div className="mt-4 text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Backup Code</p>
                                                <code className="text-[11px] font-mono font-bold bg-white dark:bg-slate-700 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                                                    {setupData?.secret}
                                                </code>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 mb-2 block">Confirm Code</label>
                                                <input 
                                                    autoFocus
                                                    type="text" 
                                                    maxLength={6}
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="000 000"
                                                    className="w-full h-14 text-center text-3xl font-black tracking-[0.4em] bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-0 transition-all outline-none text-slate-800 dark:text-white"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => verifySetupMutation.mutate(otpCode)}
                                                disabled={verifySetupMutation.isPending || otpCode.length < 6}
                                                className="w-full py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 shadow-xl active:scale-95"
                                            >
                                                {verifySetupMutation.isPending ? 'Confirming...' : 'Verify & Enable'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper components
const ShieldLock = ({ className, size }: { className?: string, size?: number }) => (
    <div className={`relative ${className}`}>
        <ShieldCheck size={size || 24} />
        <Lock size={(size || 24) * 0.4} className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4" />
    </div>
);

export default AdminSecurityHub;
