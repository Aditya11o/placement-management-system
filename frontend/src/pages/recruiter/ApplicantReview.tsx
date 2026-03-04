import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import FilterBar from '../../components/FilterBar/FilterBar';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import { ShieldCheck, XCircle, FileText, Filter } from 'lucide-react';
import api from '../../services/api';
import { Job, Application } from '../../types';

interface UIApplicant extends Omit<Application, 'student' | 'job'> {
    student?: { name: string; email: string; resume_url?: string };
    job?: { _id: string; title: string };
    matchScore?: number;
}

const ApplicantReview: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [selectedJob, setSelectedJob] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // ── Fetch recruiter jobs (for filter dropdown) ──────────────────────────
    const { data: jobs = [] } = useQuery<Job[]>({
        queryKey: ['recruiterJobs'],
        queryFn: async () => {
            const res = await api.get('/jobs/recruiter');
            return res.data.data ?? [];
        },
        enabled: !!user,
    });

    // ── Fetch applications ───────────────────────────────────────────────────
    const { data: applications = [], isLoading } = useQuery<UIApplicant[]>({
        queryKey: ['recruiterApplications'],
        queryFn: async () => {
            const res = await api.get('/applications/recruiter');
            return res.data.data ?? [];
        },
        enabled: !!user,
    });

    // ── Mutation: update application status ──────────────────────────────────
    const statusMutation = useMutation({
        mutationFn: ({ appId, newStatus }: { appId: string; newStatus: string }) =>
            api.put(`/applications/${appId}/status`, { status: newStatus }),
        onSuccess: (_, { newStatus }) => {
            addToast(`Application marked as ${newStatus}`, 'success');
            queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
        },
        onError: (error: any) => {
            addToast(error.response?.data?.message || 'Failed to update status', 'error');
        },
    });

    // ── Derived: filtered + sorted list ─────────────────────────────────────
    const filtered = applications
        .filter((app) => {
            const matchJob = selectedJob === 'ALL' || app.job?._id === selectedJob;
            const matchStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
            const q = searchTerm.toLowerCase();
            const matchSearch =
                app.student?.name?.toLowerCase().includes(q) ||
                app.job?.title?.toLowerCase().includes(q) ||
                app.student?.email?.toLowerCase().includes(q);
            return matchJob && matchStatus && matchSearch;
        })
        .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

    const scoreColor = (score: number) =>
        score >= 80 ? 'text-green-600' : score >= 50 ? 'text-indigo-500' : 'text-red-500';

    const statusPillClass: Record<string, string> = {
        PENDING: 'bg-amber-100 text-amber-600',
        SHORTLISTED: 'bg-blue-100 text-blue-600',
        REJECTED: 'bg-red-100 text-red-600',
        HIRED: 'bg-green-100 text-green-600',
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-indigo-700 mb-1">Applicant Review Board</h1>
                <p className="text-slate-500 text-base m-0">Evaluate candidates and manage application pipelines.</p>
            </div>

            <FilterBar
                searchPlaceholder="Search candidate name or email..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={[
                    {
                        value: selectedJob,
                        onChange: setSelectedJob,
                        showIcon: true,
                        options: [
                            { label: 'All Jobs', value: 'ALL' },
                            ...jobs.map((j) => ({ label: j.title, value: j._id })),
                        ],
                    },
                    {
                        value: selectedStatus,
                        onChange: setSelectedStatus,
                        options: [
                            { label: 'All Statuses', value: 'ALL' },
                            { label: 'Pending Review', value: 'PENDING' },
                            { label: 'Shortlisted', value: 'SHORTLISTED' },
                            { label: 'Rejected', value: 'REJECTED' },
                            { label: 'Hired', value: 'HIRED' },
                        ],
                    },
                ]}
            />

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <Card className="overflow-hidden p-0">
                        <SkeletonTable rows={5} cols={4} />
                    </Card>
                ) : filtered.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center">
                        <Filter size={48} className="text-slate-400 mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2 text-slate-700">No candidates found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                    </Card>
                ) : (
                    filtered.map((app) => (
                        <Card
                            key={app._id}
                            className="flex flex-wrap justify-between items-center p-6 gap-6 transition-all hover:border-indigo-300 hover:shadow-md"
                        >
                            {/* Left: Applicant Info */}
                            <div className="flex items-center gap-4 min-w-[250px] flex-1">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold shrink-0">
                                    {app.student?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-[17px] font-bold text-slate-800 mb-0.5 m-0">
                                        {app.student?.name || 'Unknown Student'}
                                    </h4>
                                    <span className="text-[13px] text-slate-500 mb-1">{app.student?.email}</span>
                                    <span className="text-xs font-semibold text-indigo-600">
                                        Applied for: {app.job?.title}
                                    </span>
                                </div>
                            </div>

                            {/* Center: AI Score & Resume */}
                            <div className="flex items-center gap-8 min-w-[200px]">
                                <div className="text-center">
                                    <span className="block text-xs text-slate-500 uppercase tracking-wide mb-1">
                                        AI Match Score
                                    </span>
                                    <span className={`text-xl font-extrabold ${scoreColor(app.matchScore ?? 0)}`}>
                                        {app.matchScore ?? 0}%
                                    </span>
                                </div>

                                {app.student?.resume_url && (
                                    <a
                                        href={app.student.resume_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 text-slate-600 rounded-md text-sm font-medium transition-colors hover:bg-slate-200 hover:text-slate-900"
                                    >
                                        <FileText size={16} /> View Resume
                                    </a>
                                )}
                            </div>

                            {/* Right: Status + Actions */}
                            <div className="flex flex-col items-end gap-3 min-w-[150px]">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusPillClass[app.status] ?? 'bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    {app.status}
                                </span>

                                <div className="flex gap-2">
                                    {app.status !== 'SHORTLISTED' && app.status !== 'HIRED' && (
                                        <button
                                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-indigo-600 bg-white border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 transition-all"
                                            onClick={() => statusMutation.mutate({ appId: app._id, newStatus: 'SHORTLISTED' })}
                                            disabled={statusMutation.isPending}
                                            title="Shortlist"
                                        >
                                            <ShieldCheck size={16} />
                                        </button>
                                    )}
                                    {app.status === 'SHORTLISTED' && (
                                        <button
                                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border bg-green-600 border-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-all"
                                            onClick={() => statusMutation.mutate({ appId: app._id, newStatus: 'HIRED' })}
                                            disabled={statusMutation.isPending}
                                            title="Mark as Hired"
                                        >
                                            <ShieldCheck size={16} /> Hire
                                        </button>
                                    )}
                                    {app.status !== 'REJECTED' && app.status !== 'HIRED' && (
                                        <button
                                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-red-600 bg-white border-red-200 hover:bg-red-50 disabled:opacity-50 transition-all"
                                            onClick={() => statusMutation.mutate({ appId: app._id, newStatus: 'REJECTED' })}
                                            disabled={statusMutation.isPending}
                                            title="Reject"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ApplicantReview;
