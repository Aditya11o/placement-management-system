import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import Card from '../Card/Card';

interface FunnelStage {
    stage: string;
    count: number;
    percent: number;
}

interface FunnelChartProps {
    data: {
        total: number;
        funnel: FunnelStage[];
    };
    isLoading?: boolean;
}

const COLORS = {
    'SUBMITTED': '#94A3B8', // Slate 400
    'REVIEWED': '#38BDF8',  // Sky 400
    'SHORTLISTED': '#8B5CF6', // Violet 500
    'SELECTED': '#10B981',  // Emerald 500
    'REJECTED': '#EF4444'   // Red 500
};

const FunnelChart: React.FC<FunnelChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <Card className="flex flex-col p-6 h-[400px]">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Pipeline Drop-off</h3>
                <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg" />
            </Card>
        );
    }

    const { funnel } = data || { funnel: [] };

    // Filter out REJECTED if we want a pure positive pipeline, but let's include it at the end
    // or just show the main 4 stages of progression
    const progressionStages = funnel.filter(f => f.stage !== 'REJECTED');

    return (
        <Card className="flex flex-col p-6 h-[400px]">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-800 m-0">Pipeline Drop-off</h3>
                <span className="text-sm px-2.5 py-1 bg-slate-100 text-slate-600 font-medium rounded-md">
                    {data?.total || 0} Total Apps
                </span>
            </div>

            {progressionStages.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                    No pipeline data available
                </div>
            ) : (
                <div className="w-full h-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={progressionStages}
                            layout="vertical"
                            margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                            barSize={32}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                type="number"
                                hide
                            />
                            <YAxis
                                dataKey="stage"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: '#F1F5F9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any, _name: any, props: any) => {
                                    return [`${value || 0} Candidates (${props.payload.percent}%)`, 'Count'];
                                }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[0, 4, 4, 0]}
                                animationDuration={1500}
                            >
                                {progressionStages.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.stage as keyof typeof COLORS] || '#94A3B8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
};

export default FunnelChart;
