import React from 'react';
import { 
  History, 
  LogIn, 
  FileText, 
  Briefcase, 
  User, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { useAuditLogs, AuditLog } from '../../hooks/useAuditLogs';
import { formatDistanceToNow } from 'date-fns';

const ActivityTimeline: React.FC = () => {
  const { logs, loading, error } = useAuditLogs();

  const getIcon = (type: string) => {
    switch (type) {
      case 'AUTH': return <LogIn className="w-4 h-4" />;
      case 'APPLICATION': return <Briefcase className="w-4 h-4" />;
      case 'PROFILE': return <User className="w-4 h-4" />;
      case 'JOB': return <ShieldCheck className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'AUTH': return 'bg-blue-500/10 text-blue-600';
      case 'APPLICATION': return 'bg-purple-500/10 text-purple-600';
      case 'PROFILE': return 'bg-amber-500/10 text-amber-600';
      case 'JOB': return 'bg-emerald-500/10 text-emerald-600';
      default: return 'bg-surface-container-high text-on-surface-variant/40';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Recent Activity
        </h3>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 border border-outline-variant/30 h-full">
      <h3 className="text-[13px] font-black text-on-surface uppercase tracking-tight mb-8 flex items-center gap-2 italic">
        <History className="w-4 h-4 text-surface-tint" />
        Activity <span className="text-surface-tint">Feed</span>
      </h3>

      {error ? (
        <div className="text-center py-10">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">No recent activity found.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
          
          <div className="space-y-8 relative">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 group">
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${getIconBg(log.type)}`}>
                  {getIcon(log.type)}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-black text-on-surface leading-none italic uppercase tracking-tight">
                    {log.action}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/40 mt-1.5 flex items-center gap-1 font-bold uppercase">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                  {log.details && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100/50">
                       <p className="text-[11px] text-gray-400 font-mono break-all line-clamp-2">
                         {typeof log.details === 'string' && log.details.startsWith('{') ? 'Metadata Attached' : log.details}
                       </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button className="w-full mt-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-surface-tint hover:bg-surface-tint/5 rounded-2xl transition-all border border-dashed border-outline-variant/50">
        Trace Full History
      </button>
    </div>
  );
};

export default ActivityTimeline;
