import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import { Briefcase, Users, CheckCircle, TrendingUp, Plus, RefreshCw, Radio, Download, FileText, FileSpreadsheet, Trophy, ArrowUp, ArrowDown, Minus, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';
import { format, subDays, parseISO, isSameDay } from 'date-fns';
import { Clock, Calendar as CalendarIcon, MapPin, Video } from 'lucide-react';
import { exportDashboardCSV, exportDashboardPDF } from '../../utils/export';

// ── Types ────────────────────────────────────────────────────────────────────
interface RecruiterStats {
    activeJobs: number;
    totalApplicants: number;
    shortlisted: number;
    hired: number;
}

type DateRange = 7 | 14 | 30;

// ── Fetch helpers ─────────────────────────────────────────────────────────────
const fetchRecruiterStats = async (): Promise<RecruiterStats> => {
    const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs/recruiter'),
        api.get('/applications/recruiter'),
    ]);
    const jobs: any[] = jobsRes.data?.data ?? [];
    const apps: any[] = appsRes.data?.data ?? [];
    return {
        activeJobs: jobs.filter((j) => j.status === 'ACTIVE').length || jobs.length,
        totalApplicants: apps.length,
        shortlisted: apps.filter((a) => a.status === 'SHORTLISTED').length,
        hired: apps.filter((a) => a.status === 'HIRED' || a.status === 'SELECTED').length,
    };
};

const fetchApplications = async (): Promise<any[]> => {
    const res = await api.get('/applications/recruiter');
    return res.data?.data || [];
};

// Real Interviews for widget
const fetchInterviews = async (): Promise<any[]> => {
    const res = await api.get('/interviews');
    return res.data?.data || [];
};

// ── Component ─────────────────────────────────────────────────────────────────
const LIVE_INTERVAL = 30_000; // 30 seconds

