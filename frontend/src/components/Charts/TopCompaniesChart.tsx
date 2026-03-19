import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Briefcase, TrendingUp } from 'lucide-react';
import Card from '../Card/Card';

interface CompanyData {
    company: string;
    count: number;
    avgPackage: number;
}

interface TopCompaniesProps {
    data: CompanyData[];
    isLoading?: boolean;
}

const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

const TopCompaniesChart: React.FC<TopCompaniesProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <Card className="p-8 h-[450px] animate-pulse">
               <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-lg mb-8" />
               <div className="space-y-4">
                   {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className="h-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl" />
                   ))}
               </div>
            </Card>
        );
    }

    return (
        <Card className="p-8 h-[450px] relative overflow-hidden group border-slate-200/60 glass-card">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Briefcase size={120} />
            </div>

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Top Recruiting Partners</h3>
                    <p className="text-sm text-slate-500 m-0 font-medium">Ranked by hiring volume and average compensation package.</p>
                </div>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <TrendingUp size={20} />
                </div>
            </div>

            <div className="h-[300px] w-full relative z-10">
                {data.length === 0 ? (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
                        <Briefcase size={40} className="mb-2 opacity-20" />
                        <p className="text-sm">No recruiting data available for this period.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data.slice(0, 10)}
                            layout="vertical"
                            margin={{ left: 20, right: 30 }}
                            barSize={32}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="company"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                width={120}
                                tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }}
                            />
                            <Tooltip
                                cursor={{ fill: '#F1F5F9', opacity: 0.5 }}
                                contentStyle={{ 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '12px'
                                }}
                                formatter={(value: any, name: string) => {
                                    if (name === 'count') return [`${value} Hirings`, 'Hiring Volume'];
                                    return [`₹${value} LPA`, 'Avg Package'];
                                }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[0, 8, 8, 0]}
                                animationDuration={2000}
                                label={{ 
                                    position: 'right', 
                                    fill: '#6366F1', 
                                    fontSize: 12, 
                                    fontWeight: 'bold',
                                    formatter: (val: any) => `${val} Hired`
                                }}
                            >
                                {data.map((_, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[index % COLORS.length]}
                                        fillOpacity={1 - (index * 0.1)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest relative z-10">
                <span>Highest Package Partner: <span className="text-indigo-600 dark:text-indigo-400">{data[0]?.company || 'N/A'}</span></span>
                <span>Active Core Recruiters: {data.length}</span>
            </div>
        </Card>
    );
};

export default TopCompaniesChart;
