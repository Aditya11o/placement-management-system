import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import { Shield, Ban, Zap } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import VirtualizedDataTable from '../../components/DataTable/VirtualizedDataTable';
import { Column } from '../../components/DataTable/DataTable';
import FilterBar from '../../components/FilterBar/FilterBar';
import StudentProfileDrawer from '../../components/ProfileViewer/StudentProfileDrawer';
import BulkActionBar from '../../components/BulkActionBar/BulkActionBar';
import BulkImportModal from '../../components/BulkImportModal/BulkImportModal';
import Button from '../../components/Button/Button';
import ExportReportsModal from '../../components/ExportReportsModal/ExportReportsModal';
import { UserPlus } from 'lucide-react';

const AdminStudents = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const [searchParams, setSearchParams] = useSearchParams();
    const studentIdFromUrl = searchParams.get('id');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [branchFilter, setBranchFilter] = useState('ALL');
    const [minCgpaFilter, setMinCgpaFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
    const [isExportJustifyOpen, setIsExportJustifyOpen] = useState(false);

    // Increased the page limit dramatically from 20 to 200 to demonstrate 
    // the massive performance gains of DOM Virtualization
    const limit = 200;

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

    // Synchronize drawer with URL parameter
    // We omit selectedStudent from dependencies to prevent re-opening loops 
    // when the drawer is manually closed (which triggers a re-render while the URL still has the ID)
    useEffect(() => {
        if (studentIdFromUrl && students.length > 0) {
            const student = students.find((s: any) => s._id === studentIdFromUrl);
            if (student) {
                setSelectedStudent((prev: any) => {
                    // Only update if it's a different student
                    if (prev?._id === student._id) return prev;
                    return { ...student, _openedFromUrl: true };
                });
            }
        } else if (!studentIdFromUrl) {
            // If the URL ID is removed, and we have a student open that was triggered from a URL, close it.
            setSelectedStudent((prev: any) => {
                if (prev?._openedFromUrl) return null;
                return prev;
            });
        }
    }, [studentIdFromUrl, students]);

    // Real-time synchronization for admin collaboration
    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (data: any) => {
            // Only invalidate if the update affects a student (which is what this page shows)
            if (data.role === 'STUDENT') {
                queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
                addToast(`Live Update: ${data.name || 'A student'}'s status was updated by another admin.`, 'info');
            }
        };

        socket.on('admin:status_update', handleStatusUpdate);
        return () => {
            socket.off('admin:status_update', handleStatusUpdate);
        };
    }, [socket, queryClient, addToast]);

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

    const nudgeMutation = useMutation({
        mutationFn: async ({ studentId, reason }: { studentId: string; reason: string }) =>
            api.post(`/students/${studentId}/nudge`, { reason }),
        onSuccess: () => {
            addToast('Nudge sent successfully!', 'success');
        },
        onError: (err: any) => addToast(err.response?.data?.message || 'Failed to send nudge', 'error'),
    });

    const bulkMutation = useMutation({
        mutationFn: async ({ userIds, newStatus }: { userIds: string[]; newStatus: boolean }) => {
            const status = newStatus ? 'APPROVED' : 'BLOCKED';
            return api.put('/admin/users/bulk-status', { ids: userIds, role: 'STUDENT', status });
        },
        onSuccess: (_, { newStatus, userIds }) => {
            addToast(`${userIds.length} students ${newStatus ? 'approved' : 'blocked'}`, 'success');
            queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
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
            accessor: 'name',
            cell: (s) => (
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold shrink-0">
                        {s.name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex flex-col">
                        <strong className="text-slate-800 dark:text-slate-100 text-[15px] font-semibold mb-0.5">{s.name}</strong>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{s.email}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Branch',
            cell: (s) => (
                <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[13px] font-medium border border-slate-200 dark:border-slate-700/50">
                    {s.studentProfile?.branch || 'N/A'}
                </span>
            ),
        },
        {
            header: 'CGPA',
            cell: (s) => <strong className="text-slate-700 dark:text-slate-300">{s.studentProfile?.cgpa || 'N/A'}</strong>,
        },
        {
            header: 'Status',
            cell: (s: any) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    s.status === 'APPROVED' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : s.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                }`}>
                    {s.status}
                </span>
            ),
        },
        {
            header: 'Actions',
            cell: (s) => (
                <div className="flex gap-2">
                    {s.status === 'APPROVED' ? (
                        <button
                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 disabled:opacity-50 transition-all"
                            onClick={() => statusMutation.mutate({ userId: s._id, newStatus: false })}
                            disabled={statusMutation.isPending}
                        >
                            <Ban size={14} /> Block
                        </button>
                    ) : (
                        <button
                            className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-50 transition-all"
                            onClick={() => statusMutation.mutate({ userId: s._id, newStatus: true })}
                            disabled={statusMutation.isPending}
                        >
                            <Shield size={14} /> Approve
                        </button>
                    )}
                    <button
                        className="inline-flex items-center gap-1 h-8 px-3 rounded text-[13px] font-semibold border text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 disabled:opacity-50 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            nudgeMutation.mutate({ studentId: s._id, reason: 'Improve placement readiness' });
                        }}
                        disabled={nudgeMutation.isPending}
                        title="Send manual nudge"
                    >
                        <Zap size={14} className="fill-amber-500/10" /> Nudge
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Student Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0">Manage all registered students on the platform.</p>
                </div>
                <Button
                    variant="primary"
                    icon={UserPlus}
                    onClick={() => setIsImportModalOpen(true)}
                    className="shadow-md shadow-indigo-500/20"
                >
                    Import Students (CSV)
                </Button>
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

            <VirtualizedDataTable
                selectable
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                columns={columns}
                data={filteredStudents}
                isLoading={isLoading}
                emptyMessage="No students found matching current filters."
                skeletonCols={5}
                skeletonRows={10} // Just show 10 skeletons while loading large chunks
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                onRowClick={(s) => setSelectedStudent(s)}
                maxHeight="500px" // Restrict height so it physically scrolls within the page
            />

            <StudentProfileDrawer
                isOpen={!!selectedStudent}
                onClose={() => {
                    setSelectedStudent(null); // Immediate closure for snappy UX
                    if (searchParams.has('id')) {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('id');
                        setSearchParams(newParams);
                    }
                }}
                applicant={selectedStudent ? {
                    _id: selectedStudent._id,
                    job: { _id: 'admin', title: 'Admin View' },
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
                    status: 'SUBMITTED',
                    resume_url: selectedStudent.studentProfile?.resume_url,
                    matchScore: 0,
                    createdAt: selectedStudent.created_at || new Date().toISOString()
                } : null}
            />

            <BulkActionBar
                selectedCount={selectedKeys.length}
                itemName="Students"
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

            <BulkImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['adminStudents'] })}
            />
        </div >
    );
};

export default AdminStudents;
