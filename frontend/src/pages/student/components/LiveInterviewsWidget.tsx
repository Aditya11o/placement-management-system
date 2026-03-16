import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { Video, Clock, ChevronRight, User } from 'lucide-react';
import { format, isToday } from 'date-fns';

interface Interview {
    _id: string;
    job_id: {
        title: string;
        company_name: string;
    };
    recruiter_id: {
        name: string;
    };
    scheduled_at: string;
    duration_minutes: number;
    location_type: string;
}

const LiveInterviewsWidget: React.FC = () => {
    const navigate = useNavigate();
    const { data: interviews, isLoading } = useQuery({
        queryKey: ['upcomingInterviews'],
        queryFn: async () => {
            const res = await api.get('/interviews?upcoming=true');
            return res.data.data as Interview[];
        },
        refetchInterval: 60000,
    });

    const todayInterviews = interviews?.filter(iv => 
        isToday(new Date(iv.scheduled_at)) && iv.location_type === 'VIRTUAL'
    ) || [];

    if (isLoading) {
        return (
            <Card className="h-full flex flex-col p-6 animate-pulse bg-white dark:bg-slate-800">
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                <div className="space-y-4">
                    <div className="h-24 bg-slate-100 dark:bg-slate-700/50 rounded-2xl" />
                </div>
            </Card>
        );
    }

    if (todayInterviews.length === 0) return null;

    return (
        <Card border className="bg-gradient-to-br from-indigo-600 to-indigo-900 text-white shadow-2xl shadow-indigo-500/30 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Video size={120} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Video size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-100">Live Interviews</h3>
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-0.5">Happening Today</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {todayInterviews.map((iv) => (
                        <div 
                            key={iv._id}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-bold truncate pr-4">{iv.job_id?.title || 'Untitled Role'}</h4>
                                    <p className="text-xs font-medium text-indigo-200">{iv.job_id?.company_name || 'Confidential Company'}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-sm font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                                        {format(new Date(iv.scheduled_at), 'h:mm a')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-5 text-[11px] font-bold text-indigo-100/70">
                                <div className="flex items-center gap-1.5">
                                    <User size={12} />
                                    <span>With {iv.recruiter_id?.name || 'Recruiter'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    <span>{iv.duration_minutes} min</span>
                                </div>
                            </div>

                            <Button 
                                variant="primary" 
                                isFullWidth 
                                className="bg-white text-indigo-900 hover:bg-indigo-50 border-none shadow-xl shadow-black/20 font-black text-xs uppercase tracking-[0.2em]"
                                onClick={() => navigate(`/interviews/${iv._id}/room`)}
                            >
                                Enter Room <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default LiveInterviewsWidget;
