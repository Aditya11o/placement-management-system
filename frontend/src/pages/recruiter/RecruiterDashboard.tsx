import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import { Briefcase, Users, CheckCircle, TrendingUp, Plus, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job, Announcement } from '../../types';

interface RecruiterStats {
    activeJobs: number;
    totalApplicants: number;
    shortlisted: number;
    hired: number;
}

// Derive stats from real endpoints instead of hardcoding
const fetchRecruiterStats = async (): Promise<RecruiterStats> => {
    const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs/recruiter'),
        api.get('/applications/recruiter'),
    ]);
    const jobs: any[] = jobsRes.data?.data ?? [];
    const apps: any[] = appsRes.data?.data ?? [];
    return {
        activeJobs: jobs.filter((j) => j.status === 'ACTIVE').length || jobs.length,
        totalApplicants: apps.length,
        shortlisted: apps.filter((a) => a.status === 'SHORTLISTED').length,
        hired: apps.filter((a) => a.status === 'HIRED' || a.status === 'SELECTED').length,
    };
};

const fetchRecentJobs = async (): Promise<Job[]> => {
    const res = await api.get('/jobs/recruiter');
    return res.data.data.slice(0, 4); // Get top 4
};

const fetchAnnouncements = async (): Promise<Announcement[]> => {
    const res = await api.get('/announcements');
    const data = res.data?.data || [];
    return Array.isArray(data) ? data.slice(0, 3) : [];
};

const RecruiterDashboard: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const { data: stats, isPending: sLoading, isError: sError } = useQuery({
        queryKey: ['recruiterStats'],
        queryFn: fetchRecruiterStats,
        enabled: !!user,
    });

    const { data: recentJobs = [], isPending: jLoading, isError: jError } = useQuery({
        queryKey: ['recruiterJobs', 'recent'],
        queryFn: fetchRecentJobs,
        enabled: !!user,
    });

    const { data: announcements = [], isPending: aLoading, isError: aError } = useQuery({
        queryKey: ['announcements', 'latest'],
        queryFn: fetchAnnouncements,
        enabled: !!user,
    });

    const { data: notifyStats, isPending: nLoading, isError: nError } = useQuery({
        queryKey: ['recruiterNotifyStats'],
        queryFn: async () => {
            const res = await api.get('/notifications/recruiter/stats');
            return res.data.data;
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
        if (sError || jError || aError || nError) addToast('Failed to load dashboard data', 'error');
    }, [sError, jError, aError, nError, addToast]);

    if (sLoading || jLoading || aLoading || nLoading) return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start gap-4 animate-pulse">
                <div className="flex flex-col gap-2">
                    <div className="h-9 w-64 rounded bg-slate-200" />
                    <div className="h-5 w-80 rounded bg-slate-100" />
                </div>
                <div className="h-10 w-32 rounded-lg bg-slate-200" />
            </div>
            <SkeletonCard count={4} />
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <SkeletonTable rows={4} cols={4} />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">Company Dashboard</h1>
                    <p className="text-slate-500 text-base m-0">Welcome back, {user?.name}. Here's your recruitment overview.</p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => navigate('/recruiter/jobs')}
                >
                    Post New Job
                </Button>
            </div>

            {/* Recruiter Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="flex items-center p-6 gap-4 relative overflow-hidden h-full">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 bg-blue-100 text-blue-600">
                        <Briefcase size={24} />
                    </div>
                    <div className="flex flex-col z-10">
                        <h3 className="text-3xl font-bold text-slate-800 leading-tight m-0">{stats?.activeJobs}</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1 mb-0">Active Job Postings</p>
                    </div>
                </Card>

                <Card className="flex items-center p-6 gap-4 relative overflow-hidden h-full">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 bg-purple-100 text-purple-600">
                        <Users size={24} />
                    </div>
                    <div className="flex flex-col z-10">
                        <h3 className="text-3xl font-bold text-slate-800 leading-tight m-0">{stats?.totalApplicants}</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1 mb-0">Total Applications</p>
                    </div>
                </Card>

                <Card className="flex items-center p-6 gap-4 relative overflow-hidden h-full">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 bg-orange-100 text-orange-600">
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex flex-col z-10">
                        <h3 className="text-3xl font-bold text-slate-800 leading-tight m-0">{stats?.shortlisted}</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1 mb-0">Candidates Shortlisted</p>
                    </div>
                </Card>

                <Card className="flex items-center p-6 gap-4 relative overflow-hidden h-full">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 bg-green-100 text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div className="flex flex-col z-10">
                        <h3 className="text-3xl font-bold text-slate-800 leading-tight m-0">{stats?.hired}</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1 mb-0">Total Hires</p>
                    </div>
                </Card>
            </div>

            {/* Main Grid area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">Recent Job Postings</h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/recruiter/jobs')}>View All</Button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {recentJobs.length === 0 ? (
                                <div className="text-center p-8 text-slate-500 italic bg-slate-50 rounded border border-dashed border-slate-300">
                                    <p>No active job postings found.</p>
                                </div>
                            ) : (
                                recentJobs.map(job => (
                                    <div key={job._id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-md transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50">
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-base font-bold text-slate-800 m-0">{job.title}</h4>
                                            <span className="text-[13px] text-slate-500">Posted on {new Date(job.createdAt || new Date()).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                                                <Users size={14} className="text-slate-500" />
                                                <span>{job.applicationCount || 0}</span>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 pb-4 border-b border-slate-200">Quick Actions</h2>
                        <div className="flex flex-col gap-3">
                            <Button isFullWidth variant="secondary" icon={Users} onClick={() => navigate('/recruiter/applicants')}>Review Applicants</Button>
                            <Button isFullWidth variant="ghost" icon={Briefcase} onClick={() => navigate('/recruiter/profile')}>Edit Company Profile</Button>
                        </div>
                    </Card>

                    <Card className="mt-6 bg-indigo-50/30 border-indigo-100">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-indigo-600" />
                            <h2 className="text-lg font-bold text-slate-800 m-0">Notification Reach</h2>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black text-slate-900">{notifyStats?.reads || 0}</span>
                                <span className="text-xs text-slate-500 font-medium mb-1">out of {notifyStats?.total || 0} students</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                                <div
                                    className="bg-indigo-600 h-full transition-all duration-1000"
                                    style={{ width: `${notifyStats?.rate || 0}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 italic">
                                Percentage of students who viewed your job notifications.
                            </p>
                        </div>
                    </Card>

                    <Card className="mt-6 border-l-4 border-indigo-500">
                        <div className="flex items-center gap-2 mb-4">
                            <Megaphone size={20} className="text-indigo-600" />
                            <h2 className="text-lg font-bold text-slate-800 m-0">Recent Announcements</h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            {announcements.length > 0 ? (
                                announcements.map((ann: any) => (
                                    <div
                                        key={ann._id}
                                        className={`pb-3 border-b border-slate-100 last:border-0 cursor-pointer transition-all hover:bg-slate-50/50 px-1 rounded
                                            ${ann.isRead ? 'opacity-60' : ''}`}
                                        onClick={() => {
                                            if (!ann.isRead) markReadMutation.mutate(ann._id);
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className={`text-sm m-0 ${ann.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                                                {ann.title}
                                            </h4>
                                            {!ann.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-[13px] text-slate-500 line-clamp-2 my-0">{ann.message}</p>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            {new Date(ann.created_at || ann.createdAt || new Date()).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 italic text-center p-4">No recent announcements.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
