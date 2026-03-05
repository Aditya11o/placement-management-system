import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Briefcase,
    CheckCircle,
    XCircle,
    Star,
    Clock,
    Building,
    Eye,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    RefreshCw,
    Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminJobs = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

    const { data: jobData, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['adminJobs', page, activeTab],
        queryFn: async () => {
            const filter = activeTab === 'pending' ? 'is_approved=false' : '';
            const res = await api.get(`/admin/jobs?${filter}&page=${page}&limit=10&sort=-created_at`);
            return res.data;
        }
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, is_approved, is_featured }: { id: string, is_approved?: boolean, is_featured?: boolean }) => {
            return api.put(`/admin/jobs/${id}/status`, { is_approved, is_featured });
        },
        onSuccess: (_, variables) => {
            const action = variables.is_approved !== undefined
                ? (variables.is_approved ? 'approved' : 'rejected')
                : 'updated';
            addToast(`Job ${action} successfully.`, 'success');
            queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
        },
        onError: () => {
            addToast('Failed to update job status.', 'error');
        }
    });

    const handleApproval = (id: string, approve: boolean) => {
        statusMutation.mutate({ id, is_approved: approve });
    };

    const handleToggleFeatured = (id: string, current: boolean) => {
        statusMutation.mutate({ id, is_featured: !current });
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Link to="/admin/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white m-0 tracking-tight">Job Approval Queue</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0 ml-9">Review, approve, and feature job postings from recruiters.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        icon={RefreshCw}
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className={isFetching ? 'animate-spin' : ''}
                    >
                        Refresh Queue
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                <button
                    onClick={() => { setActiveTab('pending'); setPage(1); }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    Pending Review
                </button>
                <button
                    onClick={() => { setActiveTab('all'); setPage(1); }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    All Jobs
                </button>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse h-32 border-slate-200">
                            <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                        </Card>
                    ))}
                </div>
            ) : jobData?.data?.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-20 text-center text-slate-400 border-dashed border-2 border-slate-200 dark:border-slate-800">
                    <Briefcase size={64} className="mb-4 opacity-20" />
                    <h3 className="text-xl font-bold text-slate-500 m-0">No jobs in this queue.</h3>
                    <p className="text-sm m-0 mt-1">Recruiter job postings requiring action will appear here.</p>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {jobData.data.map((job: any) => (
                        <Card key={job._id} className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col md:flex-row items-stretch">
                                {/* Side accent - changes color based on approval status */}
                                <div className={`w-1.5 shrink-0 ${job.is_approved ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`} />

                                <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white m-0">{job.title}</h3>
                                            {job.is_featured && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">
                                                    <Star size={10} fill="currentColor" /> Featured
                                                </span>
                                            )}
                                            {!job.is_approved && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-100 dark:border-amber-800">
                                                    Awaiting Approval
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5 font-semibold">
                                                <Building size={14} /> {job.company_name}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} /> Posted {new Date(job.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="font-mono text-xs bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                ID: {job._id.slice(-6)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                        <button
                                            onClick={() => handleToggleFeatured(job._id, job.is_featured)}
                                            className={`p-2.5 rounded-xl border transition-all ${job.is_featured
                                                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                                                } dark:bg-slate-900 dark:border-slate-700`}
                                            title={job.is_featured ? 'Unfeature Job' : 'Feature Job'}
                                        >
                                            <Star size={20} fill={job.is_featured ? "currentColor" : "none"} />
                                        </button>

                                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                                        {activeTab === 'pending' ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    icon={XCircle}
                                                    onClick={() => handleApproval(job._id, false)}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                                                    icon={CheckCircle}
                                                    onClick={() => handleApproval(job._id, true)}
                                                >
                                                    Approve Job
                                                </Button>
                                            </>
                                        ) : (
                                            <Link to={`/admin/jobs/${job._id}`} className="flex items-center gap-2 text-indigo-600 font-bold text-sm px-4 py-2 hover:bg-indigo-50 rounded-lg transition-all">
                                                <Eye size={18} /> View Details
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Pagination */}
                    {jobData.pagination && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <p className="text-sm text-slate-500 font-medium tracking-tight">
                                Showing page <span className="text-slate-800 dark:text-white font-bold">{page}</span> of job registry
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!jobData.pagination.prev}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 disabled:opacity-40 transition-all hover:bg-slate-50 shadow-sm"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!jobData.pagination.next}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 disabled:opacity-40 transition-all hover:bg-slate-50 shadow-sm"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Guide Info */}
            <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-5 mt-4">
                <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 shadow-lg shadow-indigo-500/30">
                    <Info size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200 m-0">Approval Workflow Guidelines</p>
                    <p className="text-xs text-indigo-700/70 dark:text-indigo-300/60 m-0">
                        Featured jobs appear at the top of the student dashboard. Ensure job descriptions comply with university placement policies before approval.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminJobs;
