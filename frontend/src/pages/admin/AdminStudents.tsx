import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import { Shield, Ban } from 'lucide-react';
import api from '../../services/api';
import DataTable, { Column } from '../../components/DataTable/DataTable';
import FilterBar from '../../components/FilterBar/FilterBar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StudentProfileDrawer from '../../components/ProfileViewer/StudentProfileDrawer';
import BulkActionBar from '../../components/BulkActionBar/BulkActionBar';

const AdminStudents = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [branchFilter, setBranchFilter] = useState('ALL');
    const [minCgpaFilter, setMinCgpaFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
    const limit = 20;

    // Reset to page 1 when filters change
    const handleSearchChange = (val: string) => { setSearchTerm(val); setPage(1); };
    const handleStatusChange = (val: string) => { setStatusFilter(val); setPage(1); };
    const handleBranchChange = (val: string) => { setBranchFilter(val); setPage(1); };
    const handleCgpaChange = (val: string) => { setMinCgpaFilter(val); setPage(1); };

    const { data: queryData, isLoading } = useQuery({
        queryKey: ['adminStudents', page, statusFilter, branchFilter, searchTerm],
        queryFn: async () => {
            // Build query params
            const params = new URLSearchParams({
                role: 'STUDENT',
                page: page.toString(),
                limit: limit.toString()
            });

            if (statusFilter === 'ACTIVE') params.append('status', 'APPROVED');
            if (statusFilter === 'INACTIVE') params.append('status', 'BLOCKED');
            if (branchFilter !== 'ALL') params.append('studentProfile.branch', branchFilter);

            // Wait to add search, since standard advancedResults doesn't have native text search.
            // For now, if there's a search term, we'd normally pass it to a backend search route.
            // To keep things simple without touching backend search logic, we'll fetch filtered data.

            const res = await api.get(`/admin/users?${params.toString()}`);
            return res.data;
        }
    });

    const students = queryData?.data || [];
    const totalPages = queryData?.total ? Math.ceil(queryData.total / limit) : 1;

    // In a real prod environment, search term should also be pushed to the backend `?name[regex]=term`
    // using MongoDB regex filtering if supported by advancedResults. For now, we apply local filtering
    // to whatever page is returned.

    const uniqueBranches = [...new Set<string>(students.map((s: any) => s.studentProfile?.branch).filter((b: unknown): b is string => typeof b === 'string'))];

    const statusMutation = useMutation({
        mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: boolean }) =>
            api.put('/admin/users/status', { id: userId, role: 'STUDENT', status: newStatus ? 'APPROVED' : 'BLOCKED' }),
        onSuccess: (_, { newStatus }) => {
            addToast(`Student account ${newStatus ? 'activated' : 'deactivated'}`, 'success');
            queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
            if (selectedStudent) {
                setSelectedStudent({ ...selectedStudent, status: newStatus ? 'APPROVED' : 'BLOCKED' });
            }
        },
        onError: () => addToast('Failed to change account status', 'error'),
    });

    const bulkMutation = useMutation({
        mutationFn: async ({ userIds, newStatus }: { userIds: string[]; newStatus: boolean }) => {
            const status = newStatus ? 'APPROVED' : 'BLOCKED';
            const promises = userIds.map(id => api.put('/admin/users/status', { id, role: 'STUDENT', status }));
            return await Promise.all(promises);
        },
        onSuccess: (_, { newStatus, userIds }) => {
            addToast(`${userIds.length} students ${newStatus ? 'approved' : 'blocked'}`, 'success');
            queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
            setSelectedKeys([]);
        },
        onError: () => addToast('Failed to process bulk action', 'error'),
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
        const matchCgpa = minCgpaFilter === 'ALL' || (student.studentProfile?.cgpa || 0) >= parseFloat(minCgpaFilter);
        return matchSearch && matchStatus && matchBranch && matchCgpa;
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
                searchPlaceholder="Search loaded students..."
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                filters={[
                    {
                        value: branchFilter,
                        onChange: handleBranchChange,
                        showIcon: true,
                        options: [
                            { label: 'All Branches', value: 'ALL' },
                            ...uniqueBranches.map((b) => ({ label: b, value: b })),
                        ],
                    },
                    {
                        value: minCgpaFilter,
                        onChange: handleCgpaChange,
                        options: [
                            { label: 'Any CGPA', value: 'ALL' },
                            { label: '≥ 9.0', value: '9.0' },
                            { label: '≥ 8.0', value: '8.0' },
                            { label: '≥ 7.0', value: '7.0' },
                            { label: '≥ 6.0', value: '6.0' },
                        ],
                    },
                    {
                        value: statusFilter,
                        onChange: handleStatusChange,
                        options: [
                            { label: 'All Statuses', value: 'ALL' },
                            { label: 'Active', value: 'ACTIVE' },
                            { label: 'Inactive', value: 'INACTIVE' },
                        ],
                    },
                ]}
            />

            <DataTable
                selectable
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                columns={columns}
                data={filteredStudents}
                isLoading={isLoading}
                emptyMessage="No students found matching current filters."
                skeletonCols={5}
                skeletonRows={limit}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                onRowClick={(s) => setSelectedStudent(s)}
            />

            <StudentProfileDrawer
                isOpen={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                applicant={selectedStudent ? {
                    _id: selectedStudent._id,
                    job: 'admin-view',
                    student: {
                        _id: selectedStudent._id,
                        name: selectedStudent.name,
                        email: selectedStudent.email,
                        phone: selectedStudent.phone,
                        branch: selectedStudent.studentProfile?.branch,
                        cgpa: selectedStudent.studentProfile?.cgpa,
                        graduation_year: selectedStudent.studentProfile?.graduation_year,
                        skills: selectedStudent.studentProfile?.skills || [],
                        resume_url: selectedStudent.studentProfile?.resume_url,
                        profile_image_url: selectedStudent.profile_image_url,
                        marks_10th: selectedStudent.studentProfile?.marks_10th,
                        marks_12th: selectedStudent.studentProfile?.marks_12th,
                        backlogs_active: selectedStudent.studentProfile?.backlogs_active,
                    },
                    status: 'PENDING',
                    resume_url: selectedStudent.studentProfile?.resume_url,
                    matchScore: 0 // Not relevant for admin view
                } : null}
            />

            <BulkActionBar
                selectedCount={selectedKeys.length}
                onClearSelection={() => setSelectedKeys([])}
                onApprove={() => bulkMutation.mutate({ userIds: selectedKeys as string[], newStatus: true })}
                onReject={() => bulkMutation.mutate({ userIds: selectedKeys as string[], newStatus: false })}
                isProcessing={bulkMutation.isPending}
            />
        </div>
    );
};

export default AdminStudents;
