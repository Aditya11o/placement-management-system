import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';
import { 
    Briefcase, 
    Clock, 
    Star, 
    TrendingUp, 
    User,
    Award,
    Shield
} from 'lucide-react';
import api from '../../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Announcement } from '../../types';
import PageHeader from '../../components/PageHeader/PageHeader';
import ReadinessMeter from '../../components/Dashboard/ReadinessMeter';
import NextBestAction from '../../components/Dashboard/NextBestAction';
import { gamificationService } from '../../services/gamificationService';
import OnlinePeersWidget from './components/OnlinePeersWidget';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import LiveInterviewsWidget from './components/LiveInterviewsWidget';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';

interface StudentStats {
    applicationsSent: number;
    interviewsScheduled: number;
    offersReceived: number;
    pendingApplications: number;
}

const fetchAnnouncements = async (): Promise<Announcement[]> => {
    const res = await api.get('/announcements');
    const data = res.data?.data || [];
    return Array.isArray(data) ? data.slice(0, 3) : [];
};

const fetchStudentStats = async (): Promise<StudentStats> => {
    const res = await api.get('/applications/student');
    const apps: any[] = res.data?.data || [];
    return {
        applicationsSent: apps.length,
        interviewsScheduled: apps.filter((a) => a.status === 'SHORTLISTED').length,
        offersReceived: apps.filter((a) => a.status === 'HIRED' || a.status === 'SELECTED').length,
        pendingApplications: apps.filter((a) => a.status === 'PENDING' || a.status === 'SUBMITTED').length,
    };
};

