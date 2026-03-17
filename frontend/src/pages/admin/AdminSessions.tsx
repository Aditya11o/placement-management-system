import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    Shield, 
    Smartphone, 
    Monitor, 
    Globe, 
    Clock, 
    XCircle, 
    RefreshCw, 
    Search,
    User,
    ShieldAlert,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '../../context/ToastContext';

interface Session {
    _id: string;
    user_id: {
        _id: string;
        name?: string;
        email: string;
        company_name?: string;
        contact_person?: string;
    };
    device_info: {
        browser: string;
        os: string;
        device: string;
    };
    ip_address: string;
    created_at: string;
    expires_at: string;
}

const AdminSessions: React.FC = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: sessions, isLoading, refetch } = useQuery({
        queryKey: ['admin-sessions'],
        queryFn: async () => {
            const res = await api.get('/admin/sessions');
            return res.data.data as Session[];
        }
    });

    const revokeMutation = useMutation({
        mutationFn: (sessionId: string) => api.delete(`/admin/sessions/${sessionId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
            addToast('Session revoked successfully', 'success');
        },
        onError: () => {
            addToast('Failed to revoke session', 'error');
        }
    });

    const filteredSessions = sessions?.filter(session => {
        const userName = session.user_id?.name || session.user_id?.company_name || '';
        const userEmail = session.user_id?.email || '';
        return (
            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.ip_address.includes(searchTerm)
        );
    });

    const getDeviceIcon = (device: string) => {
        if (device?.toLowerCase().includes('mobile')) return <Smartphone size={18} />;
        return <Monitor size={18} />;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/30 dark:bg-transparent">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                            <Shield className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight m-0">Active Sessions</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Monitor and manage all active authentication sessions across the platform.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm group"
                    >
                        <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh List
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm glass-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{sessions?.length || 0}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Total Active Sessions</div>
                </div>

                <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm glass-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                            <Smartphone size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                        {sessions?.filter(s => s.device_info.device?.toLowerCase().includes('mobile')).length || 0}
                    </div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Mobile Device Users</div>
                </div>

                <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm glass-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                            <ShieldAlert size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                        {Array.from(new Set(sessions?.map(s => s.ip_address))).length}
                    </div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Unique IPs Detected</div>
                </div>
            </div>

            {/* Search and Table Area */}
            <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden glass-card">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by user name, email or IP..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50">User Profile</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50">Device & OS</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50">Network Info</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50">Activity</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredSessions?.map((session, index) => (
                                    <motion.tr 
                                        key={session._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-50 dark:border-slate-800/50"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold border-2 border-white dark:border-slate-900 shadow-sm overflow-hidden">
                                                    <User size={20} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                        {session.user_id?.name || session.user_id?.company_name || 'System User'}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 font-medium truncate">{session.user_id?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    {getDeviceIcon(session.device_info.device)}
                                                    <span className="text-[13px] font-bold">{session.device_info.browser || 'Unknown Browser'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                        {session.device_info.os || 'Unknown OS'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                                    <Globe size={12} />
                                                    <span className="text-[13px] font-mono font-bold tracking-tight">{session.ip_address}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Public Address</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <Clock size={12} />
                                                    <span className="text-[12px] font-medium">
                                                        Logged in {(() => {
                                                            try {
                                                                const date = new Date(session.created_at);
                                                                return isNaN(date.getTime()) ? 'Time Unknown' : format(date, 'MMM d, p');
                                                            } catch (e) {
                                                                return 'Time Unknown';
                                                            }
                                                        })()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Active Now</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm('Are you sure you want to forcefully revoke this session? The user will be logged out immediately.')) {
                                                        revokeMutation.mutate(session._id);
                                                    }
                                                }}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
                                                title="Revoke Session"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {isLoading && (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!isLoading && filteredSessions?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-200">
                                                <Search size={48} />
                                            </div>
                                            <p className="text-slate-500 font-medium">No active sessions found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Security Footer */}
            <div className="mt-8 flex items-center justify-between p-6 bg-slate-900 dark:bg-slate-800/30 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Shield className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white m-0 tracking-tight">System-wide Session Guard Active</p>
                        <p className="text-xs text-slate-400 m-0">Sessions are automatically cleared after 7 days of inactivity (TTL indexed).</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest group">
                        Security Logs <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSessions;
