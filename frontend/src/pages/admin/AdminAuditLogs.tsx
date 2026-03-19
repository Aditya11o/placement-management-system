import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    History,
    Filter,
    Calendar,
    User,
    Shield,
    Clock,
    ArrowLeft,
    Download,
    ChevronLeft,
    ChevronRight,
    Database,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import api from '../../services/api';
import AuditDiffModal from '../../components/Admin/AuditDiffModal';

const ACTION_TYPES = [
    { value: '', label: 'All Actions' },
    { value: 'SETTINGS_UPDATE', label: 'Settings Update' },
    { value: 'ADMIN_ACTION', label: 'Admin Action' },
    { value: 'BAN_IP', label: 'IP Ban' },
    { value: 'UNBAN_IP', label: 'IP Unban' },
    { value: 'LOGIN', label: 'User Login' },
    { value: 'LOGOUT', label: 'User Logout' },
];

const AdminAuditLogs = ({ embedded = false }: { embedded?: boolean }) => {
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [filters, setFilters] = useState({
        action: '',
        startDate: '',
        endDate: '',
        search: '',
        user_id: '',
        ip_address: ''
    });

    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [isDiffOpen, setIsDiffOpen] = useState(false);

    const openDiff = (log: any) => {
        setSelectedLog(log);
        setIsDiffOpen(true);
    };

    // Build query params
    const getQueryParams = () => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('sort', '-created_at');

        if (filters.action) params.append('action', filters.action);
        if (filters.search) params.append('search', filters.search);
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.ip_address) params.append('ip_address', filters.ip_address);

        if (filters.startDate) params.append('created_at[gte]', new Date(filters.startDate).toISOString());
        if (filters.endDate) {
            const d = new Date(filters.endDate);
            d.setHours(23, 59, 59, 999);
            params.append('created_at[lte]', d.toISOString());
        }

        return params.toString();
    };

    const { data: logData, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['adminAuditLogs', page, filters],
        queryFn: async () => {
            const res = await api.get(`/admin/audit-logs?${getQueryParams()}`);
            return res.data;
        }
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page on filter change
    };

    const resetFilters = () => {
        setFilters({
            action: '',
            startDate: '',
            endDate: '',
            search: '',
            user_id: '',
            ip_address: ''
        });
        setPage(1);
    };

    const exportToCSV = () => {
        if (!logData?.data) return;

        const headers = ['Timestamp', 'Admin Name', 'Role', 'Action', 'Description', 'IP Address'];
        const rows = logData.data.map((log: any) => [
            new Date(log.created_at).toLocaleString(),
            log.user_id?.name || 'N/A',
            log.user_role,
            log.action,
            log.description,
            log.ip_address || '---'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`flex flex-col gap-6 animate-fade-in ${embedded ? 'w-full' : 'max-w-6xl mx-auto w-full'}`}>
            {/* Header Area */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        {!embedded ? (
                            <Link to="/admin/settings" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <ArrowLeft size={18} />
                            </Link>
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                <History size={22} />
                            </div>
                        )}
                        <h1 className={`${embedded ? 'text-xl' : 'text-3xl'} font-bold text-slate-800 dark:text-white m-0`}>
                            {embedded ? 'Audit Log Explorer' : 'Audit Log Explorer'}
                        </h1>
                    </div>
                    {!embedded && <p className="text-slate-500 dark:text-slate-400 text-base m-0 ml-9">Deep-dive into system security events and administrative actions.</p>}
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        icon={RefreshCw}
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className={isFetching ? 'animate-spin' : ''}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        icon={Download}
                        onClick={exportToCSV}
                        disabled={!logData?.data?.length}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="p-5 border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col gap-6">
                    {/* Primary Row: Keywords & Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Keyword Search */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                <History size={12} /> Keyword Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search description or IP..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                        </div>

                        {/* Actor ID Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                <User size={12} /> Actor ID
                            </label>
                            <input
                                type="text"
                                placeholder="Filter by User ID..."
                                value={filters.user_id}
                                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono"
                            />
                        </div>

                        {/* IP Direct Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                <Shield size={12} /> Specific IP
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 192.168.1.1"
                                value={filters.ip_address}
                                onChange={(e) => handleFilterChange('ip_address', e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono"
                            />
                        </div>
                    </div>

                    {/* Secondary Row: Meta & Chronology */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                <Filter size={12} /> Action Filter
                            </label>
                            <select
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
                            >
                                {ACTION_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                <Calendar size={12} /> From Date
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                <Calendar size={12} /> To Date
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <button
                                onClick={resetFilters}
                                className="w-full h-10 rounded-lg text-slate-500 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Log Table Area */}
            <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Security event</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Origin / Admin</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Protocol / IP</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-slate-800/50">
                                        <td className="px-6 py-5 relative">
                                            <div className="invisible absolute top-0 left-0 w-0.5 h-full opacity-0"></div>
                                            <div className="flex flex-col gap-2 relative z-10">
                                                <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded mb-0.5"></div>
                                                <div className="w-28 h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                                                <div className="flex flex-col gap-2 w-full">
                                                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                    <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-14 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="w-full max-w-md h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                            <div className="w-3/4 max-w-sm h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : isError ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-red-500">
                                            <AlertTriangle size={32} />
                                            <p className="font-semibold">Failed to load audit data engine.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logData?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Database size={48} className="text-slate-300" />
                                            <p className="text-lg font-medium text-slate-500">No logs matching current filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logData?.data?.map((log: any) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${log.action.includes('BAN') ? 'bg-red-500 text-white' :
                                                        log.action.includes('UPDATE') ? 'bg-indigo-600 text-white' :
                                                            log.action.includes('ADMIN') ? 'bg-amber-500 text-white' :
                                                                'bg-slate-600 text-white'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-slate-400 text-[11px] font-mono">
                                                        <Clock size={11} />
                                                        {new Date(log.created_at).toLocaleString(undefined, {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium ml-0.5">
                                                    {new Date(log.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                    {log.user_role === 'ADMIN' ? <Shield size={16} /> : <User size={16} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                        {log.user_id?.name || 'Automated System'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none">
                                                        {log.user_role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-700 shadow-sm">
                                                {log.ip_address || '0.0.0.0'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5 group-hover:pr-2">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-slate-100 dark:border-slate-800 pl-3 m-0">
                                                    {log.description}
                                                </p>
                                                {log.metadata && (Object.keys(log.metadata).length > 0) && (
                                                    <button 
                                                        onClick={() => openDiff(log)}
                                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 ml-3 flex items-center gap-1 transition-colors"
                                                    >
                                                        <History size={10} /> View Precise Changes
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!isLoading && logData?.pagination && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-sm text-slate-500 font-medium">
                            Showing <span className="text-slate-800 dark:text-white">{((page - 1) * limit) + 1}</span> to <span className="text-slate-800 dark:text-white">{Math.min(page * limit, logData.total || 0)}</span> of <span className="text-slate-800 dark:text-white">{logData.total}</span> entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={!logData.pagination.prev}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-1.5 px-3">
                                <span className="text-sm font-bold text-indigo-600 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
                                    {page}
                                </span>
                            </div>
                            <button
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={!logData.pagination.next}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Bottom Insight */}
            <div className="flex items-center gap-2 justify-center py-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl px-4">
                <Shield className="text-amber-600" size={16} />
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium m-0">
                    Audit logs are immutable and cryptographically indexed for security compliance.
                </p>
            </div>

            <AuditDiffModal 
                isOpen={isDiffOpen} 
                onClose={() => setIsDiffOpen(false)} 
                log={selectedLog} 
            />
        </div>
    );
};

export default AdminAuditLogs;