const StudentDashboard = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch Featured Jobs
    const { data: featuredJobs = [] } = useQuery({
        queryKey: ['featuredJobs'],
        queryFn: async () => {
            const res = await api.get('/jobs/eligible?is_featured=true&limit=3');
            return res.data?.data || [];
        },
        enabled: !!user,
    });

    const { data: announcements = [], isPending: aLoading, isError: aError } = useQuery({
        queryKey: ['announcements', 'latest'],
        queryFn: fetchAnnouncements,
        enabled: !!user,
    });

    const { data: stats, isPending: sLoading, isError: sError } = useQuery({
        queryKey: ['studentStats'],
        queryFn: fetchStudentStats,
        enabled: !!user,
    });

    const { data: readinessData } = useQuery({
        queryKey: ['readinessScore'],
        queryFn: async () => {
            const res = await api.get('/students/readiness-score');
            return res.data.data;
        },
        enabled: !!user,
    });

    const { data: gamificationStats } = useQuery({
        queryKey: ['gamificationStats'],
        queryFn: async () => {
            await gamificationService.updateStreak();
            await gamificationService.checkBadges();
            return gamificationService.getStats();
        },
        enabled: !!user,
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/announcements/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
    });

    React.useEffect(() => {
        if (aError || sError) addToast('Failed to load dashboard data', 'error');
    }, [aError, sError, addToast]);

    if (aLoading || sLoading) return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 animate-pulse">
                <div className="h-9 w-72 rounded bg-slate-200" />
                <div className="h-5 w-96 rounded bg-slate-100" />
            </div>
            <SkeletonCard count={4} />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-6">
                    <div className="h-[200px] w-full rounded-2xl bg-slate-100 animate-pulse" />
                    <div className="h-[400px] w-full rounded-2xl bg-slate-100 animate-pulse" />
                </div>
                <div className="md:col-span-4 space-y-6">
                    <div className="h-[300px] w-full rounded-2xl bg-slate-100 animate-pulse" />
                    <div className="h-[300px] w-full rounded-2xl bg-slate-100 animate-pulse" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <PageHeader 
                    title={`Welcome back, ${user?.name ? user.name.split(' ')[0] : 'Student'}! 👋`}
                    subtitle="Your career trajectory is looking sharp today."
                />
                <div className="flex items-center gap-3 self-start md:self-auto">
                    <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm" onClick={() => navigate('/student/profile')}>Settings</Button>
                    <Button variant="primary" size="sm" className="font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20" onClick={() => navigate('/student/jobs')}>Apply Jobs</Button>
                </div>
            </div>

            {/* Premium Metric Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Applications', value: stats?.applicationsSent || 0, icon: Briefcase, color: 'indigo' },
                    { label: 'Shortlisted', value: stats?.interviewsScheduled || 0, icon: Star, color: 'amber' },
                    { label: 'Offers', value: stats?.offersReceived || 0, icon: Award, color: 'emerald' },
                    { label: 'Streak', value: gamificationStats?.streak.current || 0, icon: TrendingUp, color: 'rose' }
                ].map((item, idx) => (
                    <Card key={idx} border className="p-5 flex flex-col justify-between group hover:border-indigo-500/30">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                <item.icon size={20} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total</span>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                <AnimatedCounter value={item.value} />
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">{item.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left Column - High Priority Content */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    <LiveInterviewsWidget />
                    
                    <div className="h-full">
                        <PredictiveAnalytics />
                    </div>

                    <Card className="h-full">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-black m-0 text-slate-900 dark:text-white tracking-tight">Broadcasts</h2>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Official news from the cell</p>
                            </div>
                            <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" onClick={() => navigate('/student/dashboard')}>History &rarr;</Button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {announcements.length > 0 ? (
                                announcements.map((ann: any) => (
                                    <div
                                        key={ann._id}
                                        className={`group relative flex gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer
                                            ${ann.isRead
                                                ? 'bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
                                                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}
                                        onClick={() => {
                                            if (!ann.isRead) markReadMutation.mutate(ann._id);
                                        }}
                                    >
                                        <div className="flex flex-col items-center justify-center min-w-[52px] h-[52px] shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 group-hover:bg-indigo-100 transition-colors">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">
                                                {new Date(ann.created_at || ann.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                                                {new Date(ann.created_at || ann.createdAt || new Date()).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 m-0 truncate group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
                                                {!ann.isRead && (
                                                    <div className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 m-0 leading-relaxed line-clamp-1">{ann.message}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 px-6 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/50">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active broadcasts</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column - Widgets & Secondary Info */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    {readinessData && (
                        <ReadinessMeter 
                            score={readinessData.score}
                            label={readinessData.label}
                            recommendations={readinessData.recommendations}
                        />
                    )}

                    {gamificationStats && (
                        <Card className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 border-none shadow-xl p-6 text-white relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors" />
                             
                             <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-sm">
                                    <Award size={18} className="text-indigo-400" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Accomplishments</h3>
                             </div>

                             <div className="flex flex-wrap gap-2.5 relative z-10">
                                    {(gamificationStats.badges || []).length > 0 ? (
                                        gamificationStats.badges.map((badge: any, idx: number) => (
                                            <div key={idx} className="group/badge relative">
                                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 transition-all duration-300 hover:scale-110 hover:bg-white/20 cursor-help border border-white/10">
                                                    <Shield size={20} className="text-amber-400" />
                                                </div>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-slate-900 text-[10px] font-black rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl">
                                                    {badge.type.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-2 text-[10px] font-bold text-slate-500 uppercase">Collect badges by completing your profile</div>
                                    )}
                             </div>
                             
                             <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-2xl font-black tracking-tight">{gamificationStats.points} <span className="text-[10px] text-slate-500 uppercase">Points</span></div>
                                        <div className="text-[10px] font-black uppercase text-indigo-400 mt-1">Tier 1 Elite</div>
                                    </div>
                                    <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[65%]" />
                                    </div>
                                </div>
                             </div>
                        </Card>
                    )}

                    <div className="flex-1 h-[450px]">
                        <OnlinePeersWidget />
                    </div>

                    <Card border className="bg-white dark:bg-slate-800 shadow-sm border-slate-100 dark:border-slate-700">
                        <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                             <TrendingUp size={16} className="text-indigo-500" />
                             Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                isFullWidth 
                                variant="ghost" 
                                className="h-auto py-4 flex-col gap-2 text-[9px] font-black uppercase tracking-widest rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20"
                                onClick={() => navigate('/student/jobs')}
                            >
                                <Briefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
                                Jobs
                            </Button>
                            <Button 
                                isFullWidth 
                                variant="ghost" 
                                className="h-auto py-4 flex-col gap-2 text-[9px] font-black uppercase tracking-widest rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20"
                                onClick={() => navigate('/student/profile')}
                            >
                                <User size={18} className="text-indigo-600 dark:text-indigo-400" />
                                Profile
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Featured Opportunities - Bottom Wide Section */}
                {featuredJobs.length > 0 && (
                    <div className="md:col-span-12 mt-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-8">
                             <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white m-0 flex items-center gap-3 tracking-tight">
                                    <Star size={24} className="text-amber-400 fill-amber-400" />
                                    Elite Picks
                                </h2>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Recommended based on your readiness</p>
                             </div>
                             <Button variant="ghost" className="font-black text-[10px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition-colors uppercase tracking-widest" onClick={() => navigate('/student/jobs')}>FULL BOARD &rarr;</Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredJobs.map((job: any) => (
                                <Card 
                                    key={job._id} 
                                    hoverable
                                    className="p-6 transition-all duration-500 cursor-pointer group"
                                    onClick={() => navigate('/student/jobs')}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700/50 shadow-inner flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-600 group-hover:scale-110 transition-transform">
                                            {job.company_name?.charAt(0) || 'J'}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg mb-2">High Match</span>
                                            <span className="text-base font-black text-slate-900 dark:text-white">₹{job.package_lpa} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">LPA</span></span>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-50 m-0 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1 group-hover:text-slate-600 transition-colors">{job.company_name}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-slate-300" />
                                            {new Date(job.deadline).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
