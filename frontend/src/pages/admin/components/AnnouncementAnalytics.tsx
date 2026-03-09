import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, Eye, Percent, Loader2, X } from 'lucide-react';
import api from '../../../services/api';
import Card from '../../../components/Card/Card';

interface AnalyticsProps {
    announcementId: string;
    onClose: () => void;
}

interface StatsData {
    announcement_id: string;
    title: string;
    stats: {
        reads: number;
        delivered: number;
        readRate: number;
    };
}

const AnnouncementAnalytics = ({ announcementId, onClose }: AnalyticsProps) => {
    const { data, isLoading, error } = useQuery<{ success: boolean; data: StatsData }>({
        queryKey: ['announcementStats', announcementId],
        queryFn: async () => {
            const res = await api.get(`/announcements/${announcementId}/stats`);
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 size={32} className="text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading analytics...</p>
            </div>
        );
    }

    if (error || !data?.success) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Failed to load analytics. Please try again later.</p>
                <button onClick={onClose} className="mt-4 text-sm font-bold underline">Close</button>
            </div>
        );
    }

    const stats = data.data.stats;

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative">
            <button
                onClick={onClose}
                className="absolute -top-2 -right-2 p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm border border-slate-100 transition-all z-10"
            >
                <X size={18} />
            </button>

            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 m-0">Broadcast Analytics</h2>
                <p className="text-sm text-slate-500 mt-1">{data.data.title}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-indigo-50/50 border-indigo-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivered</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{stats.delivered}</div>
                    <p className="text-[10px] text-slate-400 mt-1">Total targeted users</p>
                </Card>

                <Card className="p-4 bg-emerald-50/50 border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <Eye size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Read Count</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{stats.reads}</div>
                    <p className="text-[10px] text-slate-400 mt-1">Users who viewed content</p>
                </Card>

                <Card className="p-4 bg-amber-50/50 border-amber-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Percent size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Read Rate</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{stats.readRate.toFixed(1)}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                            className="bg-amber-500 h-full transition-all duration-1000"
                            style={{ width: `${stats.readRate}%` }}
                        />
                    </div>
                </Card>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-700 m-0 uppercase tracking-tight">Engagement Summary</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-600 font-medium">Engagement Health</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stats.readRate > 70 ? 'bg-green-100 text-green-700' :
                                stats.readRate > 40 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {stats.readRate > 70 ? 'High' : stats.readRate > 40 ? 'Medium' : 'Low'}
                        </span>
                    </div>

                    <p className="text-xs text-slate-500 italic leading-relaxed text-center px-4">
                        "Analytics are calculated based on active users in targeted segments who have opened the notification panel or announcement center."
                    </p>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md"
                >
                    Close Dashboard
                </button>
            </div>
        </div>
    );
};

export default AnnouncementAnalytics;
