import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { ShieldCheck, Users, Building, CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import StudentProfileDrawer from '../../components/ProfileViewer/StudentProfileDrawer';
import CompanyDetailsDrawer from '../../components/CompanyDetailsDrawer/CompanyDetailsDrawer';

const AdminApprovals = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'STUDENT' | 'RECRUITER'>('RECRUITER');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Approval/Rejection Mutation with Optimistic Updates
    const approvalMutation = useMutation({
        mutationFn: async ({ id, role, action }: { id: string, role: string, action: string }) => {
            const status = action === 'approve' ? 'APPROVED' : 'BLOCKED';
            return await api.put('/admin/users/status', {
                id,
                role,
                status
            });
        },
        onMutate: async (variables) => {
            const queryKey = variables.role === 'STUDENT' ? ['adminPendingStudents'] : ['adminPendingRecruiters'];

            // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey });

            // 2. Snapshot the previous value
            const previousUsers = queryClient.getQueryData<any[]>(queryKey);

            // 3. Optimistically update the cache by removing the user we are approving/rejecting
            queryClient.setQueryData<any[]>(queryKey, (old) => {
                if (!old) return [];
                return old.filter(u => u._id !== variables.id);
            });

            // Return the contextual snapshot for potential rollback
            return { previousUsers, queryKey };
        },
        onSuccess: (_, variables) => {
            const roleName = variables.role === 'STUDENT' ? 'Student' : 'Recruiter';
            // We only show success toast, the UI already updated instantly!
            addToast(`${roleName} ${variables.action}d successfully.`, 'success');
        },
        onError: (_, variables, context) => {
            const roleName = variables.role === 'STUDENT' ? 'Student' : 'Recruiter';
            addToast(`Failed to ${variables.action} ${roleName.toLowerCase()}. Rolling back.`, 'error');

            // 4. Rollback to the previous snapshot if the network request failed
            if (context?.previousUsers) {
                queryClient.setQueryData(context.queryKey, context.previousUsers);
            }
        },
        onSettled: (_, __, variables) => {
            // 5. Always refetch in the background after error or success to ensure server sync
            const queryKey = variables.role === 'STUDENT' ? ['adminPendingStudents'] : ['adminPendingRecruiters'];
            queryClient.invalidateQueries({ queryKey });
            if (variables.role === 'RECRUITER') {
                queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            }
        }
    });

    const handleAction = (id: string, role: string, action: string) => {
        approvalMutation.mutate({ id, role, action });
        if (selectedUser?._id === id) {
            setIsDrawerOpen(false);
            setSelectedUser(null);
        }
    };

    const handleViewProfile = (user: any) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
    };

    const currentList = activeTab === 'STUDENT' ? pendingStudents : pendingRecruiters;
    
    // Search Filtering
    const filteredList = currentList.filter((user: any) => {
        const searchStr = searchTerm.toLowerCase();
        if (activeTab === 'STUDENT') {
            return user.name?.toLowerCase().includes(searchStr) || user.email?.toLowerCase().includes(searchStr);
        } else {
            return user.company_name?.toLowerCase().includes(searchStr) || user.email?.toLowerCase().includes(searchStr);
        }
    });

    // We only show full loading skeleton if there is literally NO data. 
    // This allows the optimistic UI to prevent flashing skeletons.
    const isLoading = (activeTab === 'STUDENT' ? isStudentsLoading : isRecruitersLoading) && currentList.length === 0;

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white m-0 leading-tight">Verification Queue</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0 mt-1">Vetting registrations before granting platform access.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Tabs */}
                <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit shrink-0">
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

                {/* Search & Filter Bar */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search pending ${activeTab.toLowerCase()}s...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <Card className="flex flex-col p-2 min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 w-full rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                        ))}
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[350px] text-center">
                        <Search size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">No Matches Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                            We couldn't find any pending {activeTab.toLowerCase()}s matching "{searchTerm}".
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-4">
                        {filteredList.map((user: any) => (
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
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        onClick={() => handleViewProfile(user)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <Eye size={18} /> View
                                    </button>
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

            {/* Profile Drawer Integration */}
            {activeTab === 'STUDENT' ? (
                <StudentProfileDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    applicant={selectedUser ? { 
                        _id: selectedUser._id,
                        student: selectedUser,
                        status: 'SUBMITTED', // Using SUBMITTED as it's a valid UIApplicant status
                        resume_url: selectedUser.resume_url
                    } : null}
                />
            ) : (
                <CompanyDetailsDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    recruiter={selectedUser}
                    onStatusChange={(id, status) => handleAction(id, 'RECRUITER', status ? 'approve' : 'reject')}
                    isUpdating={approvalMutation.isPending}
                />
            )}
        </div>
    );
};

export default AdminApprovals;
