import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    ComposedChart,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis
} from 'recharts';
import {
    TrendingUp,
    Users,
    DollarSign,
    Briefcase,
    Calendar,
    Download,
    ArrowLeft,
    BarChart3,
    Activity,
    Filter,
    RefreshCw,
    GraduationCap,
    TrendingDown,
    Target,
    Lightbulb,
    Radar as RadarIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import api from '../../services/api';

const AdminAnalytics = () => {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    // Fetch Branch Placement Stats
    const { data: branchData, isLoading: isBranchLoading, refetch: refetchBranch } = useQuery({
        queryKey: ['branchAnalytics', dateRange],
        queryFn: async () => {
            const res = await api.get(`/analytics/branch-placements?from=${dateRange.from}&to=${dateRange.to}`);
            return res.data.data;
        }
    });

    // Fetch Salary Stats
    const { data: salaryData, isLoading: isSalaryLoading, refetch: refetchSalary } = useQuery({
        queryKey: ['salaryAnalytics', dateRange],
        queryFn: async () => {
            const res = await api.get(`/analytics/salary-stats?from=${dateRange.from}&to=${dateRange.to}`);
            return res.data.data;
        }
    });

    // Fetch Trends
    const { data: trendsData, isLoading: isTrendsLoading, refetch: refetchTrends } = useQuery({
        queryKey: ['trendsAnalytics', dateRange],
        queryFn: async () => {
            const res = await api.get(`/analytics/trends?from=${dateRange.from}&to=${dateRange.to}`);
            return res.data.data;
        }
    });

    // Fetch Predictive Stats
    const { data: predictiveData, isLoading: isPredictiveLoading, refetch: refetchPredictive } = useQuery({
        queryKey: ['predictiveAnalytics', dateRange],
        queryFn: async () => {
            const res = await api.get(`/analytics/predictive?from=${dateRange.from}&to=${dateRange.to}`);
            return res.data.data;
        }
    });

    const refreshAll = () => {
        refetchBranch();
        refetchSalary();
        refetchTrends();
        refetchPredictive();
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg">
                    <p className="text-sm font-bold text-slate-800 dark:text-white mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs font-medium py-0.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
                            <span className="text-slate-800 dark:text-white">
                                {entry.name.includes('CTC') ? `₹${entry.value} LPA` : `${entry.value}${entry.name.includes('Rate') ? '%' : ''}`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in max-w-7xl mx-auto w-full pb-12">
            {/* Header */}
            <div className="flex justify-between items-start flex-wrap gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Link to="/admin/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white m-0 tracking-tight">Advanced Analytics Suite</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg m-0 ml-9">High-fidelity data visualizations for strategic university placement reports.</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-slate-100 dark:border-slate-800">
                        <Calendar size={16} className="text-slate-400" />
                        <input
                            type="date"
                            className="bg-transparent border-none text-sm text-slate-600 dark:text-slate-300 outline-none"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        />
                        <span className="text-slate-300">→</span>
                        <input
                            type="date"
                            className="bg-transparent border-none text-sm text-slate-600 dark:text-slate-300 outline-none"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        />
                    </div>
                    <button
                        onClick={refreshAll}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <Button variant="primary" icon={Download} size="sm">Export Report</Button>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 size={64} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. CTC</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white m-0">
                            ₹{salaryData?.reduce((acc: any, s: any) => acc + s.avgSalary, 0) / (salaryData?.length || 1) > 0
                                ? (salaryData.reduce((acc: any, s: any) => acc + s.avgSalary, 0) / salaryData.length).toFixed(2)
                                : '0.00'} LPA
                        </h2>
                        <div className="flex items-center gap-1.5 mt-2 text-green-500 font-bold text-xs">
                            <TrendingUp size={12} /> +12.5% from last year
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <GraduationCap size={64} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Placed Count</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white m-0">
                            {salaryData?.reduce((acc: any, s: any) => acc + s.placedCount, 0) || 0}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-2 text-slate-400 font-medium text-xs">
                            Students finalized till date
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target size={64} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                            <Activity size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Goal</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white m-0">
                            85%
                        </h2>
                        <div className="flex items-center gap-1.5 mt-2 text-amber-500 font-bold text-xs">
                            <TrendingDown size={12} /> 5% below quarterly target
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Briefcase size={64} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Highest Offer</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white m-0">
                            ₹{salaryData?.length > 0 ? Math.max(...salaryData.map((s: any) => s.maxSalary)) : '0'} LPA
                        </h2>
                        <div className="flex items-center gap-1.5 mt-2 text-indigo-500 font-bold text-xs">
                            CSE Department
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Branch-wise Salary Distribution */}
                <Card className="p-8 border-slate-200/60">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Salary Distribution by Branch</h3>
                            <p className="text-sm text-slate-500 m-0">Min, Max, and Average package comparison per department.</p>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <DollarSign size={18} className="text-indigo-600" />
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        {isSalaryLoading ? (
                            <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Distribution Engine...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={salaryData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} unit="L" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 24, fontSize: 12, fontWeight: 'bold' }} />
                                    <Bar dataKey="minSalary" name="Min CTC" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="avgSalary" name="Avg CTC" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={34} />
                                    <Bar dataKey="maxSalary" name="Max CTC" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Branch placement rate Percentage */}
                <Card className="p-8 border-slate-200/60">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Placement Performance</h3>
                            <p className="text-sm text-slate-500 m-0">Percentage of eligible students placed across engineering branches.</p>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Target size={18} className="text-emerald-600" />
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        {isBranchLoading ? (
                            <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Measuring Benchmarks...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={branchData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                    <XAxis type="number" hide domain={[0, 100]} />
                                    <YAxis
                                        dataKey="branch"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={100}
                                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                                    <Bar
                                        dataKey="placementRate"
                                        name="Placement Rate"
                                        fill="#059669"
                                        radius={[0, 4, 4, 0]}
                                        barSize={24}
                                        label={{ position: 'right', fill: '#059669', fontSize: 12, fontWeight: 'bold', formatter: (v: any) => `${v}%` }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Hiring Trends Over Time */}
                <Card className="p-8 border-slate-200/60 lg:col-span-2">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Long-term Hiring Momentum</h3>
                            <p className="text-sm text-slate-500 m-0">Comparative analysis of new registrations vs actual placements over the fiscal year.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                                <Filter size={14} />
                                Multi-dimensional View
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        {isTrendsLoading ? (
                            <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Synthesizing Historical Data...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendsData?.placements}>
                                    <defs>
                                        <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" align="right" verticalAlign="top" wrapperStyle={{ paddingBottom: 20, fontSize: 12, fontWeight: 'bold' }} />

                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        name="Placements"
                                        stroke="#6366F1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPlacements)"
                                    />

                                    <Area
                                        data={trendsData?.studentRegistrations}
                                        type="monotone"
                                        dataKey="count"
                                        name="Registrations"
                                        stroke="#10B981"
                                        strokeWidth={1}
                                        strokeDasharray="5 5"
                                        fillOpacity={0.5}
                                        fill="url(#colorRegs)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>

            {/* Predictive Success Analysis */}
            <div className="flex flex-col gap-6 pt-10 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white m-0 tracking-tight flex items-center gap-2">
                        <Lightbulb className="text-amber-500" /> Predictive Success Analysis
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm m-0 ml-8">AI-driven insights on rising skills and branch demand to guide training programs.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Rising Skills */}
                    <Card className="p-8 border-slate-200/60 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Rising Skills Demand</h3>
                                <p className="text-sm text-slate-500 m-0">Top 10 most frequently requested skills in active job postings.</p>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            {isPredictiveLoading ? (
                                <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Predictive Engine...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={predictiveData?.risingSkills} layout="vertical" margin={{ left: -10 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                        <YAxis dataKey="skill" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} width={100} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                                        <Bar dataKey="count" name="Job Postings" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>

                    {/* Branch Demand Radar */}
                    <Card className="p-8 border-slate-200/60 shadow-sm overflow-hidden relative">
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Market Branch Demand</h3>
                                <p className="text-sm text-slate-500 m-0">Volume of open jobs mapped against eligible branches.</p>
                            </div>
                            <div className="flex flex-col items-end text-right">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Job/Student Ratio</span>
                                <span className="text-2xl font-black text-brand-600 leading-tight">{predictiveData?.metrics?.demandSupplyRatio || '0.00'}</span>
                            </div>
                        </div>

                        <div className="h-[350px] w-full relative z-10">
                            {isPredictiveLoading ? (
                                <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Radar...</div>
                            ) : predictiveData?.branchDemand?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={predictiveData?.branchDemand} outerRadius="70%">
                                        <PolarGrid stroke="#E2E8F0" />
                                        <PolarAngleAxis dataKey="branch" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 'bold' }} />
                                        <Tooltip />
                                        <Radar name="Jobs Available" dataKey="jobCount" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col gap-3 items-center justify-center text-slate-500">
                                    <RadarIcon size={48} className="text-slate-300 opacity-50" />
                                    <p className="font-medium text-sm">Not enough active job data to plot radar.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Insight Message */}
            <div className="flex items-center gap-2 justify-center py-4 bg-slate-900 text-white rounded-2xl px-6 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-bold m-0 text-slate-300">
                    Live Data Pipeline Active: <span className="text-white">Next projected batch clearance: 24th March</span>
                </p>
                <div className="w-px h-4 bg-slate-700 mx-2" />
                <button className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                    View Methodology &rarr;
                </button>
            </div>
        </div>
    );
};

export default AdminAnalytics;
