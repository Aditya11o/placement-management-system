import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import {
    Users, Building, Activity, ShieldAlert, CheckCircle, XCircle,
    DownloadCloud, Megaphone, BarChart3,
    TrendingUp, Send, ShieldCheck, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import TrendsChart from '../../components/Charts/TrendsChart';
import FunnelChart from '../../components/Charts/FunnelChart';
import ExportReportsModal from '../../components/ExportReportsModal/ExportReportsModal';
import PulseFeed from '../../components/PulseFeed/PulseFeed';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import { motion, Variants } from 'framer-motion';

// Framer Motion Variants for Staggered List Animation
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const AdminDashboard = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Fetch Dashboard Stats
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await api.get('/admin/dashboard');
            return res.data.success ? {
                totalStudents: res.data.data.studentCount,
                totalRecruiters: res.data.data.recruiterCount,
                totalJobs: res.data.data.activeJobs,
                placedStudents: res.data.data.placedStudents,
                placementRate: res.data.data.placementRate
            } : null;
        }
    });

    // Fetch Pending Recruiters
    const { data: pendingRecruiters = [], isLoading: isRecruitersLoading } = useQuery({
        queryKey: ['adminPendingRecruiters'],
        queryFn: async () => {
            const res = await api.get('/admin/users?role=RECRUITER&status=PENDING');
            return res.data?.data || [];
        }
    });

    // Fetch Analytics Trends
    const { data: trendsData, isLoading: isTrendsLoading } = useQuery({
        queryKey: ['adminTrends'],
        queryFn: async () => {
            const res = await api.get('/analytics/trends');
            return res.data.data;
        }
    });

    // Fetch Analytics Funnel
    const { data: funnelData, isLoading: isFunnelLoading } = useQuery({
        queryKey: ['adminFunnel'],
        queryFn: async () => {
            const res = await api.get('/analytics/funnel');
            return res.data.data;
        }
    });

    // Mutation for Approving/Rejecting
    const approvalMutation = useMutation({
        mutationFn: async ({ id, action }: { id: string, action: string }) => {
            const status = action === 'approve' ? 'APPROVED' : 'BLOCKED';
            return await api.put('/admin/users/status', {
                id,
                role: 'RECRUITER',
                status
            });
        },
        onSuccess: (_, variables) => {
            addToast(`Recruiter ${variables.action}d successfully.`, 'success');
            queryClient.invalidateQueries({ queryKey: ['adminPendingRecruiters'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        },
        onError: (_, variables) => {
            addToast(`Failed to ${variables.action} recruiter.`, 'error');
        }
    });

    const handleRecruiterApproval = (id: string, action: string) => {
        approvalMutation.mutate({ id, action });
    };

    // Mutation for Exporting Data
    const exportMutation = useMutation({
        mutationFn: async (type: 'students' | 'applications') => {
            const res = await api.post('/admin/export', { type });
            return res.data;
        },
        onSuccess: (data) => {
            addToast(data.message || 'Export queued successfully. You will receive an email shortly.', 'success');
            setIsExportModalOpen(false);
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Failed to generate export report.', 'error');
            setIsExportModalOpen(false);
        }
    });

    const isLoading = isStatsLoading || isRecruitersLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <div className="h-8 w-48 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-80 rounded bg-slate-100 animate-pulse" />
                </div>
                <SkeletonCard count={3} />
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <SkeletonTable rows={3} cols={4} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in overflow-hidden">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">Overview Dashboard</h1>
                    <p className="text-slate-500 text-base m-0">System metrics and pending approval actions.</p>
                </div>
            </div>

            {/* Admin Stats Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <motion.div variants={itemVariants}>
                    <Card className="flex flex-col p-6 h-full" hoverable>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600 mb-4">
                            <Users size={24} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-bold text-slate-800 m-0 leading-none">
                                <AnimatedCounter value={stats?.totalStudents || 0} />
                            </h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Registered Students</p>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="flex flex-col p-6 h-full" hoverable>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 text-purple-600 mb-4">
                            <Building size={24} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-bold text-slate-800 m-0 leading-none">
                                <AnimatedCounter value={stats?.totalRecruiters || 0} />
                            </h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Approved Companies</p>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="flex flex-col p-6 h-full" hoverable>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-orange-100 text-orange-600 mb-4">
                            <Activity size={24} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-bold text-slate-800 m-0 leading-none">
                                {/* Simple text extraction as percentage might have % sign from API or we append it */}
                                {stats?.placementRate || '0%'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Platform Placement Rate</p>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Interactive Analytics Charts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2"
            >
                <div className="flex flex-col gap-3 min-w-0">
                    <TrendsChart data={trendsData} isLoading={isTrendsLoading} />
                    <button
                        onClick={() => navigate('/admin/analytics-deep-dive')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 self-end px-2"
                    >
                        <TrendingUp size={14} /> View Advanced Trends &rarr;
                    </button>
                </div>
                <div className="flex flex-col gap-3 min-w-0">
                    <FunnelChart data={funnelData} isLoading={isFunnelLoading} />
                    <button
                        onClick={() => navigate('/admin/analytics-deep-dive')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 self-end px-2"
                    >
                        <BarChart3 size={14} /> Deep-Dive Analytics &rarr;
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-2"
            >

                {/* Pending Actions / Approvals */}
                <div className="min-w-0">
                    <Card className="flex flex-col p-6 lg:p-8 h-full" hoverable>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-indigo-700 m-0">Pending Approvals</h2>
                                {pendingRecruiters.length > 0 && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600">{pendingRecruiters.length} Pending</span>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/admin/approvals')}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                            >
                                View All &rarr;
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {pendingRecruiters.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                                    <ShieldAlert size={40} className="text-slate-400 opacity-50 mb-3" />
                                    <p>No pending recruiter registrations require attention.</p>
                                </div>
                            ) : (
                                pendingRecruiters.map((rec: any) => (
                                    <div key={rec._id} className="flex justify-between items-center p-5 bg-slate-50 border border-slate-200 rounded-md">
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="text-[17px] font-semibold text-slate-800 mb-1 truncate">{rec.company_name || 'Unknown Company'}</h4>
                                            <p className="text-sm text-slate-500 m-0 truncate">{rec.contact_person} ({rec.email})</p>
                                        </div>
                                        <div className="flex gap-3 shrink-0">
                                            <button className="bg-green-50 border-none flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all text-green-600 hover:bg-green-200 disabled:opacity-50" onClick={() => handleRecruiterApproval(rec._id, 'approve')} disabled={approvalMutation.isPending}>
                                                <CheckCircle size={20} />
                                            </button>
                                            <button className="bg-red-50 border-none flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all text-red-600 hover:bg-red-200 disabled:opacity-50" onClick={() => handleRecruiterApproval(rec._id, 'reject')} disabled={approvalMutation.isPending}>
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Pulse Feed */}
                <div className="h-[500px] lg:h-auto min-w-0">
                    <PulseFeed />
                </div>

            </motion.div>

            {/* Quick Links - Full Width */}
            {/* Super Admin Tools & Quick Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* Premium Super Admin Hub */}
                <Card
                    className="flex flex-col p-6 lg:p-8 relative overflow-hidden ring-1 ring-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)] transition-all hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.2)]"
                    hoverable
                >
                    {/* Subtle decorative background pattern */}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                    <h2 className="text-xl font-bold text-amber-600 dark:text-amber-500 m-0 flex items-center gap-2 relative z-10">
                        <ShieldCheck size={22} className="shrink-0" /> Super Admin Tools
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6 relative z-10">Advanced system control and communication modules.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        <Button isFullWidth variant="secondary" icon={Send} onClick={() => navigate('/admin/communication')} className="bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/50">Communication Center</Button>
                        <Button isFullWidth variant="secondary" icon={TrendingUp} onClick={() => navigate('/admin/analytics-deep-dive')} className="bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/50">Analytics Deep Dive</Button>
                        <Button isFullWidth variant="secondary" icon={Zap} onClick={() => navigate('/admin/system-health')} className="bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/50">System Health Monitor</Button>
                        <Button isFullWidth variant="secondary" icon={ShieldCheck} onClick={() => navigate('/admin/rbac')} className="bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/50">Roles & Permissions</Button>
                    </div>
                </Card>

                <Card className="flex flex-col p-6 lg:p-8" hoverable>
                    <h2 className="text-xl font-bold text-slate-700 m-0">Management Links</h2>
                    <p className="text-sm text-slate-400 mt-1 mb-6">Standard operational tools and data export.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button isFullWidth variant="secondary" icon={Users} onClick={() => navigate('/admin/students')}>Manage Students</Button>
                        <Button isFullWidth variant="secondary" icon={Building} onClick={() => navigate('/admin/recruiters')}>Manage Companies</Button>
                        <Button isFullWidth variant="secondary" icon={Megaphone} onClick={() => navigate('/admin/announcements')}>Global Announcements</Button>
                        <Button
                            isFullWidth
                            variant="primary"
                            icon={DownloadCloud}
                            onClick={() => setIsExportModalOpen(true)}
                        >
                            Export Reports
                        </Button>
                    </div>
                </Card>
            </motion.div>

            <ExportReportsModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                isExporting={exportMutation.isPending}
                onExport={(type) => exportMutation.mutate(type)}
            />
        </div>
    );
};

export default AdminDashboard;
