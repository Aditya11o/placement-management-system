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
    LabelList
} from 'recharts';
import { Filter, Beaker } from 'lucide-react';
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
    'REVIEWED': '#8B5CF6',  // Violet 500
    'SHORTLISTED': '#6366F1', // Indigo 500
    'SELECTED': '#10B981',  // Emerald 500
    'REJECTED': '#F43F5E'   // Rose 500
};

const FunnelChart: React.FC<FunnelChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <Card className="flex flex-col p-8 h-[450px] animate-pulse">
                <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-lg mb-8" />
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />
            </Card>
        );
    }

    const { funnel } = data || { funnel: [] };
    const progressionStages = funnel.filter(f => f.stage !== 'REJECTED');

    // Calculate drop-off rates for each stage
    const enrichedData = progressionStages.map((stage, index) => {
        let dropOff = 0;
        if (index > 0) {
            const prevCount = progressionStages[index - 1].count;
            dropOff = prevCount > 0 ? (1 - stage.count / prevCount) * 100 : 0;
        }
        return {
            ...stage,
            dropOff: dropOff.toFixed(1)
        };
    });

    return (
        <Card className="flex flex-col p-8 h-[450px] relative overflow-hidden group border-slate-200/60 glass-card">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Filter size={120} />
            </div>

            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Placement Pipeline Funnel</h3>
                    <p className="text-sm text-slate-500 m-0 font-medium">Conversion efficiency and drop-off analysis across stages.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Throughput Rate</span>
                    <span className="text-2xl font-black text-emerald-500">{progressionStages.length > 0 ? progressionStages[progressionStages.length - 1].percent : 0}%</span>
                </div>
            </div>

            {progressionStages.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <Beaker size={48} className="mb-3" />
                    <p className="text-sm font-bold uppercase tracking-widest">No pipeline data detected</p>
                </div>
            ) : (
                <div className="w-full h-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={enrichedData}
                            layout="vertical"
                            margin={{ left: 20, right: 60 }}
                            barSize={40}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" opacity={0.5} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="stage"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: '#F1F5F9', opacity: 0.3 }}
                                contentStyle={{ 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '12px'
                                }}
                                formatter={(value: any, _: string, props: any) => {
                                    const { percent, dropOff } = props.payload;
                                    return [
                                        <div className="flex flex-col gap-1" key="tooltip">
                                            <span className="font-bold text-slate-900">{value} Candidates</span>
                                            <span className="text-xs text-indigo-600">{percent}% of Total Apps</span>
                                            {parseFloat(dropOff) > 0 && (
                                                <span className="text-xs text-rose-500">🔻 {dropOff}% Drop-off from prev stage</span>
                                            )}
                                        </div>,
                                        null
                                    ];
                                }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[0, 8, 8, 0]}
                                animationDuration={2000}
                            >
                                {enrichedData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[entry.stage as keyof typeof COLORS] || '#94A3B8'}
                                        fillOpacity={1 - (index * 0.1)}
                                    />
                                ))}
                                <LabelList 
                                    dataKey="percent" 
                                    position="right" 
                                    formatter={(v: any) => `${v}%`} 
                                    style={{ fill: '#64748B', fontSize: 11, fontWeight: 'bold' }} 
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            
            <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-4">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"/> Apps</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"/> Reviewed</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600"/> Shortlist</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Placed</span>
            </div>
        </Card>
    );
};

export default FunnelChart;

