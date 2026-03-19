import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Activity, Database, Server, Cpu, HardDrive, Wifi, WifiOff,
    Cloud, Mail, RefreshCw, Loader2, CheckCircle, XCircle,
    Clock, Gauge, Users, Zap
} from 'lucide-react';
import axios from 'axios';
import { motion, Variants } from 'framer-motion';
import Card from '../../components/Card/Card';

// Base URL for direct health API calls (bypasses auth interceptor)
const HEALTH_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ── Types ────────────────────────────────────────────────────────────────────
interface ServiceStatus {
    status: 'UP' | 'DOWN';
    latencyMs: number | null;
    memoryUsed?: string | null;
}

interface HealthData {
    status: 'HEALTHY' | 'DEGRADED';
    timestamp: string;
    responseTimeMs: string;
    services: {
        mongodb: ServiceStatus;
        redis: ServiceStatus;
        smtp: ServiceStatus;
        cloudinary: ServiceStatus;
    };
    process: {
        heapUsed: string;
        heapTotal: string;
        heapUsagePercent: string;
        rss: string;
        external: string;
        uptimeSeconds: number;
        uptimeFormatted: string;
        nodeVersion: string;
        pid: number;
    };
    system: {
        platform: string;
        arch: string;
        hostname: string;
        cpuCores: number;
        cpuModel: string;
        cpuLoadAvg: { '1m': string; '5m': string; '15m': string };
        memory: {
            total: string;
            used: string;
            free: string;
            usagePercent: string;
        };
    };
    realtime: {
        connectedUsers: number;
    };
}

// ── Service Config ───────────────────────────────────────────────────────────
const SERVICE_META: Record<string, { label: string; icon: React.ElementType; description: string }> = {
    mongodb: { label: 'MongoDB', icon: Database, description: 'Primary database' },
    redis: { label: 'Redis', icon: Zap, description: 'Cache & session store' },
    smtp: { label: 'SMTP', icon: Mail, description: 'Email service' },
    cloudinary: { label: 'Cloudinary', icon: Cloud, description: 'File storage CDN' },
};

// ── Motion Variants ────────────────────────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

