import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import { Users, Building, Activity, ShieldAlert, CheckCircle, XCircle, DownloadCloud, Megaphone, BarChart3, PieChart, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import TrendsChart from '../../components/Charts/TrendsChart';
import FunnelChart from '../../components/Charts/FunnelChart';
import ExportReportsModal from '../../components/ExportReportsModal/ExportReportsModal';

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
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">Admin Overview</h1>
                    <p className="text-slate-500 text-base m-0">System metrics and pending approval actions.</p>
                </div>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col p-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600 mb-4">
                        <Users size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-3xl font-bold text-slate-800 m-0 leading-none">{stats?.totalStudents}</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Registered Students</p>
                    </div>
                </Card>

                <Card className="flex flex-col p-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 text-purple-600 mb-4">
                        <Building size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-3xl font-bold text-slate-800 m-0 leading-none">{stats?.totalRecruiters}</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Approved Companies</p>
                    </div>
                </Card>

                <Card className="flex flex-col p-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-orange-100 text-orange-600 mb-4">
                        <Activity size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-3xl font-bold text-slate-800 m-0 leading-none">{stats?.placementRate}</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Platform Placement Rate</p>
                    </div>
                </Card>
            </div>

            {/* Interactive Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                <div className="flex flex-col gap-3">
                    <TrendsChart data={trendsData} isLoading={isTrendsLoading} />
                    <button
                        onClick={() => navigate('/admin/analytics')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 self-end px-2"
                    >
                        <Activity size={14} /> View Advanced Trends &rarr;
                    </button>
                </div>
                <div className="flex flex-col gap-3">
                    <FunnelChart data={funnelData} isLoading={isFunnelLoading} />
                    <button
                        onClick={() => navigate('/admin/analytics')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 self-end px-2"
                    >
                        <BarChart3 size={14} /> Deep-Dive Funnel &rarr;
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-2">

                {/* Pending Actions / Approvals */}
                <div>
                    <Card className="flex flex-col p-6 lg:p-8 h-full">
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
                                        <div className="flex flex-col">
                                            <h4 className="text-[17px] font-semibold text-slate-800 mb-1">{rec.company_name || 'Unknown Company'}</h4>
                                            <p className="text-sm text-slate-500 m-0">{rec.contact_person} ({rec.email})</p>
                                        </div>
                                        <div className="flex gap-3">
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

                {/* Quick Links */}
                <div>
                    <Card className="flex flex-col p-6 lg:p-8 h-full">
                        <h2 className="text-xl font-bold text-indigo-700 m-0">Management Links</h2>
                        <div className="flex flex-col gap-4 mt-6">
                            <Button isFullWidth variant="secondary" icon={Users} onClick={() => navigate('/admin/students')}>Manage Students</Button>
                            <Button isFullWidth variant="secondary" icon={Briefcase} onClick={() => navigate('/admin/jobs')}>Job Quality & Approvals</Button>
                            <Button isFullWidth variant="secondary" icon={Building} onClick={() => navigate('/admin/recruiters')}>Manage Companies</Button>
                            <Button isFullWidth variant="secondary" icon={Megaphone} onClick={() => navigate('/admin/announcements')}>Global Announcements</Button>
                            <Button isFullWidth variant="secondary" icon={ShieldAlert} onClick={() => navigate('/admin/audit-logs')}>Security Logs</Button>
                            <Button isFullWidth variant="secondary" icon={PieChart} onClick={() => navigate('/admin/analytics')}>Advanced Analytics</Button>
                            <div className="h-px bg-slate-200 my-2"></div>
                            {/* Future links for reports could go here */}
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
                </div>

            </div>

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
