import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import KanbanBoard from '../../components/Kanban/KanbanBoard';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import StudentProfileDrawer from '../../components/ProfileViewer/StudentProfileDrawer';
import { Filter, Search, CheckSquare, X, Download } from 'lucide-react';
import api from '../../services/api';
import { exportToCSV } from '../../utils/export';
import ComposeMessageModal, { MessageRecipient, TEMPLATES } from '../../components/Modal/ComposeMessageModal';
import ManagePipelineModal, { PipelineStage } from '../../components/Modal/ManagePipelineModal';
import CompareCandidatesModal from '../../components/Modal/CompareCandidatesModal';
import { Job, Application } from '../../types';
import ApplicantFilters from './components/ApplicantFilters';
import BulkActionsBar from './components/BulkActionsBar';
import { useMemo } from 'react';

interface UIApplicant extends Omit<Application, 'student' | 'job'> {
    student?: { _id: string; name: string; email: string; resume_url?: string; cgpa?: number; skills?: string[] };
    job?: { _id: string; title: string };
    matchScore?: number;
    createdAt?: string;
}

const ApplicantReview: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [selectedJob, setSelectedJob] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [minMatchScore, setMinMatchScore] = useState<number>(0);
    const [selectedApplicant, setSelectedApplicant] = useState<UIApplicant | null>(null);
    const [selectedApplicantsForBulk, setSelectedApplicantsForBulk] = useState<string[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);

    // Messaging State
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageRecipients, setMessageRecipients] = useState<MessageRecipient[]>([]);
    const [emailDefaults, setEmailDefaults] = useState({ subject: '', body: '' });
    const [pendingStatusCache, setPendingStatusCache] = useState<{ appId?: string, appIds?: string[], status: string } | null>(null);

    // Comparison State
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    // Pipeline Customization State
    const DEFAULT_STAGES: PipelineStage[] = [
        { id: 'SUBMITTED', title: 'Submitted', isProtected: true },
        { id: 'REVIEWED', title: 'Reviewed', isProtected: true },
        { id: 'SHORTLISTED', title: 'Shortlisted', isProtected: true },
        { id: 'SELECTED', title: 'Selected' },
        { id: 'REJECTED', title: 'Rejected', isProtected: true }
    ];
    const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(DEFAULT_STAGES);
    const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

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
        onMutate: async ({ appId, newStatus }) => {
            await queryClient.cancelQueries({ queryKey: ['recruiterApplications'] });
            const previousApps = queryClient.getQueryData(['recruiterApplications']);
            queryClient.setQueryData(['recruiterApplications'], (old: any) => {
                if (!old) return old;
                return old.map((app: any) => app._id === appId ? { ...app, status: newStatus } : app);
            });
            return { previousApps };
        },
        onSuccess: (_, { newStatus }) => {
            addToast(`Application marked as ${newStatus}`, 'success');
        },
        onError: (error: any, _, context) => {
            if (context?.previousApps) {
                queryClient.setQueryData(['recruiterApplications'], context.previousApps);
            }
            addToast(error.response?.data?.message || 'Failed to update status', 'error');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
        }
    });

    // ── Mutation: bulk update applications status ───────────────────────────
    const bulkStatusMutation = useMutation({
        mutationFn: ({ appIds, newStatus }: { appIds: string[]; newStatus: string }) =>
            Promise.all(appIds.map((id) => api.put(`/applications/${id}/status`, { status: newStatus }))),
        onMutate: async ({ appIds, newStatus }) => {
            await queryClient.cancelQueries({ queryKey: ['recruiterApplications'] });
            const previousApps = queryClient.getQueryData(['recruiterApplications']);
            queryClient.setQueryData(['recruiterApplications'], (old: any) => {
                if (!old) return old;
                return old.map((app: any) => appIds.includes(app._id) ? { ...app, status: newStatus } : app);
            });
            return { previousApps };
        },
        onSuccess: (_, { newStatus, appIds }) => {
            addToast(`Successfully moved ${appIds.length} candidate(s) to ${newStatus}`, 'success');
            setSelectedApplicantsForBulk([]);
            setIsBulkMode(false);
        },
        onError: (_error: any, _, context) => {
            if (context?.previousApps) {
                queryClient.setQueryData(['recruiterApplications'], context.previousApps);
            }
            addToast('Failed to perform bulk action update', 'error');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
        }
    });

    // Request Email wrapper for drag and drop
    const handleStatusChangeRequest = (appId: string, newStatus: string) => {
        if (newStatus === 'REJECTED' || newStatus === 'SHORTLISTED') {
            const app = applications.find(a => a._id === appId);
            if (app) {
                setPendingStatusCache({ appId, status: newStatus });
                setMessageRecipients([{ _id: app._id, student: app.student, job: app.job }]);

                // Pre-fill template based on status
                const template = TEMPLATES.find(t =>
                    newStatus === 'REJECTED' ? t.label.includes('Rejection') : t.label.includes('Shortlist')
                );
                if (template) {
                    const firstName = app.student?.name?.split(' ')[0] || 'there';
                    setEmailDefaults({
                        subject: template.subject,
                        body: template.body.replace(/{{candidate_name}}/g, firstName)
                    });
                } else {
                    setEmailDefaults({ subject: '', body: '' });
                }

                setIsMessageModalOpen(true);
            }
        } else {
            statusMutation.mutate({ appId, newStatus });
        }
    };

    // Request Email wrapper for bulk actions
    const handleBulkActionRequest = (newStatus: string | 'SEND_MESSAGE' | 'COMPARE') => {
        if (selectedApplicantsForBulk.length === 0) {
            addToast('Please select at least one candidate first', 'error');
            return;
        }

        const selectedApps = applications.filter(a => selectedApplicantsForBulk.includes(a._id));

        if (newStatus === 'COMPARE') {
            if (selectedApplicantsForBulk.length < 2 || selectedApplicantsForBulk.length > 4) {
                addToast('Please select 2 to 4 candidates to compare', 'info');
                return;
            }
            setIsCompareModalOpen(true);
            return;
        }

        if (newStatus === 'SEND_MESSAGE') {
            setPendingStatusCache(null); // No status change, just messaging
            setMessageRecipients(selectedApps.map(a => ({ _id: a._id, student: a.student, job: a.job })));
            setEmailDefaults({ subject: '', body: '' });
            setIsMessageModalOpen(true);
            return;
        }

        if (newStatus === 'REJECTED' || newStatus === 'SHORTLISTED') {
            setPendingStatusCache({ appIds: selectedApplicantsForBulk, status: newStatus });
            setMessageRecipients(selectedApps.map(a => ({ _id: a._id, student: a.student, job: a.job })));

            // Pre-fill generic template
            const template = TEMPLATES.find(t =>
                newStatus === 'REJECTED' ? t.label.includes('Rejection') : t.label.includes('Shortlist')
            );
            setEmailDefaults(template ? { subject: template.subject, body: template.body.replace(/{{candidate_name}}/g, 'there') } : { subject: '', body: '' });

            setIsMessageModalOpen(true);
        } else {
            bulkStatusMutation.mutate({ appIds: selectedApplicantsForBulk, newStatus });
        }
    };

    const confirmPendingStatusAndCloseMsg = () => {
        if (pendingStatusCache?.appId) {
            statusMutation.mutate({ appId: pendingStatusCache.appId, newStatus: pendingStatusCache.status });
        } else if (pendingStatusCache?.appIds) {
            bulkStatusMutation.mutate({ appIds: pendingStatusCache.appIds, newStatus: pendingStatusCache.status });
        }
        setIsMessageModalOpen(false);
        setPendingStatusCache(null);
    };

    // ── Derived: filtered + sorted list ─────────────────────────────────────
    const filtered = useMemo(() => {
        return applications
            .filter((app) => {
                const matchJob = selectedJob === 'ALL' || app.job?._id === selectedJob;
                const matchScoreCheck = (app.matchScore ?? 0) >= minMatchScore;

                const q = searchTerm.toLowerCase();
                const matchSearch =
                    app.student?.name?.toLowerCase().includes(q) ||
                    app.job?.title?.toLowerCase().includes(q) ||
                    app.student?.email?.toLowerCase().includes(q);

                return matchJob && matchScoreCheck && matchSearch;
            })
            .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    }, [applications, selectedJob, minMatchScore, searchTerm]);

    const toggleApplicantSelection = (appId: string) => {
        setSelectedApplicantsForBulk(prev =>
            prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
        );
    };

    const handleExportCSV = () => {
        const toExport = isBulkMode && selectedApplicantsForBulk.length > 0
            ? filtered.filter(app => selectedApplicantsForBulk.includes(app._id))
            : filtered;

        if (toExport.length === 0) {
            addToast('No candidates to export.', 'error');
            return;
        }

        // Map domain objects to raw CSV rows
        const csvData = toExport.map(app => ({
            'Candidate Name': app.student?.name || 'Unknown',
            'Email': app.student?.email || 'N/A',
            'Job Title': app.job?.title || 'General',
            'Status': app.status,
            'Match Score (%)': app.matchScore ?? 0,
            'CGPA': app.student?.cgpa || 'N/A',
            'Skills': app.student?.skills?.join(' | ') || 'N/A',
            'Applied Date': app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'
        }));

        const filename = `candidates_export_${new Date().toISOString().split('T')[0]}`;
        exportToCSV(csvData, filename);
        addToast(`Exported ${toExport.length} candidates`, 'success');
    };

    return (
        <>
            <div className="flex flex-col gap-6 animate-fade-in relative">
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-700 mb-1">Applicant Review Board</h1>
                        <p className="text-slate-500 text-base m-0">Evaluate candidates and manage application pipelines.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="secondary"
                            icon={Download}
                            onClick={handleExportCSV}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant={isBulkMode ? "secondary" : "ghost"}
                            icon={isBulkMode ? X : CheckSquare}
                            onClick={() => {
                                setIsBulkMode(!isBulkMode);
                                if (isBulkMode) setSelectedApplicantsForBulk([]);
                            }}
                        >
                            {isBulkMode ? "Cancel Bulk Edit" : "Bulk Actions"}
                        </Button>
                    </div>
                </div>

                <BulkActionsBar 
                    selectedCount={selectedApplicantsForBulk.length}
                    onAction={handleBulkActionRequest}
                />

                <ApplicantFilters 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedJob={selectedJob}
                    setSelectedJob={setSelectedJob}
                    minMatchScore={minMatchScore}
                    setMinMatchScore={setMinMatchScore}
                    jobs={jobs}
                    isBulkMode={isBulkMode}
                    setIsBulkMode={setIsBulkMode}
                    onOpenPipelineModal={() => setIsPipelineModalOpen(true)}
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
                        <div className={isBulkMode ? 'pl-8 relative' : ''}>
                            {isBulkMode && (
                                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center pt-14 z-10 space-y-[132px]">
                                    {/* Abstract representation to show selection boxes would normally be inside the cards, 
                                        but modifying Kanban card is needed. For simplicity, we can pass properties down to KanbanBoard. */}
                                </div>
                            )}
                            <KanbanBoard
                                applications={filtered}
                                columns={pipelineStages}
                                onStatusChange={handleStatusChangeRequest}
                                onViewProfile={setSelectedApplicant}
                                isBulkMode={isBulkMode}
                                selectedAppIds={selectedApplicantsForBulk}
                                onToggleAppSelection={toggleApplicantSelection}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Slide-over Profile Viewer */}
            <StudentProfileDrawer
                isOpen={!!selectedApplicant}
                onClose={() => setSelectedApplicant(null)}
                applicant={selectedApplicant}
            />

            {/* In-app messaging interceptor */}
            <ComposeMessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                onSkip={confirmPendingStatusAndCloseMsg}
                recipients={messageRecipients}
                requireAction={!!pendingStatusCache}
                defaultSubject={emailDefaults.subject}
                defaultBody={emailDefaults.body}
            />

            {/* Candidate Comparison Modal */}
            <CompareCandidatesModal
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                applicants={applications.filter(a => selectedApplicantsForBulk.includes(a._id))}
            />

            {/* Pipeline Customization Modal */}
            <ManagePipelineModal
                isOpen={isPipelineModalOpen}
                onClose={() => setIsPipelineModalOpen(false)}
                stages={pipelineStages}
                onSave={setPipelineStages}
            />
        </>
    );
};

export default ApplicantReview;
