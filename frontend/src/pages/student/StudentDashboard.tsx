import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';
import { Briefcase, FileText, CheckCircle, Clock, Star } from 'lucide-react';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { Announcement } from '../../types';

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

    // Handle toast error triggering just once if queries fail
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
        <div className="flex flex-col gap-8">
            <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-indigo-700 mb-2">Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}! 👋</h1>
                <p className="text-slate-500 text-lg">Here's what's happening with your placements today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Card className="flex items-center gap-5 p-6">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-sky-100 text-sky-600">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1 leading-none">{stats?.applicationsSent}</h3>
                        <p className="text-slate-500 text-sm font-medium m-0">Applications Sent</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-5 p-6">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-orange-100 text-orange-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1 leading-none">{stats?.interviewsScheduled}</h3>
                        <p className="text-slate-500 text-sm font-medium m-0">Interviews Scheduled</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-5 p-6">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-green-100 text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1 leading-none">{stats?.offersReceived}</h3>
                        <p className="text-slate-500 text-sm font-medium m-0">Offers Received</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-5 p-6">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-purple-100 text-purple-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1 leading-none">{stats?.pendingApplications ?? 0}</h3>
                        <p className="text-slate-500 text-sm font-medium m-0">Pending Review</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>

                {/* Left Column: Recent Activity / Announcements */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold m-0 text-slate-800">Latest Announcements</h2>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {announcements.length > 0 ? (
                                announcements.map((ann) => (
                                    <div key={ann._id} className="flex gap-4 p-4 bg-slate-50 rounded-md border-l-4 border-indigo-500 transition-transform duration-200 hover:translate-x-1 hover:bg-slate-100">
                                        <span className="text-xs font-semibold text-indigo-600 uppercase min-w-[50px] shrink-0 mt-0.5">
                                            {new Date(ann.created_at || ann.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <div>
                                            <h4 className="mb-1 text-base font-bold text-slate-800">{ann.title}</h4>
                                            <p className="text-sm text-slate-500 m-0">{ann.message ? ann.message.substring(0, 100) : ''}...</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-8 text-slate-500 italic">
                                    <p>No new announcements at this time.</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Featured Opportunities */}
                    {featuredJobs.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                                <Star size={20} className="text-amber-500 fill-amber-500" />
                                Featured Opportunities
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {featuredJobs.map((job: any) => (
                                    <Card key={job._id} className="p-5 border-indigo-100 bg-indigo-50/30 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-slate-800 m-0 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight">{job.company_name}</p>
                                            </div>
                                            <div className="p-1 px-2 rounded bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">
                                                Featured
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-indigo-600">₹{job.package_lpa} LPA</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} /> Ends {new Date(job.deadline).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Button isFullWidth size="sm" variant="ghost" className="bg-white border-indigo-100 text-indigo-600 text-xs font-bold">
                                            Apply Now &rarr;
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Quick Actions */}
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-xl font-bold mb-6 text-slate-800">Quick Actions</h2>
                        <div className="flex flex-col gap-4">
                            <Button isFullWidth variant="primary" icon={Briefcase}>Browse Jobs</Button>
                            <Button isFullWidth variant="secondary" icon={FileText}>Upload Resume</Button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;
