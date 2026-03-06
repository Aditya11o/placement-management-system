import React from 'react';
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
    LineChart,
    Line,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Users,
    Target,
    Briefcase,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Download,
    Filter,
    Activity,
    Layers
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import { useToast } from '../../context/ToastContext';

interface CohortData {
    year: number;
    totalStudents: number;
    placedCount: number;
    placementRate: number;
    avgSalary: number;
}

interface EngagementData {
    company: string;
    totalApps: number;
    responseRate: number;
    offerRatio: number;
}

const AdminAnalyticsDeepDive: React.FC = () => {
    const { addToast } = useToast();

    // Fetch Cohort Analytics
    const { data: cohorts = [], isLoading: cohortsLoading } = useQuery<CohortData[]>({
        queryKey: ['cohortAnalytics'],
        queryFn: async () => {
            const res = await api.get('/analytics/cohorts');
            return res.data?.data || [];
        }
    });

    // Fetch Engagement Stats
    const { data: engagement = [], isLoading: engagementLoading } = useQuery<EngagementData[]>({
        queryKey: ['engagementAnalytics'],
        queryFn: async () => {
            const res = await api.get('/analytics/engagement');
            return res.data?.data || [];
        }
    });

    return (
        <div className="flex flex-col gap-8 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-3">
                        <TrendingUp size={28} className="text-indigo-600" /> Analytics Deep Dive
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0">Cross-batch performance analysis and recruiter engagement benchmarks.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-all cursor-pointer">
                        <Download size={16} /> Export Deep Dive
                    </button>
                </div>
            </div>

            {/* Top Grid: Cohort Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Users size={20} className="text-blue-500" /> Batch Placement Performance
                            </h2>
                            <p className="text-xs text-slate-400 mt-1 font-medium">Placement % comparison across graduation cohorts.</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        {cohortsLoading ? (
                            <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse flex items-center justify-center text-slate-400 font-bold">
                                Crunching Batch Data...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cohorts}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="year"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                        dx={-10}
                                        unit="%"
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="placementRate" name="Placed %" radius={[6, 6, 0, 0]} barSize={40}>
                                        {cohorts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366F1' : '#818CF8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Activity size={20} className="text-emerald-500" /> Average Salary Evolution
                            </h2>
                            <p className="text-xs text-slate-400 mt-1 font-medium">Tracking CTC package trends (LPA) per batch.</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        {cohortsLoading ? (
                            <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse flex items-center justify-center text-slate-400 font-bold">
                                Analyzing Salary Trends...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={cohorts}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="year"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                        dx={-10}
                                        unit="L"
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avgSalary"
                                        name="Avg Package"
                                        stroke="#10B981"
                                        strokeWidth={4}
                                        dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>

            {/* Recruiter Engagement Analysis */}
            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Target size={22} className="text-amber-500" /> Recruiter Engagement Benchmarks
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Measuring responsiveness and quality of hiring cycles per company.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Apps</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Response Rate</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Offer-to-Shortlist</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {engagementLoading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/50 dark:bg-slate-800/20"></td>
                                    </tr>
                                ))
                            ) : engagement.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-bold text-indigo-600">
                                                {item.company.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{item.company}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400">
                                            <Layers size={14} /> {item.totalApps}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 max-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.responseRate > 70 ? 'bg-emerald-500' : item.responseRate > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                    style={{ width: `${item.responseRate}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.responseRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold px-2 py-1 rounded-lg ${item.offerRatio > 30 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                                {item.offerRatio}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {item.responseRate > 80 ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                                                <ArrowUpRight size={12} /> Proactive
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                Standard
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminAnalyticsDeepDive;
