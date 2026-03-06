import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp, Crown, UserCog, User, Save, Loader2, Plus, X } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import { useToast } from '../../context/ToastContext';

// ── Shared Types ─────────────────────────────────────────────────────────────
interface AdminAccount {
    _id: string;
    name: string;
    email: string;
    sub_role: 'SUPER_ADMIN' | 'PLACEMENT_COORDINATOR' | 'ADMIN';
    permissions: string[];
    created_at: string;
}

interface PermissionManifest {
    allPermissions: string[];
    subRoles: string[];
}

// ── Create Admin Modal Component ─────────────────────────────────────────────
interface CreateAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        sub_role: 'ADMIN' as const
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof formData) => api.post('/rbac/admins', data),
        onSuccess: () => {
            showToast('Admin created successfully', 'success');
            onSuccess();
            onClose();
            setFormData({ name: '', email: '', password: '', sub_role: 'ADMIN' });
        },
        onError: (err: any) => showToast(err.response?.data?.message || 'Failed to create admin', 'error'),
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-md p-6 shadow-2xl relative animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Plus size={22} className="text-indigo-500" /> Add New Admin
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create a new administrative account with specific roles.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Email Address</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Password</label>
                        <input
                            required
                            type="password"
                            minLength={6}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Initial Sub-Role</label>
                        <select
                            value={formData.sub_role}
                            onChange={(e) => setFormData({ ...formData, sub_role: e.target.value as any })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                        >
                            <option value="ADMIN">Admin (Standard)</option>
                            <option value="PLACEMENT_COORDINATOR">Placement Coordinator</option>
                            <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

// ── Permission Label Map ─────────────────────────────────────────────────────
const PERMISSION_LABELS: Record<string, { label: string; description: string }> = {
    manage_students: { label: 'Manage Students', description: 'View, approve, block, delete students' },
    manage_recruiters: { label: 'Manage Recruiters', description: 'View, approve, block, delete recruiters' },
    manage_jobs: { label: 'Manage Jobs', description: 'Close or delete job postings' },
    manage_applications: { label: 'Manage Applications', description: 'Update application statuses' },
    manage_announcements: { label: 'Manage Announcements', description: 'Create or delete announcements' },
    view_analytics: { label: 'View Analytics', description: 'Access analytics dashboard' },
    view_logs: { label: 'View Logs', description: 'Access audit logs' },
    manage_api_keys: { label: 'Manage API Keys', description: 'Generate or revoke API keys' },
    export_data: { label: 'Export Data', description: 'Trigger CSV or DB exports' },
    manage_admins: { label: 'Manage Admins', description: 'Grant/revoke permissions (Super Admin only)' },
};

// ── Sub-role styling ─────────────────────────────────────────────────────────
const SUB_ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', icon: Crown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    PLACEMENT_COORDINATOR: { label: 'Placement Coordinator', icon: UserCog, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    ADMIN: { label: 'Admin', icon: User, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
};

