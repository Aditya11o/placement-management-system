import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import {
    Users, Building, Activity, ShieldAlert, CheckCircle, XCircle,
    DownloadCloud, Megaphone,
    TrendingUp, Send, ShieldCheck, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import TrendsChart from '../../components/Charts/TrendsChart';
import FunnelChart from '../../components/Charts/FunnelChart';
import SeasonComparisonChart from '../../components/Charts/SeasonComparisonChart';
import StudentRiskWidget from '../../components/Dashboard/StudentRiskWidget';
import ExportReportsModal from '../../components/ExportReportsModal/ExportReportsModal';
import PulseFeed from '../../components/PulseFeed/PulseFeed';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import AiStrategicInsights from '../../components/Dashboard/AiStrategicInsights';
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

    // Fetch Season Comparison Data
    const { data: seasonData, isLoading: isSeasonLoading } = useQuery({
        queryKey: ['adminSeasonComparison'],
        queryFn: async () => {
            const res = await api.get('/analytics/seasons');
            return res.data.data;
        }
    });

    // Fetch Student Risk Data
    const { data: riskData, isLoading: isRiskLoading } = useQuery({
        queryKey: ['adminRiskAssessment'],
        queryFn: async () => {
            const res = await api.get('/analytics/risk-assessment');
            return res.data.data;
        }
    });

    // Fetch Extended Dashboard Stats
    const { data: extendedStats, isLoading: isExtendedLoading } = useQuery({
        queryKey: ['adminExtendedStats'],
        queryFn: async () => {
            const res = await api.get('/analytics/dashboard-extended');
            return res.data.data;
        }
    });

    // Fetch AI Strategic Insights
    const { data: aiInsights, isLoading: isAiInsightsLoading } = useQuery({
        queryKey: ['adminAiInsights'],
        queryFn: async () => {
            const res = await api.get('/analytics/ai-insights');
            return res.data.data;
        },
        staleTime: 1000 * 60 * 60 // 1 hour stale time for AI calls
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
        mutationFn: async ({ type, justification }: { type: 'students' | 'applications' | 'recruiters', justification: string }) => {
            const res = await api.post('/admin/export', { type, justification });
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
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Overview Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0">System metrics and pending approval actions.</p>
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
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white m-0 leading-none">
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
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white m-0 leading-none">
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
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white m-0 leading-none">
                                {/* Simple text extraction as percentage might have % sign from API or we append it */}
                                {stats?.placementRate || '0%'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Platform Placement Rate</p>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Season Comparison & Analytics Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2"
            >
                <div className="lg:col-span-2">
                    <SeasonComparisonChart data={seasonData} isLoading={isSeasonLoading} />
                </div>
                <div className="flex flex-col gap-6">
                    <Card className="p-6 flex-1 flex flex-col justify-center bg-indigo-50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20" hoverable>
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                            <Activity size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Growth Index</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                                {isExtendedLoading ? '...' : `+${extendedStats?.growthIndex || '0.0'}%`}
                            </span>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                                <TrendingUp size={12} /> vs Last Month
                            </span>
                        </div>
                    </Card>
                    <Card className="p-6 flex-1 flex flex-col justify-center bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20" hoverable>
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                            <Zap size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Response Velocity</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                                {isExtendedLoading ? '...' : extendedStats?.responseVelocity || '0h'}
                            </span>
                            <span className="text-xs font-bold text-indigo-500">Avg. Stage Move</span>
                        </div>
                    </Card>
                </div>
            </motion.div>

            {/* Analytics & Risk Intelligence */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <TrendsChart data={trendsData} isLoading={isTrendsLoading} />
                        <FunnelChart data={funnelData} isLoading={isFunnelLoading} />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="space-y-6"
                >
                    <AiStrategicInsights data={aiInsights} isLoading={isAiInsightsLoading} />
                    <StudentRiskWidget 
                        students={riskData} 
                        isLoading={isRiskLoading} 
                        onViewStudent={(id) => navigate(`/admin/students?id=${id}`)}
                    />
                </motion.div>
            </div>

            {/* Operational Center: Approvals & Feed */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <Card className="flex flex-col p-6 lg:p-8 h-full" hoverable>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 m-0">Pending Approvals</h2>
                            {pendingRecruiters.length > 0 && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20">{pendingRecruiters.length} Pending</span>
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
                                <div key={rec._id} className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="text-[17px] font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate">{rec.company_name || 'Unknown Company'}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 m-0 truncate">{rec.contact_person} ({rec.email})</p>
                                    </div>
                                    <div className="flex gap-3 shrink-0">
                                        <button className="bg-emerald-50 dark:bg-emerald-500/10 border-none flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50" onClick={() => handleRecruiterApproval(rec._id, 'approve')} disabled={approvalMutation.isPending}>
                                            <CheckCircle size={20} />
                                        </button>
                                        <button className="bg-rose-50 dark:bg-rose-500/10 border-none flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:opacity-50" onClick={() => handleRecruiterApproval(rec._id, 'reject')} disabled={approvalMutation.isPending}>
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

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

                <Card className="flex flex-col p-6 lg:p-8 shadow-sm" hoverable>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white m-0">Management Links</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">Standard operational tools and data export.</p>
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
                onExport={(type, justification) => exportMutation.mutate({ type, justification })}
            />
        </div>
    );
};

export default AdminDashboard;
