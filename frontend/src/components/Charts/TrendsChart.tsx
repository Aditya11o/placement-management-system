import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import Card from '../Card/Card';

interface DataPoint {
    label: string;
    year: number;
    month: number;
    count: number;
}

interface TrendsChartProps {
    data: {
        applications: DataPoint[];
        placements: DataPoint[];
        jobsPosted: DataPoint[];
        studentRegistrations: DataPoint[];
    };
    isLoading?: boolean;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <Card className="flex flex-col p-6 h-[400px]">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Activity Trends (Last 12 Months)</h3>
                <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg" />
            </Card>
        );
    }

    // Transform backend data array-of-objects shape into a combined array for Recharts
    // Recharts expects: [{ label: 'Jan', applications: 10, jobsPosted: 5 }, ...]
    const combinedDataMap = new Map<string, any>();

    // Helper to merge series into Map
    const mergeSeries = (series: DataPoint[], key: string) => {
        if (!series) return;
        series.forEach(item => {
            const existing = combinedDataMap.get(item.label) || { label: item.label };
            existing[key] = item.count;
            combinedDataMap.set(item.label, existing);
        });
    };

    mergeSeries(data.applications, 'Applications');
    mergeSeries(data.placements, 'Placements');
    mergeSeries(data.jobsPosted, 'Jobs Posted');
    mergeSeries(data.studentRegistrations, 'Registrations');

    // Convert map to array and sort chronologically (assuming backend already sorted them)
    // Actually we will just use the labels in the order they were inserted, which should match backend
    const chartData = Array.from(combinedDataMap.values());

    return (
        <Card className="flex flex-col p-6 h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Activity Trends (Last 12 Months)</h3>

            {chartData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                    No timeline data available
                </div>
            ) : (
                <div className="w-full h-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '8px' }}
                                itemStyle={{ padding: '2px 0' }}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px' }}
                            />

                            <Line
                                type="monotone"
                                dataKey="Applications"
                                stroke="#4F46E5"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Jobs Posted"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                dot={{ r: 3, strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Placements"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ r: 3, strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Registrations"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                border-dasharray="5 5"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
};

export default TrendsChart;