const RecruiterDashboard: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // ── Real-time controls ────────────────────────────────────────────────────
    const [isLive, setIsLive] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>(14);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const onSuccess = useCallback(() => setLastUpdated(new Date()), []);

    const queryOpts = {
        enabled: !!user,
        refetchInterval: isLive ? LIVE_INTERVAL : false as const,
        refetchIntervalInBackground: false,
    };

    const { data: stats, isPending: sLoading, isError: sError, refetch: refetchStats } = useQuery({
        queryKey: ['recruiterStats'],
        queryFn: fetchRecruiterStats,
        ...queryOpts,
    });

    const { data: jobs = [], isPending: jLoading, isError: jError, refetch: refetchJobs } = useQuery({
        queryKey: ['recruiterJobs', 'recent'],
        queryFn: async () => {
            const res = await api.get('/jobs/recruiter');
            return res.data.data;
        },
        ...queryOpts,
    });

    const { data: notifyStats, isPending: nLoading, isError: nError, refetch: refetchNotify } = useQuery({
        queryKey: ['recruiterNotifyStats'],
        queryFn: async () => {
            const res = await api.get('/notifications/recruiter/stats');
            return res.data.data;
        },
        ...queryOpts,
    });

    const { data: applications = [], isPending: appsLoading, refetch: refetchApps } = useQuery({
        queryKey: ['recruiterAppsAnalytics'],
        queryFn: fetchApplications,
        ...queryOpts,
    });

    const { data: interviews = [], isPending: iLoading, refetch: refetchInterviews } = useQuery({
        queryKey: ['recruiterInterviewsWidget'],
        queryFn: fetchInterviews,
        ...queryOpts,
    });

    // Handle toast error triggering just once if queries fail
    React.useEffect(() => {
        if (sError || jError || nError) addToast('Failed to load dashboard data', 'error');
    }, [sError, jError, nError, addToast]);

    // Manual refresh – refetch all queries at once
    const handleManualRefresh = useCallback(async () => {
        await Promise.all([refetchStats(), refetchJobs(), refetchNotify(), refetchApps(), refetchInterviews()]);
        onSuccess();
        addToast('Dashboard refreshed', 'success');
    }, [refetchStats, refetchJobs, refetchNotify, refetchApps, refetchInterviews, onSuccess, addToast]);

    // ── Derived date filter ───────────────────────────────────────────────────
    const cutoff = useMemo(() => subDays(new Date(), dateRange), [dateRange]);
    const prevCutoff = useMemo(() => subDays(new Date(), dateRange * 2), [dateRange]);

    const filteredApps = useMemo(
        () => applications.filter(app => app.createdAt && parseISO(app.createdAt) >= cutoff),
        [applications, cutoff]
    );

    const prevApps = useMemo(
        () => applications.filter(app => {
            if (!app.createdAt) return false;
            const d = parseISO(app.createdAt);
            return d >= prevCutoff && d < cutoff;
        }),
        [applications, prevCutoff, cutoff]
    );

    // ── Period Comparison Deltas ──────────────────────────────────────────────
    const delta = useMemo(() => {
        const calcDelta = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return Math.round(((curr - prev) / prev) * 100);
        };
        const currApplicants = filteredApps.length;
        const prevApplicants = prevApps.length;
        const currShortlisted = filteredApps.filter((a: any) => ['SHORTLISTED', 'SELECTED', 'HIRED'].includes(a.status)).length;
        const prevShortlisted = prevApps.filter((a: any) => ['SHORTLISTED', 'SELECTED', 'HIRED'].includes(a.status)).length;
        const currHired = filteredApps.filter((a: any) => ['SELECTED', 'HIRED'].includes(a.status)).length;
        const prevHired = prevApps.filter((a: any) => ['SELECTED', 'HIRED'].includes(a.status)).length;
        return {
            applicants: calcDelta(currApplicants, prevApplicants),
            shortlisted: calcDelta(currShortlisted, prevShortlisted),
            hired: calcDelta(currHired, prevHired),
        };
    }, [filteredApps, prevApps]);

    // ── Recruiter Leaderboard ─────────────────────────────────────────────────
    const leaderboard = useMemo(() => {
        const board: Record<string, { name: string; hires: number; apps: number }> = {};
        applications.forEach((app: any) => {
            const recruiter = typeof app.job?.recruiter_id === 'object'
                ? app.job.recruiter_id
                : null;
            const key = recruiter?._id || 'you';
            const name = recruiter?.name || user?.name || 'You';
            if (!board[key]) board[key] = { name, hires: 0, apps: 0 };
            board[key].apps += 1;
            if (['SELECTED', 'HIRED'].includes(app.status)) board[key].hires += 1;
        });
        return Object.values(board)
            .sort((a, b) => b.hires - a.hires)
            .slice(0, 5);
    }, [applications, user]);

    // ── Chart Data Transformation ─────────────────────────────────────────────

    // 1. Applications over the selected date range
    const applicationsOverTime = useMemo(() => {
        if (!filteredApps.length && !applications.length) return [];

        const days = Array.from({ length: dateRange }).map((_, i) => {
            const d = subDays(new Date(), dateRange - 1 - i);
            return { dateStr: format(d, 'MMM dd'), dateObj: d, count: 0 };
        });

        filteredApps.forEach(app => {
            if (!app.createdAt) return;
            const appDateStr = format(parseISO(app.createdAt), 'MMM dd');
            const dayEntry = days.find(d => d.dateStr === appDateStr);
            if (dayEntry) dayEntry.count += 1;
        });

        return days;
    }, [filteredApps, dateRange, applications.length]);

    // 2. Conversion Funnel (Views -> Apps -> Interviews -> Hires)
    const conversionFunnel = useMemo(() => {
        const totalViews = jobs.reduce((sum: number, j: any) => sum + (j.views || 0), 0);
        const totalApps = applications.length;
        // Count unique application_ids in interviews
        const totalInterviews = new Set(interviews.map((i: any) => i.application_id)).size;
        const totalHires = applications.filter(a => ['SELECTED', 'HIRED'].includes(a.status)).length;

        return [
            { value: Math.max(totalViews, totalApps + 5), name: 'Views', fill: '#94a3b8', stage: 'Views', count: Math.max(totalViews, totalApps + 5) },
            { value: totalApps, name: 'Applications', fill: '#38bdf8', stage: 'Applications', count: totalApps },
            { value: totalInterviews, name: 'Interviews', fill: '#8b5cf6', stage: 'Interviews', count: totalInterviews },
            { value: totalHires, name: 'Offers/Hires', fill: '#10b981', stage: 'Hired', count: totalHires },
        ];
    }, [jobs, applications, interviews]);

    // 3. Time to Hire (within date range)
    const timeToHire = useMemo(() => {
        const hiredApps = filteredApps.filter(a => ['HIRED', 'SELECTED'].includes(a.status));
        if (hiredApps.length === 0) return 0;

        const totalDays = hiredApps.reduce((sum, app) => {
            const created = parseISO(app.createdAt || new Date().toISOString());
            const updated = parseISO(app.updatedAt || new Date().toISOString());
            return sum + Math.max(1, (updated.getTime() - created.getTime()) / (1000 * 3600 * 24));
        }, 0);

        return Math.round(totalDays / hiredApps.length);
    }, [filteredApps]);

    // 4. Job Distribution (all-time)
    const jobDistribution = useMemo(() => {
        const dist: Record<string, number> = {};
        applications.forEach(app => {
            const title = app.job?.title || 'Unknown Role';
            dist[title] = (dist[title] || 0) + 1;
        });

        const COLORS = ['#4f46e5', '#38bdf8', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
        return Object.entries(dist)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }));
    }, [applications]);

    // 5. Today's Interviews
    const todayInterviews = useMemo(() => {
        const today = new Date();
        return interviews
            .filter((i: any) => i.status !== 'CANCELLED' && isSameDay(parseISO(i.scheduledAt), today))
            .sort((a: any, b: any) => parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime());
    }, [interviews]);

    // ── Export handlers ───────────────────────────────────────────────────────
    const handleExportCSV = useCallback(() => {
        exportDashboardCSV(
            {
                'Active Jobs': stats?.activeJobs ?? 0,
                'Total Applicants': stats?.totalApplicants ?? 0,
                'Shortlisted': stats?.shortlisted ?? 0,
                'Hired': stats?.hired ?? 0,
                'Avg Time-to-Hire (days)': timeToHire,
                'Date Range (days)': dateRange,
                'Report Generated': new Date().toLocaleString(),
            },
            applicationsOverTime,
            conversionFunnel
        );
        setIsExportOpen(false);
        addToast('CSV downloaded!', 'success');
    }, [stats, timeToHire, dateRange, applicationsOverTime, conversionFunnel, addToast]);

    const handleExportPDF = useCallback(() => {
        exportDashboardPDF('dashboard-content');
        setIsExportOpen(false);
    }, []);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
                    <p className="font-semibold text-slate-800 text-sm mb-1">{label}</p>
                    <p className="text-indigo-600 font-bold text-sm">
                        {payload[0].value} Applications
                    </p>
                </div>
            );
        }
        return null;
    };

    if (sLoading || jLoading || nLoading || appsLoading || iLoading) return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start gap-4 animate-pulse">
                <div className="flex flex-col gap-2">
                    <div className="h-9 w-64 rounded bg-slate-200" />
                    <div className="h-5 w-80 rounded bg-slate-100" />
                </div>
                <div className="h-10 w-32 rounded-lg bg-slate-200" />
            </div>
            <SkeletonCard count={4} />
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <SkeletonTable rows={4} cols={4} />
            </div>
        </div>
    );

    return (
        <div id="dashboard-content" className="flex flex-col gap-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">Company Dashboard</h1>
                    <p className="text-slate-500 text-base m-0">Welcome back, {user?.name}. Here's your recruitment overview.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Export Dropdown */}
                    <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setIsExportOpen(p => !p)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold shadow-sm transition-colors print:hidden"
                        >
                            <Download size={16} />
                            Export
                            <ChevronDown size={14} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isExportOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 animate-fade-in">
                                <button
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <FileSpreadsheet size={15} className="text-green-600" />
                                    Export CSV
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <FileText size={15} className="text-red-500" />
                                    Export PDF
                                </button>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => navigate('/recruiter/jobs')}
                    >
                        Post New Job
                    </Button>
                </div>
            </div>

            {/* Real-Time Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
                <div className="flex items-center gap-4">
                    {/* Date Range Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-600">Analytics Range:</span>
                        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                            {([7, 14, 30] as DateRange[]).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDateRange(d)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${dateRange === d
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Last Updated */}
                    <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                        Updated {format(lastUpdated, 'h:mm:ss a')}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Manual Refresh */}
                    <Button
                        variant="ghost"
                        icon={RefreshCw}
                        size="sm"
                        onClick={handleManualRefresh}
                    >
                        Refresh
                    </Button>

                    {/* Live Mode Toggle */}
                    <button
                        onClick={() => {
                            setIsLive(prev => !prev);
                            addToast(isLive ? 'Live updates paused' : 'Live updates enabled (30s)', isLive ? 'info' : 'success');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${isLive
                            ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <Radio size={14} className={isLive ? 'animate-pulse text-green-500' : 'text-slate-400'} />
                        {isLive ? 'Live' : 'Offline'}
                    </button>
                </div>
            </div>

            {/* Recruiter Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard icon={<Briefcase size={24} />} iconBg="bg-blue-100 text-blue-600" label="Active Job Postings" value={stats?.activeJobs ?? 0} />
                <StatCard icon={<Users size={24} />} iconBg="bg-purple-100 text-purple-600" label="Total Applications" value={stats?.totalApplicants ?? 0} delta={delta.applicants} dateRange={dateRange} />
                <StatCard icon={<TrendingUp size={24} />} iconBg="bg-orange-100 text-orange-600" label="Candidates Shortlisted" value={stats?.shortlisted ?? 0} delta={delta.shortlisted} dateRange={dateRange} />
                <StatCard icon={<CheckCircle size={24} />} iconBg="bg-green-100 text-green-600" label="Total Hires" value={stats?.hired ?? 0} delta={delta.hired} dateRange={dateRange} />
                <Card className="flex items-center p-6 gap-4 relative overflow-hidden h-full border-rose-100 bg-rose-50/20">
                    <div className="absolute -right-4 -bottom-4 opacity-10 text-rose-600 rotate-12">
                        <Clock size={120} />
                    </div>
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 bg-rose-100 text-rose-600 shadow-sm">
                        <Clock size={24} />
                    </div>
                    <div className="flex flex-col z-10">
                        <h3 className="text-3xl font-black text-slate-900 leading-tight m-0">
                            {timeToHire}
                            <span className="text-sm font-bold text-slate-500 ml-1 uppercase">days</span>
                        </h3>
                        <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest mt-0.5 mb-0">Time-to-Hire</p>
                        <p className="text-[10px] text-slate-400 mt-1">Avg. from Post to Selection</p>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 flex flex-col pt-6 px-6 pb-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Application Trends (Last {dateRange} Days)</h2>
                        {isLive && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Live
                            </span>
                        )}
                    </div>
                    <div className="flex-1 w-full min-h-[250px] -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={applicationsOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="dateStr"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                    interval={dateRange > 14 ? 4 : dateRange > 7 ? 2 : 0}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="flex flex-col p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 font-display">Recruitment Funnel</h2>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart>
                                <RechartsTooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl animate-in fade-in zoom-in duration-200">
                                                    <p className="font-bold text-slate-800 mb-1">{payload[0].name}</p>
                                                    <p className="text-indigo-600 font-black text-lg">{payload[0].value}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Funnel
                                    dataKey="value"
                                    data={conversionFunnel}
                                    isAnimationActive
                                >
                                    <LabelList 
                                        position="right" 
                                        fill="#64748b" 
                                        stroke="none" 
                                        dataKey="name" 
                                        fontSize={12}
                                        fontWeight={600}
                                    />
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Secondary Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="flex flex-col p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Job Distribution</h2>
                    <div className="flex-1 w-full min-h-[250px] relative">
                        {jobDistribution.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic">No application data yet.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={jobDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {jobDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white border border-slate-200 px-3 py-2 rounded shadow-sm text-sm">
                                                        <span className="font-bold text-slate-800">{payload[0].name}</span>: {payload[0].value} apps
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">Recent Job Postings</h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/recruiter/jobs')}>View All</Button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {jobs.length === 0 ? (
                                <div className="text-center p-8 text-slate-500 italic bg-slate-50 rounded border border-dashed border-slate-300">
                                    <p>No active job postings found.</p>
                                </div>
                            ) : (
                                jobs.slice(0, 4).map((job: any) => (
                                    <div key={job._id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-md transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50">
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-base font-bold text-slate-800 m-0">{job.title}</h4>
                                            <div className="flex items-center gap-3 text-[12px] text-slate-500">
                                                <span>Posted {format(parseISO(job.createdAt || new Date().toISOString()), 'MMM dd, yyyy')}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="flex items-center gap-1"><Radio size={10} className="text-indigo-400" /> {job.views || 0} views</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-700">
                                                    <Users size={14} />
                                                    <span>{job.applicationCount || 0}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Apps</span>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Main Grid area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <CalendarIcon size={20} className="text-indigo-500" /> Action Items: Interviews Today
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/recruiter/interviews')}>Open Calendar</Button>
                        </div>

                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {todayInterviews.length === 0 ? (
                                <div className="text-center p-8 text-slate-500 italic flex-1 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle size={28} className="text-green-500" />
                                    </div>
                                    <p>Your calendar is clear today!</p>
                                </div>
                            ) : (
                                todayInterviews.map((interview: any) => (
                                    <div key={interview._id} className="group border border-slate-200 hover:border-indigo-300 rounded-lg p-4 transition-colors flex justify-between sm:items-center flex-col sm:flex-row gap-4 bg-white relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                        <div className="flex flex-col gap-1 pl-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-indigo-600">{format(parseISO(interview.scheduledAt), 'h:mm a')}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <h4 className="text-base font-bold text-slate-800 m-0">{interview.studentName}</h4>
                                            </div>
                                            <span className="text-[13px] text-slate-500 font-medium">{interview.jobTitle} • {interview.type}</span>
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-1.5 pl-2 sm:pl-0 border-l sm:border-l-0 border-slate-100">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded inline-flex w-fit">
                                                <Clock size={12} className="shrink-0" />
                                                <span className="font-medium">{interview.durationMinutes} min duration</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                {interview.location.includes('http') ? (
                                                    <Video size={12} className="text-blue-500 shrink-0" />
                                                ) : (
                                                    <MapPin size={12} className="text-slate-400 shrink-0" />
                                                )}
                                                <span className="truncate max-w-[150px]">{interview.location.includes('http') ? 'Online Meeting Link' : interview.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 pb-4 border-b border-slate-200">Quick Actions</h2>
                        <div className="flex flex-col gap-3">
                            <Button isFullWidth variant="secondary" icon={Users} onClick={() => navigate('/recruiter/applicants')}>Review Applicants</Button>
                            <Button isFullWidth variant="ghost" icon={Briefcase} onClick={() => navigate('/recruiter/profile')}>Edit Company Profile</Button>
                        </div>
                    </Card>

                    <Card className="mt-6 bg-indigo-50/30 border-indigo-100">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-indigo-600" />
                            <h2 className="text-lg font-bold text-slate-800 m-0">Notification Reach</h2>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black text-slate-900">{notifyStats?.reads || 0}</span>
                                <span className="text-xs text-slate-500 font-medium mb-1">out of {notifyStats?.total || 0} students</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                                <div
                                    className="bg-indigo-600 h-full transition-all duration-1000"
                                    style={{ width: `${notifyStats?.rate || 0}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 italic">
                                Percentage of students who viewed your job notifications.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Leaderboard */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <Trophy size={20} className="text-amber-500" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white m-0">Recruiter Leaderboard</h2>
                    <span className="ml-auto text-xs text-slate-400 font-medium">Ranked by hires this quarter</span>
                </div>
                {leaderboard.length === 0 ? (
                    <p className="text-slate-400 italic text-sm text-center py-6">No data yet — hires will appear here once candidates are selected.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {leaderboard.map((entry, idx) => {
                            const maxHires = leaderboard[0].hires || 1;
                            const pct = Math.max(10, Math.round((entry.hires / maxHires) * 100));
                            const medals = ['🥇', '🥈', '🥉'];
                            const initial = entry.name.charAt(0).toUpperCase();
                            return (
                                <div key={entry.name} className="flex items-center gap-4">
                                    <span className="text-lg w-6 text-center shrink-0">{medals[idx] || `#${idx + 1}`}</span>
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-300 shrink-0">{initial}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{entry.name}</span>
                                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 shrink-0 ml-2">{entry.hires} hire{entry.hires !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default RecruiterDashboard;

// ── StatCard sub-component ────────────────────────────────────────────────────
const StatCard: React.FC<{
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: number;
    delta?: number;
    dateRange?: number;
}> = ({ icon, iconBg, label, value, delta, dateRange }) => {
    const hasDelta = delta !== undefined && dateRange !== undefined;
    const isPositive = (delta ?? 0) > 0;
    const isNegative = (delta ?? 0) < 0;
    const isHires = label.includes('Hire');

    return (
        <Card className="flex items-center p-6 gap-4 relative overflow-hidden h-full">
            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 ${iconBg}`}>
                {icon}
            </div>
            <div className="flex flex-col z-10 min-w-0">
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white leading-tight m-0">{value}</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1 mb-0 truncate">{label}</p>
                {hasDelta && (
                    <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold w-fit
                        ${isPositive
                            ? isHires ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-50 text-emerald-700'
                            : isNegative
                                ? 'bg-red-50 text-red-600'
                                : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                        {isPositive ? <ArrowUp size={10} /> : isNegative ? <ArrowDown size={10} /> : <Minus size={10} />}
                        {Math.abs(delta ?? 0)}% vs prev {dateRange}d
                    </div>
                )}
            </div>
        </Card>
    );
};
