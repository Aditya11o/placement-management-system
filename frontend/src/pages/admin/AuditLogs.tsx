import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, 
  Calendar, RefreshCw,
  Clock, User, Shield
} from 'lucide-react';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = useCallback(async (isAuto = false) => {
    try {
      if (!isAuto) setRefreshing(true);
      const res = await api.get('/audit?limit=50');
      // res.data is { logs, page, pages, total }
      setLogs(res.data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchLogs(true), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('login') || actionLower.includes('logout'))
      return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100 italic">AUTH: {action}</span>;
    
    if (actionLower.includes('job'))
      return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">JOB: {action}</span>;
    
    if (actionLower.includes('application') || actionLower.includes('offer'))
      return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-purple-50 text-purple-600 border-purple-100">APP: {action}</span>;

    if (actionLower.includes('profile') || actionLower.includes('resume'))
      return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-amber-50 text-amber-600 border-amber-100">PROFILE: {action}</span>;

    return (
      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-gray-50 text-gray-500 border-gray-100">
        {action}
      </span>
    );
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Audit logs</h1>
          <p className="text-gray-500 font-bold mt-1 tracking-tight">Real-time record of all system-wide user activity.</p>
        </div>
        <div className="flex items-center gap-4 mb-1">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Updates</span>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-[10px] font-black p-1 rounded hover:bg-white transition-all ${autoRefresh ? 'text-blue-600' : 'text-gray-400'}`}
              >
                {autoRefresh ? 'ON' : 'OFF'}
              </button>
           </div>
           <button 
             onClick={() => fetchLogs()}
             disabled={refreshing}
             className={`p-2 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all ${refreshing ? 'animate-spin border-blue-500 text-blue-500 shadow-none' : 'text-gray-500'}`}
           >
             <RefreshCw size={18} />
           </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by action, user or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border-transparent focus:bg-white focus:border-blue-200 rounded-2xl font-bold text-[13px] outline-none transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-3">
            <button className="p-3.5 bg-gray-50 text-gray-400 rounded-xl hover:text-gray-900 hover:bg-gray-100 transition-all">
              <Filter size={18} />
            </button>
            <button className="p-3.5 bg-gray-50 text-gray-400 rounded-xl hover:text-gray-900 hover:bg-gray-100 transition-all">
              <Calendar size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Timestamp</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Subject</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Action</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Entity</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">IP Address</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-gray-900">{new Date(log.createdAt).toLocaleDateString()}</span>
                      <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${log.admin?.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        {log.admin?.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-gray-900">{log.admin?.name}</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{log.admin?.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">
                        {log.targetType || log.type || 'SYSTEM'}
                      </span>
                      {log.targetId && (
                        <span className="text-[10px] font-bold text-gray-300 font-mono">#{log.targetId.slice(-6)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-[11px] text-gray-400">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="px-6 py-5 text-right max-w-[300px]">
                    <p className="text-[13px] font-bold text-gray-600 truncate group-hover:text-clip group-hover:whitespace-normal transition-all">
                      {log.details}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center font-bold text-gray-400 uppercase tracking-widest italic">
                    No activity records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