// ── Component ────────────────────────────────────────────────────────────────
const AdminRBAC: React.FC = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch admin list
    const { data: admins = [], isLoading: adminsLoading, refetch: refetchAdmins } = useQuery<AdminAccount[]>({
        queryKey: ['rbac-admins'],
        queryFn: async () => {
            const res = await api.get('/rbac/admins');
            return res.data?.data || res.data || [];
        },
    });

    // Fetch permission manifest
    const { data: manifest } = useQuery<PermissionManifest>({
        queryKey: ['rbac-manifest'],
        queryFn: async () => {
            const res = await api.get('/rbac/permissions');
            return res.data?.data || res.data;
        },
    });

    const allPermissions = manifest?.allPermissions || Object.keys(PERMISSION_LABELS);

    // ── Mutations ────────────────────────────────────────────────────────────
    const grantMutation = useMutation({
        mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
            api.post(`/rbac/admins/${id}/permissions`, { permissions }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rbac-admins'] });
            showToast('Permissions granted successfully', 'success');
        },
        onError: (err: any) => showToast(err.response?.data?.message || 'Failed to grant permissions', 'error'),
    });

    const revokeMutation = useMutation({
        mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
            api.delete(`/rbac/admins/${id}/permissions`, { data: { permissions } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rbac-admins'] });
            showToast('Permissions revoked', 'success');
        },
        onError: (err: any) => showToast(err.response?.data?.message || 'Failed to revoke permissions', 'error'),
    });

    const subRoleMutation = useMutation({
        mutationFn: ({ id, sub_role }: { id: string; sub_role: string }) =>
            api.put(`/rbac/admins/${id}/sub-role`, { sub_role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rbac-admins'] });
            showToast('Sub-role updated', 'success');
        },
        onError: (err: any) => showToast(err.response?.data?.message || 'Failed to update sub-role', 'error'),
    });

    const handlePermissionToggle = (admin: AdminAccount, permission: string) => {
        if (admin.permissions.includes(permission)) {
            revokeMutation.mutate({ id: admin._id, permissions: [permission] });
        } else {
            grantMutation.mutate({ id: admin._id, permissions: [permission] });
        }
    };

    const handleSubRoleChange = (admin: AdminAccount, newRole: string) => {
        if (admin.sub_role === newRole) return;
        subRoleMutation.mutate({ id: admin._id, sub_role: newRole });
    };

    const isMutating = grantMutation.isPending || revokeMutation.isPending || subRoleMutation.isPending;

    return (
        <div className="flex flex-col gap-6 animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-3">
                        <Shield size={28} /> Roles & Permissions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0">Manage admin sub-roles and granular permission grants.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
                >
                    <Plus size={20} />
                    <span>Add New Admin</span>
                </button>
            </div>

            <CreateAdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['rbac-admins'] });
                    refetchAdmins();
                }}
            />

            {/* Loading State */}
            {adminsLoading ? (
                <Card className="p-12">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Loading admin accounts...</span>
                    </div>
                </Card>
            ) : admins.length === 0 ? (
                <Card className="p-12 text-center">
                    <ShieldAlert size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No admin accounts found.</p>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {admins.map((admin) => {
                        const isExpanded = expandedId === admin._id;
                        const roleConfig = SUB_ROLE_CONFIG[admin.sub_role] || SUB_ROLE_CONFIG.ADMIN;
                        const RoleIcon = roleConfig.icon;
                        const isSuperAdmin = admin.sub_role === 'SUPER_ADMIN';

                        return (
                            <Card key={admin._id} className="overflow-hidden p-0">
                                {/* Admin Row */}
                                <div
                                    className="flex items-center justify-between p-5 px-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : admin._id)}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${roleConfig.bg}`}>
                                            <RoleIcon size={18} className={roleConfig.color} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 m-0 truncate">{admin.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 m-0 truncate">{admin.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Sub-role badge */}
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleConfig.bg} ${roleConfig.color}`}>
                                            {roleConfig.label}
                                        </span>
                                        {/* Permission count */}
                                        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                                            {isSuperAdmin ? 'All' : admin.permissions.length} permissions
                                        </span>
                                        {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                                    </div>
                                </div>

                                {/* Expanded Permission Grid */}
                                {isExpanded && (
                                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-6">
                                        {/* Sub-role Selector */}
                                        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-200 dark:border-slate-700">
                                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sub-Role:</span>
                                            <div className="flex gap-2">
                                                {['SUPER_ADMIN', 'PLACEMENT_COORDINATOR', 'ADMIN'].map((role) => {
                                                    const rc = SUB_ROLE_CONFIG[role];
                                                    const isActive = admin.sub_role === role;
                                                    return (
                                                        <button
                                                            key={role}
                                                            onClick={(e) => { e.stopPropagation(); handleSubRoleChange(admin, role); }}
                                                            disabled={isMutating}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isActive
                                                                ? `${rc.bg} ${rc.color} border-current shadow-sm`
                                                                : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                                                }`}
                                                        >
                                                            {rc.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {isSuperAdmin && (
                                                <span className="text-xs text-amber-500 dark:text-amber-400 italic ml-2">
                                                    Super Admin has all permissions by default
                                                </span>
                                            )}
                                        </div>

                                        {/* Permission Toggles */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {allPermissions.map((perm) => {
                                                const meta = PERMISSION_LABELS[perm] || { label: perm, description: '' };
                                                const hasIt = isSuperAdmin || admin.permissions.includes(perm);

                                                return (
                                                    <label
                                                        key={perm}
                                                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${hasIt
                                                            ? 'bg-indigo-50/60 dark:bg-indigo-900/15 border-indigo-200 dark:border-indigo-800/40'
                                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={hasIt}
                                                            onChange={() => handlePermissionToggle(admin, perm)}
                                                            disabled={isMutating}
                                                            className="mt-0.5 w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                                                        />
                                                        <div className="min-w-0">
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block">{meta.label}</span>
                                                            <span className="text-xs text-slate-400 dark:text-slate-500">{meta.description}</span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminRBAC;
