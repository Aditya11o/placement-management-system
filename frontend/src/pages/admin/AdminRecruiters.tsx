import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import DataTable, { Column } from '../../components/DataTable/DataTable';
import FilterBar from '../../components/FilterBar/FilterBar';
import CompanyDetailsDrawer from '../../components/CompanyDetailsDrawer/CompanyDetailsDrawer';
import BulkActionBar from '../../components/BulkActionBar/BulkActionBar';
import ExportReportsModal from '../../components/ExportReportsModal/ExportReportsModal';

const AdminRecruiters = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const [searchParams] = useSearchParams();
    const recruiterIdFromUrl = searchParams.get('id');
    const [selectedRecruiter, setSelectedRecruiter] = useState<any | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [verificationFilter, setVerificationFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
    const [isExportJustifyOpen, setIsExportJustifyOpen] = useState(false);
    const limit = 20;

    // Reset to page 1 when filters change
    const handleSearchChange = (val: string) => { setSearchTerm(val); setPage(1); };
    const handleStatusChange = (val: string) => { setStatusFilter(val); setPage(1); };
    const handleVerificationChange = (val: string) => { setVerificationFilter(val); setPage(1); };

    const { data: queryData, isLoading } = useQuery({
        queryKey: ['adminRecruiters', page, statusFilter, verificationFilter, searchTerm],
        queryFn: async () => {
            const params = new URLSearchParams({
                role: 'RECRUITER',
                page: page.toString(),
                limit: limit.toString()
            });

            if (statusFilter === 'ACTIVE') params.append('status', 'APPROVED');
            if (statusFilter === 'INACTIVE') params.append('status', 'BLOCKED');
            if (verificationFilter === 'VERIFIED') params.append('status', 'APPROVED');
            if (verificationFilter === 'PENDING') params.append('status', 'PENDING');

            const res = await api.get(`/admin/users?${params.toString()}`);
            return res.data;
        }
    });


    const recruiters = queryData?.data || [];
    const totalPages = queryData?.total ? Math.ceil(queryData.total / limit) : 1;

    // Auto-open drawer if ID is in URL
    useEffect(() => {
        if (recruiterIdFromUrl && recruiters.length > 0 && !selectedRecruiter) {
            const recruiter = recruiters.find((r: any) => r._id === recruiterIdFromUrl);
            if (recruiter) setSelectedRecruiter(recruiter);
        }
    }, [recruiterIdFromUrl, recruiters, selectedRecruiter]);

    // Real-time synchronization
    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (data: any) => {
            if (data.role === 'RECRUITER') {
                queryClient.invalidateQueries({ queryKey: ['adminRecruiters'] });
                queryClient.invalidateQueries({ queryKey: ['adminPendingRecruiters'] });
                addToast(`Live Update: ${data.name || 'A company'}'s status was updated by another admin.`, 'info');
            }
        };

        socket.on('admin:status_update', handleStatusUpdate);
        return () => {
            socket.off('admin:status_update', handleStatusUpdate);
        };
    }, [socket, queryClient, addToast]);

    const statusMutation = useMutation({
        mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: boolean }) =>
            api.put('/admin/users/status', { id: userId, role: 'RECRUITER', status: newStatus ? 'APPROVED' : 'BLOCKED' }),
        onSuccess: (_, { newStatus }) => {
            addToast(`Recruiter account ${newStatus ? 'activated' : 'deactivated'}`, 'success');
            queryClient.invalidateQueries({ queryKey: ['adminRecruiters'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            queryClient.invalidateQueries({ queryKey: ['adminPendingRecruiters'] });
            if (selectedRecruiter) {
                setSelectedRecruiter({ ...selectedRecruiter, status: newStatus ? 'APPROVED' : 'BLOCKED' });
            }
        },
        onError: () => addToast('Failed to change account status', 'error'),
    });

    const bulkMutation = useMutation({
        mutationFn: async ({ userIds, newStatus }: { userIds: string[]; newStatus: boolean }) => {
            const status = newStatus ? 'APPROVED' : 'BLOCKED';
            const promises = userIds.map(id => api.put('/admin/users/status', { id, role: 'RECRUITER', status }));
            return await Promise.all(promises);
        },
        onSuccess: (_, { newStatus, userIds }) => {
            addToast(`${userIds.length} recruiters ${newStatus ? 'approved' : 'blocked'}`, 'success');
            queryClient.invalidateQueries({ queryKey: ['adminRecruiters'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            queryClient.invalidateQueries({ queryKey: ['adminPendingRecruiters'] });
            setSelectedKeys([]);
        },
        onError: () => addToast('Failed to process bulk action', 'error'),
    });

    const exportMutation = useMutation({
        mutationFn: async ({ type, justification, userIds }: { type: 'students' | 'applications' | 'recruiters', justification: string, userIds?: string[] }) => {
            const res = await api.post('/admin/export', { type, justification, userIds });
            return res.data;
        },
        onSuccess: (data) => {
            addToast(data.message || 'Export queued successfully. You will receive an email shortly.', 'success');
            setIsExportJustifyOpen(false);
            setSelectedKeys([]); // Clear selection after export
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Failed to generate export report.', 'error');
        }
    });

    const verificationMutation = useMutation({
        mutationFn: async ({ recId, isVerified }: { recId: string; isVerified: boolean }) =>
            api.put('/admin/users/status', { id: recId, role: 'RECRUITER', status: isVerified ? 'APPROVED' : 'BLOCKED' }),
        onSuccess: (_, { isVerified }) => {
            addToast(`Company marked as ${isVerified ? 'verified' : 'unverified'}`, 'success');
            queryClient.invalidateQueries({ queryKey: ['adminRecruiters'] });
        },
        onError: () => addToast('Failed to update verification status', 'error'),
    });

    const filteredRecruiters = recruiters.filter((rec: any) => {
        const s = searchTerm.toLowerCase();
        const matchSearch =
            rec.contact_person?.toLowerCase().includes(s) ||
            rec.email?.toLowerCase().includes(s) ||
            rec.company_name?.toLowerCase().includes(s);
        const matchStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && rec.status === 'APPROVED') ||
            (statusFilter === 'INACTIVE' && rec.status === 'BLOCKED');
        const matchVerification =
            verificationFilter === 'ALL' ||
            (verificationFilter === 'VERIFIED' && rec.status === 'APPROVED') ||
            (verificationFilter === 'PENDING' && rec.status === 'PENDING');
        return matchSearch && matchStatus && matchVerification;
    });

    const columns: Column<any>[] = [
        {
            header: 'Recruiter Name',
            accessor: 'contact_person',
            cell: (rec) => (
                <div className="flex flex-col">
                    <strong className="text-slate-800 dark:text-slate-100 text-[15px] font-semibold mb-0.5">{rec.contact_person}</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{rec.email}</span>
                </div>
            ),
        },
        {
            header: 'Company',
            cell: (rec) => (
                <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[13px] font-medium border border-slate-200 dark:border-slate-700/50">
                    {rec.company_name || 'N/A'}
                </span>
            ),
        },
        {
            header: 'Registration',
            cell: (rec) => (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(rec.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: 'Verification',
            cell: (rec: any) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    rec.status === 'APPROVED' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : rec.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                }`}>
                    {rec.status}
                </span>
            ),
        },
        {
            header: 'System Access',
            cell: (rec: any) => (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    rec.status === 'APPROVED' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-slate-400'
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${rec.status === 'APPROVED' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    {rec.status === 'APPROVED' ? 'Active' : 'Restricted'}
                </span>
            ),
        },
        {
            header: 'Actions',
            cell: (rec) => (
                <div className="flex gap-2 flex-wrap">
                    {rec.status === 'APPROVED' ? (
                        <button
                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 disabled:opacity-50 transition-all"
                            onClick={() => statusMutation.mutate({ userId: rec._id, newStatus: false })}
                            disabled={statusMutation.isPending}
                        >
                            Block
                        </button>
                    ) : (
                        <button
                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-50 transition-all"
                            onClick={() => statusMutation.mutate({ userId: rec._id, newStatus: true })}
                            disabled={statusMutation.isPending}
                        >
                            Approve
                        </button>
                    )}
                    {rec.status === 'PENDING' && (
                        <button
                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border bg-green-600 border-green-600 text-white hover:bg-green-700 ml-2 disabled:opacity-50 transition-all"
                            onClick={() => verificationMutation.mutate({ recId: rec._id, isVerified: true })}
                            disabled={verificationMutation.isPending}
                        >
                            Verify
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Company Directory</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base m-0">Manage recruiter accounts and business verifications.</p>
            </div>


            <FilterBar
                searchPlaceholder="Search loaded recruiters..."
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                filters={[
                    {
                        value: verificationFilter,
                        onChange: handleVerificationChange,
                        showIcon: true,
                        options: [
                            { label: 'All Approvals', value: 'ALL' },
                            { label: 'Verified', value: 'VERIFIED' },
                            { label: 'Pending Approval', value: 'PENDING' },
                        ],
                    },
                    {
                        value: statusFilter,
                        onChange: handleStatusChange,
                        options: [
                            { label: 'All Statuses', value: 'ALL' },
                            { label: 'Active (Can Login)', value: 'ACTIVE' },
                            { label: 'Inactive (Locked)', value: 'INACTIVE' },
                        ],
                    },
                ]}
            />

            <DataTable
                selectable
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                columns={columns}
                data={filteredRecruiters}
                isLoading={isLoading}
                emptyMessage="No recruiters found matching current filters."
                skeletonCols={6}
                skeletonRows={limit}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                onRowClick={(rec) => setSelectedRecruiter(rec)}
            />

            <CompanyDetailsDrawer
                isOpen={!!selectedRecruiter}
                onClose={() => setSelectedRecruiter(null)}
                recruiter={selectedRecruiter}
                onStatusChange={(id, newStatus) => statusMutation.mutate({ userId: id, newStatus })}
                isUpdating={statusMutation.isPending}
            />

            <BulkActionBar
                selectedCount={selectedKeys.length}
                itemName="Companies"
                onClearSelection={() => setSelectedKeys([])}
                onApprove={() => bulkMutation.mutate({ userIds: selectedKeys as string[], newStatus: true })}
                onReject={() => bulkMutation.mutate({ userIds: selectedKeys as string[], newStatus: false })}
                onExport={() => setIsExportJustifyOpen(true)}
                isProcessing={bulkMutation.isPending || exportMutation.isPending}
            />

            <ExportReportsModal
                isOpen={isExportJustifyOpen}
                onClose={() => setIsExportJustifyOpen(false)}
                isExporting={exportMutation.isPending}
                onExport={(type: 'students' | 'applications' | 'recruiters', justification: string) => 
                    exportMutation.mutate({ type, justification, userIds: selectedKeys as string[] })}
            />
        </div>
    );
};

export default AdminRecruiters;
