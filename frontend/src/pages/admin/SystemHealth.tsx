import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Mail, 
  Cloud, 
  Clock, 
  Cpu, 
  MemoryStick as Memory, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface HealthData {
  timestamp: string;
  system: {
    uptime: number;
    nodeVersion: string;
    platform: string;
    arch: string;
    cpuCount: number;
    loadAverage: number[];
    memory: {
      total: number;
      free: number;
      process: number;
    };
  };
  connectivity: {
    database: string;
    smtp: string;
    cloudinary: string;
  };
  logs: {
    recent: any[];
    dailyErrorCount: number;
  };
}

const SystemHealth: React.FC = () => {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [history, setHistory] = useState<{ time: string; memory: number; load: number }[]>([]);

  const fetchHealth = async () => {
    try {
      const response = await axios.get('/api/admin/health/system');
      setData(response.data);
      setLastUpdated(new Date());
      
      const newEntry = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        memory: Math.round(response.data.system.memory.process / 1024 / 1024),
        load: response.data.system.loadAverage[0]
      };
      
      setHistory(prev => [...prev.slice(-19), newEntry]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('Failed to fetch system health data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchHealth, 30000); // 30s auto-refresh as requested
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(' ') || '< 1m';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'Error':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-500 bg-emerald-50';
    if (status >= 400 && status < 500) return 'text-amber-500 bg-amber-50';
    if (status >= 500) return 'text-rose-500 bg-rose-50';
    return 'text-slate-500 bg-slate-50';
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-indigo-600" />
            System Health Monitoring
          </h1>
          <p className="text-slate-500 mt-1">Real-time operational status and resource analytics for Super Admins.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
            <Clock className="w-4 h-4" />
            Last Updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
              autoRefresh 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh && loading ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Resource Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Server Uptime</span>
              <Server className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{data ? formatUptime(data.system.uptime) : '---'}</div>
            <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               System Stable
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Memory (Process)</span>
              <Memory className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {data ? formatBytes(data.system.memory.process) : '---'}
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
               <div 
                className="bg-blue-500 h-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, (data?.system.memory.process || 0) / (128 * 1024 * 1024) * 100)}%` }}
              ></div>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 text-right">Target 128MB max</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">CPU Load (1m)</span>
              <Cpu className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {data ? data.system.loadAverage[0].toFixed(2) : '---'}
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
               <div 
                className="bg-amber-500 h-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, (data?.system.loadAverage[0] || 0) * 50)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Resource Charts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
              Performance Monitor
            </h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-indigo-500"></div>
                  <span className="text-xs text-slate-500">Memory (MB)</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-orange-400"></div>
                  <span className="text-xs text-slate-500">Load Avg</span>
               </div>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorMem)" 
                  strokeWidth={2}
                  name="Memory (MB)"
                  isAnimationActive={false}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="load" 
                  stroke="#fb923c" 
                  fill="transparent"
                  strokeWidth={2}
                  name="CPU Load"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Connectivity Summary */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Service Gateway</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg"><Database className="w-5 h-5 text-indigo-600" /></div>
                <span className="font-medium text-slate-700">Database</span>
              </div>
              <div className="flex items-center gap-2">
                {data && getStatusIcon(data.connectivity.database)}
                <span className={`text-sm font-semibold ${data?.connectivity.database === 'Connected' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data?.connectivity.database || 'Pinging...'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">PostgreSQL (Supabase)</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg"><Mail className="w-5 h-5 text-indigo-600" /></div>
                <span className="font-medium text-slate-700">Mail (SMTP)</span>
              </div>
              <div className="flex items-center gap-2">
                {data && getStatusIcon(data.connectivity.smtp)}
                <span className={`text-sm font-semibold ${data?.connectivity.smtp === 'Connected' ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {data?.connectivity.smtp || 'Authenticating...'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Nodemailer Transport</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg"><Cloud className="w-5 h-5 text-indigo-600" /></div>
                <span className="font-medium text-slate-700">Storage</span>
              </div>
              <div className="flex items-center gap-2">
                {data && getStatusIcon(data.connectivity.cloudinary)}
                <span className={`text-sm font-semibold ${data?.connectivity.cloudinary === 'Connected' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data?.connectivity.cloudinary || 'Connecting...'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Cloudinary Assets</p>
            </div>
          </div>
        </motion.div>

        {/* Global Error Stat */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-slate-900 p-6 rounded-xl text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-300">Error Sentinel (24h)</h3>
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{data?.logs.dailyErrorCount || 0}</span>
              <span className="text-slate-400 font-medium">unresolved issues detected</span>
            </div>
            <div className="mt-4 bg-white/10 p-3 rounded-lg flex items-center justify-between border border-white/10 group hover:bg-white/15 cursor-pointer transition-all">
                <span className="text-sm font-medium">Browse detailed error logs</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl"></div>
        </motion.div>
      </div>

      {/* Traffic Analysis Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Traffic Control Center</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter endpoint..." 
              className="pl-9 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Response</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {data?.logs.recent.map((log: any, idx: number) => (
                  <motion.tr 
                    key={idx}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        log.method === 'GET' ? 'bg-blue-50 text-blue-600' : 
                        log.method === 'POST' ? 'bg-emerald-50 text-emerald-600' :
                        log.method === 'PATCH' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium truncate max-w-[240px]">
                      {log.url}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {log.responseTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                      {log.ip?.replace('::ffff:', '')}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 font-medium italic">
           Real-time ingestion: Monitoring latest 50 requests
        </div>
      </motion.div>
    </div>
  );
};

export default SystemHealth;
