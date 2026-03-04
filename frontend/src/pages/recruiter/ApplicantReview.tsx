import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import FilterBar from '../../components/FilterBar/FilterBar';
import KanbanBoard from '../../components/Kanban/KanbanBoard';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import { Filter } from 'lucide-react';
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
                            { label: 'Submitted', value: 'SUBMITTED' },
                            { label: 'Reviewed', value: 'REVIEWED' },
                            { label: 'Shortlisted', value: 'SHORTLISTED' },
                            { label: 'Selected', value: 'SELECTED' },
                            { label: 'Rejected', value: 'REJECTED' },
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
                    <KanbanBoard
                        applications={filtered}
                        onStatusChange={(appId, newStatus) => statusMutation.mutate({ appId, newStatus })}
                    />
                )}
            </div>
        </div>
    );
};

export default ApplicantReview;
