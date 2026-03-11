import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    Users, UserPlus, Shield, ShieldCheck, Mail, Phone, 
    Copy, Check, UserCircle, TrendingUp
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

interface TeamMember {
    _id: string;
    contact_person: string;
    email: string;
    phone: string;
    team_role: 'OWNER' | 'MEMBER';
    status: string;
    created_at: string;
}

interface CompanyDetails {
    _id: string;
    name: string;
    join_code: string;
}

const RecruiterTeam: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);

    // Fetch team members
    const { data: members, isLoading: loadingMembers } = useQuery<TeamMember[]>({
        queryKey: ['team-members'],
        queryFn: async () => {
            const res = await api.get('/team/members');
            return res.data.data;
        }
    });

    // Fetch company details
    const { data: company, isLoading: loadingCompany } = useQuery<CompanyDetails>({
        queryKey: ['company-details'],
        queryFn: async () => {
            const res = await api.get('/team/company');
            return res.data.data;
        }
    });

    // Role mutation
    const updateRoleMutation = useMutation({
        mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
            await api.put(`/team/members/${memberId}/role`, { role });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
            addToast('Member role updated', 'success');
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Failed to update role', 'error');
        }
    });

    const copyJoinCode = () => {
        if (company?.join_code) {
            navigator.clipboard.writeText(company.join_code);
            setCopied(true);
            addToast('Join code copied to clipboard!', 'success');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loadingMembers || loadingCompany) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    const isOwner = user?.team_role === 'OWNER';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                {company?.name} Team
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md">
                                Collaboration workspace for your hiring team. Every member has shared access to jobs and candidate intelligence.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-brand-50 dark:bg-brand-500/10 p-4 rounded-xl border border-brand-100 dark:border-brand-500/20">
                                <span className="text-xs uppercase font-bold text-brand-600 dark:text-brand-400 block mb-1">Company Join Code</span>
                                <div className="flex items-center gap-3">
                                    <code className="text-xl font-mono font-bold text-slate-800 dark:text-slate-200">{company?.join_code}</code>
                                    <button 
                                        onClick={copyJoinCode}
                                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-brand-600"
                                    >
                                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-brand-600 rounded-2xl p-8 text-white shadow-lg flex flex-col justify-between">
                    <div>
                        <TrendingUp className="mb-4 opacity-80" size={24} />
                        <h3 className="text-brand-100 font-medium">Active Recruiters</h3>
                        <div className="text-4xl font-bold mt-1">{members?.length || 0}</div>
                    </div>
                    <div className="mt-4 text-sm bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                        {isOwner ? "You are the team owner" : "You are a team member"}
                    </div>
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-brand-500" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Team Members</h2>
                    </div>
                    {isOwner && (
                         <div className="flex items-center gap-2 text-xs text-brand-600 font-medium bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                             <ShieldCheck size={14} />
                             Owner Access Enabled
                         </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider">Member</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider">Joined</th>
                                {isOwner && <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {members?.map((member) => (
                                <tr key={member._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                                                {member.contact_person.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    {member.contact_person}
                                                    {member._id === user?._id && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">You</span>}
                                                </div>
                                                <div className="text-xs text-slate-500">{member.status}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                <Mail size={12} /> {member.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                <Phone size={12} /> {member.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {member.team_role === 'OWNER' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold ring-1 ring-inset ring-amber-600/20">
                                                <ShieldCheck size={12} /> OWNER
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold ring-1 ring-inset ring-slate-600/20">
                                                <Users size={12} /> MEMBER
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(member.created_at).toLocaleDateString()}
                                    </td>
                                    {isOwner && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {member._id !== user?._id && (
                                                <div className="flex items-center justify-end gap-2">
                                                    {member.team_role === 'MEMBER' ? (
                                                        <button 
                                                            onClick={() => updateRoleMutation.mutate({ memberId: member._id, role: 'OWNER' })}
                                                            className="p-2 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                                                            title="Promote to Owner"
                                                        >
                                                            <Shield size={18} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => updateRoleMutation.mutate({ memberId: member._id, role: 'MEMBER' })}
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                                            title="Demote to Member"
                                                        >
                                                            <UserCircle size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Info Box */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                        <UserPlus size={40} className="text-brand-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-2">Want coworkers to join?</h2>
                        <p className="text-slate-400 max-w-lg">
                            Share the join code above with your team members. When they register as a recruiter, they can enter the code to automatically join your company workspace.
                        </p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyJoinCode}
                        className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-brand-500/20 transition-all flex items-center gap-3"
                    >
                        <Copy size={20} />
                        Copy Invitation Code
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default RecruiterTeam;