// ── Component ────────────────────────────────────────────────────────────────
const AdminSystemHealth: React.FC = () => {
    const { data: health, isLoading, dataUpdatedAt } = useQuery<HealthData>({
        queryKey: ['system-health'],
        queryFn: async () => {
            const res = await axios.get(`${HEALTH_BASE}/health`, {
                validateStatus: (status) => status === 200 || status === 503,
            });
            return res.data;
        },
        refetchInterval: 10000, // Auto-poll every 10s
        retry: false,
    });


    const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—';

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-3">
                        <Activity size={28} /> System Health
                    </h1>
                </div>
                <Card className="p-12">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Connecting to health endpoint...</span>
                    </div>
                </Card>
            </div>
        );
    }

    if (!health) {
        return (
            <div className="flex flex-col gap-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-3">
                        <Activity size={28} /> System Health
                    </h1>
                </div>
                <Card className="p-12 text-center">
                    <XCircle size={48} className="text-red-300 dark:text-red-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-500">Unable to Reach Health Endpoint</h3>
                    <p className="text-sm text-slate-400">The backend health API is unreachable.</p>
                </Card>
            </div>
        );
    }

    const isHealthy = health.status === 'HEALTHY';

    return (
        <div className="flex flex-col gap-6 animate-fade-in overflow-hidden">
            {/* Header + Overall Status Banner */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-3">
                        <Activity size={28} /> System Health
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0">Real-time infrastructure monitoring — auto-refreshes every 10s</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        <RefreshCw size={12} className="inline mr-1" />
                        {lastUpdated}
                    </span>
                    <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${isHealthy
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}>
                        {isHealthy ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {health.status}
                    </div>
                </div>
            </div>


            {/* ── Service Status Cards ───────────────────────────────────────── */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {Object.entries(health.services).map(([key, svc]) => {
                    const meta = SERVICE_META[key];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    const isUp = svc.status === 'UP';

                    return (
                        <motion.div key={key} variants={itemVariants}>
                            <Card className={`p-5 h-full relative overflow-hidden transition-all ${isUp ? '' : 'border-red-200 dark:border-red-800'
                                }`}>
                                {/* Glow effect */}
                                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 ${isUp ? 'bg-emerald-500' : 'bg-red-500'
                                    }`} />

                                <div className="flex items-center justify-between mb-3 relative z-10">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUp
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'bg-red-50 dark:bg-red-900/20'
                                        }`}>
                                        <Icon size={20} className={isUp ? 'text-emerald-500' : 'text-red-500'} />
                                    </div>
                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {isUp ? <Wifi size={12} /> : <WifiOff size={12} />}
                                        {svc.status}
                                    </span>
                                </div>

                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 m-0">{meta.label}</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{meta.description}</p>

                                <div className="flex items-center gap-3 mt-3">
                                    {svc.latencyMs != null && (
                                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                            {svc.latencyMs}ms
                                        </span>
                                    )}
                                    {svc.memoryUsed && (
                                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                            {svc.memoryUsed}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ── Metrics Grid ──────────────────────────────────────────────── */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
                {/* Node.js Process Metrics */}
                <motion.div variants={itemVariants}>
                    <Card className="p-5 h-full">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
                            <Server size={16} className="text-indigo-500" /> Node.js Process
                        </h3>
                        <div className="space-y-3">
                            <MetricRow label="Heap Used" value={health.process.heapUsed} sub={`of ${health.process.heapTotal}`} />
                            <MetricRow label="Heap Usage" value={health.process.heapUsagePercent} />
                            <MetricRow label="RSS (Total Alloc)" value={health.process.rss} />
                            <MetricRow label="External (C++)" value={health.process.external} />
                            <div className="h-px bg-slate-200 dark:bg-slate-700" />
                            <MetricRow label="Uptime" value={health.process.uptimeFormatted} icon={Clock} />
                            <MetricRow label="Node Version" value={health.process.nodeVersion} />
                            <MetricRow label="PID" value={String(health.process.pid)} />
                        </div>
                    </Card>
                </motion.div>

                {/* System / OS Metrics */}
                <motion.div variants={itemVariants}>
                    <Card className="p-5 h-full">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
                            <Cpu size={16} className="text-amber-500" /> System / OS
                        </h3>
                        <div className="space-y-3">
                            <MetricRow label="Platform" value={`${health.system.platform} (${health.system.arch})`} />
                            <MetricRow label="Hostname" value={health.system.hostname} />
                            <MetricRow label="CPU Model" value={health.system.cpuModel} small />
                            <MetricRow label="CPU Cores" value={String(health.system.cpuCores)} />
                            <div className="h-px bg-slate-200 dark:bg-slate-700" />
                            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider m-0">CPU Load Averages</h4>
                            <div className="flex gap-2">
                                {Object.entries(health.system.cpuLoadAvg).map(([period, val]) => (
                                    <span key={period} className="flex-1 text-center text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                        <span className="block text-slate-400 dark:text-slate-500 mb-0.5">{period}</span>
                                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">{val}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Memory & Realtime */}
                <motion.div variants={itemVariants}>
                    <Card className="p-5 h-full">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
                            <HardDrive size={16} className="text-purple-500" /> Memory & Realtime
                        </h3>
                        <div className="space-y-3">
                            <MetricRow label="OS Memory Used" value={health.system.memory.used} sub={`of ${health.system.memory.total}`} />
                            <MetricRow label="OS Memory Free" value={health.system.memory.free} />
                            <MetricRow label="OS Memory Usage" value={health.system.memory.usagePercent} />

                            {/* Memory Bar */}
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                                    style={{ width: health.system.memory.usagePercent }}
                                />
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-slate-700" />

                            {/* Realtime */}
                            <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/15 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-indigo-500" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Connected Users</span>
                                </div>
                                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{health.realtime.connectedUsers}</span>
                            </div>

                            {/* API Response Time */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Gauge size={16} className="text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">API Response Time</span>
                                </div>
                                <span className="text-sm font-bold font-mono text-slate-600 dark:text-slate-300">{health.responseTimeMs}ms</span>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};

// ── MetricRow Sub-component ──────────────────────────────────────────────────
const MetricRow: React.FC<{ label: string; value: string; sub?: string; icon?: React.ElementType; small?: boolean }> = ({ label, value, sub, icon: Icon, small }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            {Icon && <Icon size={13} className="text-slate-400 dark:text-slate-500" />}
            <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        <div className="text-right">
            <span className={`font-mono font-semibold text-slate-700 dark:text-slate-200 ${small ? 'text-[11px]' : 'text-sm'}`}>{value}</span>
            {sub && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">{sub}</span>}
        </div>
    </div>
);

export default AdminSystemHealth;
