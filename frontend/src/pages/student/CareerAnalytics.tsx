import React, { useState, useEffect } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, Legend, Cell
} from 'recharts';
import { TrendingUp, Award, Target, Brain, Zap, ArrowRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Badge from '../../components/Badge/Badge';

interface AnalyticsData {
    trajectory: { date: string, score: number }[];
    readiness: { technical: number, communication: number, culture: number };
    benchmarks: { technical: number, communication: number, culture: number };
    totalAssessments: number;
}

const CareerAnalytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/students/career-analytics');
                setData(res.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="p-8 space-y-8 animate-pulse">
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            </div>
        </div>
    );

    if (error || !data || (data.trajectory.length === 0)) return (
        <div className="p-8 max-w-4xl mx-auto text-center py-20">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600">
                <TrendingUp size={48} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Insufficient Data for Analytics</h1>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                We need more interview feedback to generate your career trajectory. 
                Keep applying and appearing for mock interviews!
            </p>
            <div className="flex justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2">Need at least 1 Interview Feedback</Badge>
            </div>
        </div>
    );

    const radarData = [
        { subject: 'Technical', A: data.readiness.technical, B: data.benchmarks.technical, fullMark: 5 },
        { subject: 'Communication', A: data.readiness.communication, B: data.benchmarks.communication, fullMark: 5 },
        { subject: 'Culture', A: data.readiness.culture, B: data.benchmarks.culture, fullMark: 5 },
    ];

    const gapData = [
        { name: 'Technical', Student: data.readiness.technical, Market: data.benchmarks.technical },
        { name: 'Communication', Student: data.readiness.communication, Market: data.benchmarks.communication },
        { name: 'Culture', Student: data.readiness.culture, Market: data.benchmarks.culture },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">Career Insights v1.2</Badge>
                            <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                <Info size={12} /> Real-time aggregate
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Placement Path Analytics</h1>
                        <p className="text-slate-500 italic mt-1 font-medium">Visualizing your trajectory towards global market requirements.</p>
                    </div>
                    <div className="flex gap-4">
                        <Card className="px-6 py-4 bg-white dark:bg-slate-800 border-none shadow-xl border-t-4 border-indigo-500">
                            <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Overall Readiness</div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {((Object.values(data.readiness).reduce((a, b) => a + b, 0) / 3) * 20).toFixed(0)}%
                            </div>
                        </Card>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Performance Trajectory */}
                <Card className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={120} />
                    </div>
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Performance Trajectory</h3>
                            <p className="text-sm text-slate-400 font-medium italic">Interview score progression over time</p>
                        </div>
                        <Award className="text-indigo-600" />
                    </div>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.trajectory.map(t => ({ ...t, date: new Date(t.date).toLocaleDateString() }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F033" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94A3B8" 
                                    fontSize={10} 
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    domain={[0, 5]} 
                                    stroke="#94A3B8" 
                                    fontSize={10} 
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '1rem', 
                                        border: 'none', 
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        background: '#1E293B',
                                        color: '#F8FAFC'
                                    }} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#6366F1" 
                                    strokeWidth={4} 
                                    dot={{ fill: '#6366F1', strokeWidth: 2, r: 6 }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Readiness Breakdown */}
                <Card className="p-8 rounded-[2.5rem] bg-indigo-600 border-none shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-white mb-2">Readiness Radar</h3>
                        <p className="text-indigo-100 text-sm font-medium mb-6 opacity-80 italic">Pillar-wise domain analysis</p>
                        <div className="h-[250px] w-full scale-110 translate-y-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#FFFFFF22" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#FFFFFFDE', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis domain={[0, 5]} axisLine={false} tick={false} />
                                    <Radar
                                        name="Student"
                                        dataKey="A"
                                        stroke="#FFFFFF"
                                        fill="#FFFFFF"
                                        fillOpacity={0.3}
                                    />
                                    <Radar
                                        name="Market"
                                        dataKey="B"
                                        stroke="#A5B4FC"
                                        fill="#A5B4FC"
                                        fillOpacity={0.1}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                            <div className="text-center">
                                <div className="text-[10px] text-indigo-200 font-black uppercase tracking-widest">Tech Avg</div>
                                <div className="text-2xl font-black text-white">{data.readiness.technical}/5</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] text-indigo-200 font-black uppercase tracking-widest">Assessments</div>
                                <div className="text-2xl font-black text-white">{data.totalAssessments}</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gap Analysis */}
                <Card className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Market Performance Gaps</h3>
                            <p className="text-sm text-slate-400 font-medium italic">Comparison against industry averages</p>
                        </div>
                        <Target className="text-emerald-500" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gapData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} fontWeight="bold" />
                                <YAxis axisLine={false} tickLine={false} hide />
                                <Tooltip 
                                    cursor={{ fill: '#F1F5F933' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="Student" fill="#6366F1" radius={[10, 10, 0, 0]} barSize={32} />
                                <Bar dataKey="Market" fill="#E2E8F0" radius={[10, 10, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* AI Recommendations */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white px-2">Next Steps for Growth</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <motion.div whileHover={{ x: 5 }} className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white">Focus on {radarData.sort((a, b) => a.A - b.A)[0].subject}</h4>
                                <p className="text-sm text-slate-500 mt-1">Your {radarData.sort((a, b) => a.A - b.A)[0].subject.toLowerCase()} score is currently lagging by {((radarData.sort((a, b) => a.A - b.A)[0].B - radarData.sort((a, b) => a.A - b.A)[0].A)).toFixed(1)} points below market average.</p>
                            </div>
                        </motion.div>

                        <motion.div whileHover={{ x: 5 }} className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white">Schedule Mock Interview</h4>
                                <p className="text-sm text-slate-500 mt-1">Consistent practice once every 10 days leads to a 28% higher placement probability.</p>
                            </div>
                        </motion.div>

                        <button className="w-full p-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black flex items-center justify-between hover:scale-[0.98] transition-transform">
                            <span>Visit Interview Simulator</span>
                            <ArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerAnalytics;
