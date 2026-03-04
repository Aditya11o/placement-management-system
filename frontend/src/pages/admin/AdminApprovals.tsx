import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { ShieldCheck, ShieldAlert, Users, Building, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';

const AdminApprovals = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'STUDENT' | 'RECRUITER'>('RECRUITER');

    // Fetch Pending Students
    const { data: pendingStudents = [], isLoading: isStudentsLoading } = useQuery({
        queryKey: ['adminPendingStudents'],
        queryFn: async () => {
            const res = await api.get('/admin/users?role=STUDENT&status=PENDING');
            return res.data?.data || [];
        }
    });

    // Fetch Pending Recruiters
    const { data: pendingRecruiters = [], isLoading: isRecruitersLoading } = useQuery({
        queryKey: ['adminPendingRecruiters'],
        queryFn: async () => {
            const res = await api.get('/admin/users?role=RECRUITER&status=PENDING');
            return res.data?.data || [];
        }
    });

    // Approval/Rejection Mutation
    const approvalMutation = useMutation({
        mutationFn: async ({ id, role, action }: { id: string, role: string, action: string }) => {
            const status = action === 'approve' ? 'APPROVED' : 'BLOCKED';
            return await api.put('/admin/users/status', {
                id,
                role,
                status
            });
        },
        onSuccess: (_, variables) => {
            const roleName = variables.role === 'STUDENT' ? 'Student' : 'Recruiter';
            addToast(`${roleName} ${variables.action}d successfully.`, 'success');

            // Invalidate respective queries
            if (variables.role === 'STUDENT') {
                queryClient.invalidateQueries({ queryKey: ['adminPendingStudents'] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['adminPendingRecruiters'] });
                queryClient.invalidateQueries({ queryKey: ['adminStats'] }); // Dashboard sync
            }
        },
        onError: (_, variables) => {
            const roleName = variables.role === 'STUDENT' ? 'Student' : 'Recruiter';
            addToast(`Failed to ${variables.action} ${roleName.toLowerCase()}.`, 'error');
        }
    });

    const handleAction = (id: string, role: string, action: string) => {
        approvalMutation.mutate({ id, role, action });
    };

    const currentList = activeTab === 'STUDENT' ? pendingStudents : pendingRecruiters;
    const isLoading = activeTab === 'STUDENT' ? isStudentsLoading : isRecruitersLoading;

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white m-0 leading-tight">Approval Center</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0 mt-1">Review and manage pending account registrations.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('RECRUITER')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'RECRUITER'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    <Building size={18} />
                    Companies ({pendingRecruiters.length})
                </button>
                <button
                    onClick={() => setActiveTab('STUDENT')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'STUDENT'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    <Users size={18} />
                    Students ({pendingStudents.length})
                </button>
            </div>

            {/* List */}
            <Card className="flex flex-col p-2 min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 w-full rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                        ))}
                    </div>
                ) : currentList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[350px] text-center">
                        <ShieldAlert size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">All Caught Up!</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                            There are no pending {activeTab.toLowerCase()} registrations requiring your attention at this time.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-4">
                        {currentList.map((user: any) => (
                            <div key={user._id} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl gap-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                                        {activeTab === 'STUDENT' ? user.name?.charAt(0) : user.company_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-0.5 truncate">
                                            {activeTab === 'STUDENT' ? user.name : user.company_name}
                                        </h4>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="truncate">{user.email}</span>
                                            {activeTab === 'RECRUITER' && (
                                                <>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="truncate">{user.contact_person}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg font-semibold hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                        onClick={() => handleAction(user._id, activeTab, 'approve')}
                                        disabled={approvalMutation.isPending}
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                    <button
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                        onClick={() => handleAction(user._id, activeTab, 'reject')}
                                        disabled={approvalMutation.isPending}
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminApprovals;
