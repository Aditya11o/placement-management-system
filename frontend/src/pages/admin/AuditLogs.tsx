import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, 
  Calendar, Loader2, RefreshCw, 
  FileText, Shield, UserPlus, Send
} from 'lucide-react';
import api from '../../api';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit');
        setLogs(res.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    const styles: any = {
      'VERIFY_USER': 'bg-blue-50 text-blue-600 border-blue-100',
      'VERIFY_SKILL': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'SEND_BROADCAST': 'bg-purple-50 text-purple-600 border-purple-100',
      'JOB_APPROVAL': 'bg-orange-50 text-orange-600 border-orange-100',
      'DEFAULT': 'bg-gray-50 text-gray-500 border-gray-100'
    };
    const style = styles[action] || styles['DEFAULT'];
    return (
      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${style}`}>
        {action.replace('_', ' ')}
      </span>
    );
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Audit logs</h1>
        <p className="text-gray-500 font-bold mt-1 tracking-tight">Transparent record of all administrative actions and system changes.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by action, admin or details..."
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
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Administrator</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Action</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Target</th>
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
                      <span className="text-[11px] font-bold text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                        {log.admin?.name?.[0] || 'A'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-gray-900">{log.admin?.name}</span>
                        <span className="text-[11px] font-bold text-gray-400">{log.admin?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">
                        {log.targetType || 'SYSTEM'}
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
