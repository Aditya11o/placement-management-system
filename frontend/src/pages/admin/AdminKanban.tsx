import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import FilterBar from '../../components/FilterBar/FilterBar';
import KanbanBoard from '../../components/Kanban/KanbanBoard';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import StudentProfileDrawer from '../../components/ProfileViewer/StudentProfileDrawer';
import { Filter } from 'lucide-react';
import api from '../../services/api';
import { Application } from '../../types';

// The UIApplicant interface matching what KanbanBoard expects
export interface UIApplicant extends Omit<Application, 'student' | 'job'> {
    student?: { name: string; email: string; resume_url?: string; branch?: string; profile_image_url?: string; };
    job?: { _id: string; title: string };
    matchScore?: number;
}

const AdminKanban: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [selectedBranch, setSelectedBranch] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApplicant, setSelectedApplicant] = useState<UIApplicant | null>(null);

    // ── Fetch all applications for Admin ──────────────────────────────────────
    const { data: applications = [], isLoading } = useQuery<UIApplicant[]>({
        queryKey: ['adminApplications'],
        queryFn: async () => {
            const res = await api.get('/admin/applications');
            return res.data.data ?? [];
        },
        enabled: !!user,
    });

    // ── Mutation: update application status ──────────────────────────────────
    const statusMutation = useMutation({
        mutationFn: ({ appId, newStatus }: { appId: string; newStatus: string }) =>
            api.put(`/admin/applications/${appId}/status`, { status: newStatus }),
        onSuccess: (_, { newStatus }) => {
            addToast(`Application moved to ${newStatus}`, 'success');
            // Refresh to ensure sync with server
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
        },
        onError: (error: any) => {
            addToast(error.response?.data?.message || 'Failed to update status', 'error');
            // Force redraw to revert optimistic update
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
        },
    });

    // ── Derived: filtered + sorted list ─────────────────────────────────────
    const filtered = applications
        .filter((app) => {
            const matchBranch = selectedBranch === 'ALL' || app.student?.branch === selectedBranch;
            const q = searchTerm.toLowerCase();
            const matchSearch =
                app.student?.name?.toLowerCase().includes(q) ||
                app.job?.title?.toLowerCase().includes(q) ||
                app.student?.email?.toLowerCase().includes(q);
            return matchBranch && matchSearch;
        });

    return (
        <>
            <div className="flex flex-col gap-6 animate-fade-in h-[calc(100vh-6rem)]">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">Placement Funnel Tracker</h1>
                    <p className="text-slate-500 text-base m-0">University-wide view of all student applications and interview stages.</p>
                </div>

                <FilterBar
                    searchPlaceholder="Search candidate or job title..."
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={[
                        {
                            value: selectedBranch,
                            onChange: setSelectedBranch,
                            options: [
                                { label: 'All Branches', value: 'ALL' },
                                { label: 'Computer Science', value: 'Computer Science' },
                                { label: 'Information Technology', value: 'Information Technology' },
                                { label: 'Electronics', value: 'Electronics' },
                                { label: 'Mechanical', value: 'Mechanical' },
                            ],
                        }
                    ]}
                />

                <div className="flex-1 min-h-0 relative">
                    {isLoading ? (
                        <Card className="h-full p-0">
                            <SkeletonTable rows={5} cols={5} />
                        </Card>
                    ) : filtered.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-12 text-center h-full">
                            <Filter size={48} className="text-slate-400 mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2 text-slate-700">No applications found</h3>
                            <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                        </Card>
                    ) : (
                        <KanbanBoard
                            applications={filtered}
                            onStatusChange={(appId, newStatus) => statusMutation.mutate({ appId, newStatus })}
                            onViewProfile={setSelectedApplicant}
                        />
                    )}
                </div>
            </div>

            {/* Slide-over Profile Viewer */}
            <StudentProfileDrawer
                isOpen={!!selectedApplicant}
                onClose={() => setSelectedApplicant(null)}
                applicant={selectedApplicant}
            />
        </>
    );
};

export default AdminKanban;
