import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import { Shield, Ban } from 'lucide-react';
import api from '../../services/api';
import DataTable, { Column } from '../../components/DataTable/DataTable';
import FilterBar from '../../components/FilterBar/FilterBar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';

const AdminStudents = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [branchFilter, setBranchFilter] = useState('ALL');

    const { data: students = [], isLoading } = useQuery({
        queryKey: ['adminStudents'],
        queryFn: async () => {
            const res = await api.get('/admin/users?role=STUDENT');
            return res.data?.data || [];
        }
    });

    const uniqueBranches = [...new Set<string>(students.map((s: any) => s.studentProfile?.branch).filter((b: unknown): b is string => typeof b === 'string'))];

    const statusMutation = useMutation({
        mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: boolean }) =>
            api.put('/admin/users/status', { id: userId, role: 'STUDENT', status: newStatus ? 'APPROVED' : 'BLOCKED' }),
        onSuccess: (_, { newStatus }) => {
            addToast(`Student account ${newStatus ? 'activated' : 'deactivated'}`, 'success');
            queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
        },
        onError: () => addToast('Failed to change account status', 'error'),
    });

    const filteredStudents = students.filter((student: any) => {
        const s = searchTerm.toLowerCase();
        const matchSearch =
            student.name?.toLowerCase().includes(s) ||
            student.email?.toLowerCase().includes(s) ||
            student.studentProfile?.branch?.toLowerCase().includes(s);
        const matchStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && student.status === 'APPROVED') ||
            (statusFilter === 'INACTIVE' && student.status === 'BLOCKED');
        const matchBranch = branchFilter === 'ALL' || student.studentProfile?.branch === branchFilter;
        return matchSearch && matchStatus && matchBranch;
    });

    const columns: Column<any>[] = [
        {
            header: 'Student Info',
            cell: (s) => (
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold shrink-0">
                        {s.name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex flex-col">
                        <strong className="text-slate-800 text-[15px] font-semibold mb-0.5">{s.name}</strong>
                        <span className="text-xs text-slate-500">{s.email}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Branch',
            cell: (s) => (
                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[13px] font-medium">
                    {s.studentProfile?.branch || 'N/A'}
                </span>
            ),
        },
        {
            header: 'CGPA',
            cell: (s) => <strong>{s.studentProfile?.cgpa || 'N/A'}</strong>,
        },
        {
            header: 'Status',
            cell: (s) => <StatusBadge status={s.status} />,
        },
        {
            header: 'Actions',
            cell: (s) => (
                <div className="flex gap-2">
                    {s.status === 'APPROVED' ? (
                        <button
                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-red-600 bg-white border-red-200 hover:bg-red-50 disabled:opacity-50 transition-all"
                            onClick={() => statusMutation.mutate({ userId: s._id, newStatus: false })}
                            disabled={statusMutation.isPending}
                        >
                            <Ban size={14} /> Block
                        </button>
                    ) : (
                        <button
                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-indigo-600 bg-white border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 transition-all"
                            onClick={() => statusMutation.mutate({ userId: s._id, newStatus: true })}
                            disabled={statusMutation.isPending}
                        >
                            <Shield size={14} /> Approve
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-indigo-700 mb-1">Student Directory</h1>
                <p className="text-slate-500 text-base m-0">Manage all registered students on the platform.</p>
            </div>

            <FilterBar
                searchPlaceholder="Search by name, email, or branch..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={[
                    {
                        value: branchFilter,
                        onChange: setBranchFilter,
                        showIcon: true,
                        options: [
                            { label: 'All Branches', value: 'ALL' },
                            ...uniqueBranches.map((b) => ({ label: b, value: b })),
                        ],
                    },
                    {
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { label: 'All Statuses', value: 'ALL' },
                            { label: 'Active', value: 'ACTIVE' },
                            { label: 'Inactive', value: 'INACTIVE' },
                        ],
                    },
                ]}
            />

            <DataTable
                columns={columns}
                data={filteredStudents}
                isLoading={isLoading}
                emptyMessage="No students found matching current filters."
                skeletonCols={5}
                skeletonRows={6}
            />
        </div>
    );
};

export default AdminStudents;
