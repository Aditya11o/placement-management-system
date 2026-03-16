import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info } from 'lucide-react';
import Card from '../Card/Card';

interface GeoStat {
    location: string;
    count: number;
    avgPackage: number;
}

interface PlacementMapProps {
    data: GeoStat[];
    isLoading?: boolean;
}

const PlacementMap: React.FC<PlacementMapProps> = ({ data, isLoading }) => {
    // Simplified India Map Path Data (Major Regions)
    // In a real app, this would be a full GeoJSON or a more detailed SVG
    const regions = [
        { id: 'north', name: 'North India', path: 'M150,50 L200,50 L220,100 L180,150 L130,120 Z', color: '#6366F1' },
        { id: 'west', name: 'West India', path: 'M130,120 L180,150 L150,220 L80,200 L100,100 Z', color: '#10B981' },
        { id: 'south', name: 'South India', path: 'M150,220 L220,220 L200,350 L150,380 L100,350 Z', color: '#F59E0B' },
        { id: 'east', name: 'East India', path: 'M220,100 L300,120 L320,200 L250,250 L180,150 Z', color: '#EC4899' },
        { id: 'central', name: 'Central India', path: 'M180,150 L250,250 L150,220 Z', color: '#8B5CF6' }
    ];

    // Mock mapping for demo: Map real locations to these generic regions
    const getRegionForLocation = (loc: string) => {
        const l = loc.toLowerCase();
        if (l.includes('bangalore') || l.includes('chennai') || l.includes('hyderabad')) return 'south';
        if (l.includes('mumbai') || l.includes('pune') || l.includes('gujarat')) return 'west';
        if (l.includes('delhi') || l.includes('gurgaon') || l.includes('noida')) return 'north';
        if (l.includes('kolkata') || l.includes('odisha')) return 'east';
        return 'central';
    };

    const regionalCounts = data?.reduce((acc, curr) => {
        const region = getRegionForLocation(curr.location);
        acc[region] = (acc[region] || 0) + curr.count;
        return acc;
    }, {} as Record<string, number>) || {};

    const maxCount = Math.max(...Object.values(regionalCounts), 1);

    if (isLoading) {
        return (
            <Card className="p-8 h-[500px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rendering Geographic Engine...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-8 h-[500px] glass-card overflow-hidden relative">
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Geographic Placement Footprint</h3>
                    <p className="text-sm text-slate-500 m-0">Regional distribution of job opportunities and offer density.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                    <MapPin size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Live Map</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[350px]">
                {/* SVG Map Section */}
                <div className="relative flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                    <svg viewBox="0 0 400 400" className="w-full h-full max-w-[300px]">
                        {regions.map((region) => {
                            const count = regionalCounts[region.id] || 0;
                            const opacity = 0.1 + (count / maxCount) * 0.8;
                            return (
                                <motion.path
                                    key={region.id}
                                    d={region.path}
                                    fill={region.color}
                                    fillOpacity={opacity}
                                    stroke={region.color}
                                    strokeWidth={1}
                                    whileHover={{ fillOpacity: 1, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="cursor-pointer"
                                    title={`${region.name}: ${count} jobs`}
                                />
                            );
                        })}
                    </svg>
                    
                    {/* Map Legend Floating */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">High Density</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-200" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Low Density</span>
                        </div>
                    </div>
                </div>

                {/* List Section */}
                <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Info size={14} /> Regional Breakdown
                    </h4>
                    {data?.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <p className="text-sm italic">No regional data available yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.slice(0, 5).map((loc, i) => (
                                <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:border-indigo-200 transition-colors group">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{loc.location}</span>
                                        <span className="text-xs font-black text-indigo-500">{loc.count} Jobs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(loc.count / (data[0]?.count || 1)) * 100}%` }}
                                                className="h-full bg-indigo-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 italic">Avg ₹{loc.avgPackage} LPA</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        </Card>
    );
};

export default PlacementMap;
