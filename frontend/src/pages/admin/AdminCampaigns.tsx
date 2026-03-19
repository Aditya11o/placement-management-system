import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Send,
    AtSign,
    Users,
    Mail,
    AlertCircle,
    CheckCircle,
    Clock,
    Plus,
    History
} from 'lucide-react';
import Button from '../../components/Button/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/Card/Card';

const campaignSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    target_audience: z.enum(['ALL_STUDENTS', 'APPROVED_STUDENTS', 'UNPLACED_STUDENTS', 'ALL_RECRUITERS']),
    html_content: z.string().min(10, "Email body is too short")
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface Campaign {
    _id: string;
    title: string;
    subject: string;
    target_audience: string;
    status: string;
    total_recipients: number;
    sent_count: number;
    created_at: string;
    created_by?: { name: string };
}

const AdminCampaigns: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [view, setView] = useState<'COMPOSE' | 'HISTORY'>('COMPOSE');

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            target_audience: 'APPROVED_STUDENTS'
        }
    });

    const { data: historyData, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['campaignHistory'],
        queryFn: async () => {
            const res = await api.get('/admin/campaigns?sort=-created_at');
            return res.data;
        },
        enabled: view === 'HISTORY'
    });

    const createCampaignMutation = useMutation({
        mutationFn: async (data: CampaignFormValues) => {
            const res = await api.post('/admin/campaigns', data);
            return res.data;
        },
        onSuccess: () => {
            addToast('Campaign Queued', 'success');
            reset();
            queryClient.invalidateQueries({ queryKey: ['campaignHistory'] });
            setView('HISTORY');
        },
        onError: () => {
            addToast('Launch Failed', 'error');
        }
    });

    const onSubmit = (data: CampaignFormValues) => {
        if (window.confirm(`Are you sure you want to send this campaign to the selected audience? This cannot be undone.`)) {
            createCampaignMutation.mutate(data);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'SENDING': return <Clock size={16} className="text-amber-500 animate-pulse" />;
            case 'FAILED': return <AlertCircle size={16} className="text-red-500" />;
            case 'SCHEDULED': return <Clock size={16} className="text-indigo-500" />;
            default: return <Clock size={16} className="text-slate-400" />;
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-lg">
                            <Send size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white m-0 tracking-tight">Outreach Campaigns</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0">Compose and dispatch bulk emails to targeted user segments.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${view === 'COMPOSE' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        onClick={() => setView('COMPOSE')}
                    >
                        <Plus size={16} /> Compose
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${view === 'HISTORY' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        onClick={() => setView('HISTORY')}
                    >
                        <History size={16} /> History
                    </button>
                </div>
            </div>

            {/* Compose View */}
            {view === 'COMPOSE' && (
                <Card className="p-6 md:p-8 border-t-4 border-t-brand-500">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <AtSign size={16} className="text-slate-400" /> Internal Campaign Title
                                </label>
                                <input
                                    type="text"
                                    {...register('title')}
                                    placeholder="e.g. Meta On-Campus Drive Announcement"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                                />
                                {errors.title && <span className="text-xs text-red-500 font-medium">{errors.title.message}</span>}
                            </div>

                            {/* Audience */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Users size={16} className="text-slate-400" /> Target Audience
                                </label>
                                <select
                                    {...register('target_audience')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium cursor-pointer appearance-none"
                                >
                                    <option value="APPROVED_STUDENTS">Verified Students Only</option>
                                    <option value="ALL_STUDENTS">All Registered Students</option>
                                    <option value="UNPLACED_STUDENTS">Unplaced Students</option>
                                    <option value="ALL_RECRUITERS">All Recruiters</option>
                                </select>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" /> Email Subject Line
                            </label>
                            <input
                                type="text"
                                {...register('subject')}
                                placeholder="Alert: New Placement Opportunity"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                            />
                            {errors.subject && <span className="text-xs text-red-500 font-medium">{errors.subject.message}</span>}
                        </div>

                        {/* Message Body */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message Body (HTML Allowed)</label>
                            <textarea
                                {...register('html_content')}
                                rows={8}
                                placeholder="Write your announcement here..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all custom-scrollbar font-mono text-sm leading-relaxed"
                            ></textarea>
                            {errors.html_content && <span className="text-xs text-red-500 font-medium">{errors.html_content.message}</span>}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="submit"
                                icon={Send}
                                disabled={createCampaignMutation.isPending}
                                className={createCampaignMutation.isPending ? 'opacity-70 cursor-wait' : ''}
                            >
                                {createCampaignMutation.isPending ? 'Dispatching...' : 'Launch Campaign'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* History View */}
            {view === 'HISTORY' && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Audience</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status & Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {isLoadingHistory ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">Loading history...</td>
                                    </tr>
                                ) : historyData?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500 italic">No campaigns launched yet.</td>
                                    </tr>
                                ) : (
                                    historyData?.data?.map((campaign: Campaign) => (
                                        <tr key={campaign._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 dark:text-white line-clamp-1">{campaign.title}</span>
                                                    <span className="text-xs text-slate-500 line-clamp-1">Subject: {campaign.subject}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                                                    {campaign.target_audience.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {new Date(campaign.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        by {campaign.created_by?.name || 'Admin'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        {getStatusIcon(campaign.status)}
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{campaign.status}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${campaign.status === 'FAILED' ? 'bg-red-500' : 'bg-brand-500'}`}
                                                                style={{ width: `${Math.min(100, (campaign.sent_count / (campaign.total_recipients || 1)) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                            {campaign.sent_count} / {campaign.total_recipients}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminCampaigns;
