import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import Card from '../Card/Card';

interface SeasonData {
    season: string;
    totalStudents: number;
    placedStudents: number;
    placementRate: number;
}

interface SeasonComparisonChartProps {
    data: SeasonData[];
    isLoading?: boolean;
}

const SeasonComparisonChart: React.FC<SeasonComparisonChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <Card className="p-6 h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Loading season data...</p>
                </div>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className="p-6 h-[400px] flex items-center justify-center text-slate-500">
                No historical season data available.
            </Card>
        );
    }

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

    return (
        <Card className="p-6 h-[400px] flex flex-col" hoverable>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white m-0">Season Comparison</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">Placement rate (%) by graduation year</p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis 
                            dataKey="season" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            domain={[0, 100]}
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                backgroundColor: '#fff',
                                padding: '12px'
                            }}
                            itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                            labelStyle={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}
                        />
                        <Bar 
                            dataKey="placementRate" 
                            name="Placement Rate (%)" 
                            radius={[6, 6, 0, 0]}
                            barSize={40}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default SeasonComparisonChart;
