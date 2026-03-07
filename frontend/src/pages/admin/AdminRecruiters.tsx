import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import DataTable, { Column } from '../../components/DataTable/DataTable';
import FilterBar from '../../components/FilterBar/FilterBar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import CompanyDetailsDrawer from '../../components/CompanyDetailsDrawer/CompanyDetailsDrawer';
import BulkActionBar from '../../components/BulkActionBar/BulkActionBar';

const AdminRecruiters = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [searchParams] = useSearchParams();
    const recruiterIdFromUrl = searchParams.get('id');
    const [selectedRecruiter, setSelectedRecruiter] = useState<any | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [verificationFilter, setVerificationFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
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
                    <strong className="text-slate-800 text-[15px] font-semibold mb-0.5">{rec.contact_person}</strong>
                    <span className="text-xs text-slate-500">{rec.email}</span>
                </div>
            ),
        },
        {
            header: 'Company',
            cell: (rec) => (
                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[13px] font-medium">
                    {rec.company_name || 'N/A'}
                </span>
            ),
        },
        {
            header: 'Registration',
            cell: (rec) => (
                <span className="text-sm text-slate-600">
                    {new Date(rec.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: 'Verification',
            cell: (rec) => <StatusBadge status={rec.status} variant="verification" />,
        },
        {
            header: 'System Access',
            cell: (rec) => (
                rec.status === 'APPROVED'
                    ? <StatusBadge status="APPROVED" label="Active" />
                    : <StatusBadge status="BLOCKED" label="Inactive" />
            ),
        },
        {
            header: 'Actions',
            cell: (rec) => (
                <div className="flex gap-2 flex-wrap">
                    {rec.status === 'APPROVED' ? (
                        <button
                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-red-600 bg-white border-red-200 hover:bg-red-50 disabled:opacity-50 transition-all"
                            onClick={() => statusMutation.mutate({ userId: rec._id, newStatus: false })}
                            disabled={statusMutation.isPending}
                        >
                            Block
                        </button>
                    ) : (
                        <button
                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-indigo-600 bg-white border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 transition-all"
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
                <h1 className="text-3xl font-bold text-indigo-700 mb-1">Company Directory</h1>
                <p className="text-slate-500 text-base m-0">Manage recruiter accounts and business verifications.</p>
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
                isProcessing={bulkMutation.isPending}
            />
        </div>
    );
};

export default AdminRecruiters;
