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
import StreakCard from '../../components/Dashboard/StreakCard';
import { gamificationService } from '../../services/gamificationService';
import OnlinePeersWidget from './components/OnlinePeersWidget';
import PredictiveAnalytics from './components/PredictiveAnalytics';

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

// Derive stats from the real applications list
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
            // Update streak on every dashboard load (debounced by server logic)
            await gamificationService.updateStreak();
            // Check for new badges
            await gamificationService.checkBadges();
            return gamificationService.getStats();
        },
        enabled: !!user,
    });

    const queryClient = useQueryClient();

    const markReadMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/announcements/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
    });

    // Handle toast error triggering just once if queries fail
    React.useEffect(() => {
        if (aError || sError) addToast('Failed to load dashboard data', 'error');
    }, [aError, sError, addToast]);

    if (aLoading || sLoading) return (
        // ... (omitting loading skeleton for brevity in replacement)
        // I will keep the original loading skeleton in the real replacement
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 animate-pulse">
                <div className="h-9 w-72 rounded bg-slate-200" />
                <div className="h-5 w-96 rounded bg-slate-100" />
            </div>
            <SkeletonCard count={4} />
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="h-5 w-32 rounded bg-slate-200 animate-pulse mb-4" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1.5 animate-pulse mb-4">
                        <div className="h-3 w-full rounded bg-slate-100" />
                        <div className="h-3 w-3/4 rounded bg-slate-100" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-10">
            <PageHeader 
                title={`Welcome back, ${user?.name ? user.name.split(' ')[0] : 'Student'}! 👋`}
                subtitle="Your career trajectory is looking sharp today."
            />

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
                
                {/* Stats Bento Block - High Priority */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card border className="flex flex-col justify-between p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-2xl shadow-indigo-500/20">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Briefcase size={28} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full backdrop-blur-sm">Live Applications</span>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-5xl font-black m-0">{stats?.applicationsSent || 0}</h3>
                            <p className="text-indigo-100/80 text-sm font-bold mt-2 uppercase tracking-wide">Total Submissions</p>
                        </div>
                    </Card>

                {/* Predictive Analytics Bento block */}
                <div className="md:col-span-12 lg:col-span-4 h-full">
                    <PredictiveAnalytics />
                </div>
                </div>

                {/* Gamification Bento block */}
                <div className="md:col-span-4 h-full flex flex-col gap-4">
                    {gamificationStats && (
                        <>
                            <StreakCard 
                                streak={gamificationStats.streak.current} 
                                longest={gamificationStats.streak.longest}
                                points={gamificationStats.points}
                            />
                            
                            {/* Badges Bento Block */}
                            <Card className="flex-1 bg-white dark:bg-slate-800 border-none shadow-premium p-6">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Award size={16} className="text-amber-500" />
                                    Earned Badges
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {gamificationStats.badges.length > 0 ? (
                                        gamificationStats.badges.map((badge, idx) => (
                                            <div key={idx} className="group relative">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/20 flex items-center justify-center p-2.5 transition-all duration-300 hover:scale-110 hover:-rotate-6 cursor-help border border-amber-200/50 dark:border-amber-700/30">
                                                    <Shield size={24} className="text-amber-600 dark:text-amber-400" />
                                                </div>
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    {badge.type.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4 w-full text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">No badges yet</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </>
                    )}
                </div>

                {/* Announcements - Long Bento Row */}
                <div className="md:col-span-12 lg:col-span-8">
                    <Card className="h-full">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black m-0 text-slate-900 dark:text-white">Broadcasts</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Stay updated with placement news</p>
                            </div>
                            <Button variant="ghost" size="sm" className="font-black text-xs uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">History &rarr;</Button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {announcements.length > 0 ? (
                                announcements.map((ann: any) => (
                                    <div
                                        key={ann._id}
                                        className={`group relative flex gap-6 p-6 rounded-2xl transition-all duration-300 cursor-pointer
                                            ${ann.isRead
                                                ? 'bg-slate-50/50 dark:bg-slate-900/30 grayscale-[0.5] opacity-60'
                                                : 'bg-white dark:bg-slate-800 shadow-lg shadow-indigo-500/[0.03] hover:shadow-indigo-500/10 hover:-translate-y-1'}`}
                                        onClick={() => {
                                            if (!ann.isRead) markReadMutation.mutate(ann._id);
                                        }}
                                    >
                                        <div className="flex flex-col items-center justify-center min-w-[64px] h-[64px] shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                                                {new Date(ann.created_at || ann.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none mt-1">
                                                {new Date(ann.created_at || ann.createdAt || new Date()).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0 truncate group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
                                                {!ann.isRead && (
                                                    <div className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 m-0 leading-relaxed line-clamp-2">{ann.message}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 px-6 bg-slate-50/50 dark:bg-slate-900/10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800/50">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active broadcasts</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Actions & Metrics */}
                <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
                    {readinessData && (
                        <ReadinessMeter 
                            score={readinessData.score}
                            label={readinessData.label}
                            recommendations={readinessData.recommendations}
                        />
                    )}

                    <div className="flex-1 min-h-[400px]">
                        <OnlinePeersWidget />
                    </div>
                    
                    <Card border className="bg-slate-900 text-white shadow-2xl">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                             <TrendingUp size={20} className="text-indigo-400" />
                             Control Center
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                isFullWidth 
                                variant="primary" 
                                className="h-auto py-5 flex-col gap-3 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-indigo-500/20"
                                onClick={() => navigate('/student/jobs')}
                            >
                                <Briefcase size={22} className="mb-1" />
                                Browse Jobs
                            </Button>
                            <Button 
                                isFullWidth 
                                variant="secondary" 
                                className="h-auto py-5 flex-col gap-3 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-white/10 border-white/10 hover:bg-white/20 transition-all"
                                onClick={() => navigate('/student/profile')}
                            >
                                <User size={22} className="mb-1" />
                                Edit Profile
                            </Button>
                        </div>
                    </Card>

                    {stats && <NextBestAction stats={stats} />}
                </div>

                {/* Featured Opportunities - Wide Row */}
                {featuredJobs.length > 0 && (
                    <div className="md:col-span-12 mt-4">
                        <div className="flex items-center justify-between mb-8 px-2">
                             <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white m-0 flex items-center gap-3">
                                    <Star size={24} className="text-amber-400 fill-amber-400" />
                                    Elite Picks
                                </h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1 ml-9">Exclusively for your profile</p>
                             </div>
                             <Button variant="ghost" className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" onClick={() => navigate('/student/jobs')}>FULL BOARD &rarr;</Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredJobs.map((job: any) => (
                                <Card 
                                    key={job._id} 
                                    hoverable
                                    className="p-8 border-transparent hover:border-indigo-500/30 transition-all duration-500 cursor-pointer group dark:bg-slate-800/50"
                                    onClick={() => navigate('/student/jobs')}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-600 transition-transform group-hover:scale-110">
                                            {job.company_name?.charAt(0) || 'J'}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-full mb-2">Featured</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">₹{job.package_lpa} <span className="text-xs font-bold text-slate-400">LPA</span></span>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-50 m-0 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{job.company_name}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase tracking-tight">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                            <Clock size={12} className="text-red-400" />
                                            Deadline: {new Date(job.deadline).toLocaleDateString()}
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
