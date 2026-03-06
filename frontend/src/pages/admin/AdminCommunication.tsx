import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Send,
    Users,
    Mail,
    MessageSquare,
    Bell,
    Filter,
    History,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    Search,
    RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { useToast } from '../../context/ToastContext';

interface Campaign {
    _id: string;
    title: string;
    subject: string;
    target_audience: string;
    status: 'DRAFT' | 'SENDING' | 'COMPLETED' | 'FAILED';
    total_recipients: number;
    sent_count: number;
    channels: string[];
    created_at: string;
}

const AdminCommunication: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'composer' | 'history'>('composer');

    // Composer State
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        html_content: '',
        target_audience: 'CUSTOM',
        channels: ['EMAIL'],
        target_filters: {
            branch: '',
            cgpa_min: '0',
            graduation_year: new Date().getFullYear().toString(),
        }
    });

    // Fetch Campaign History
    const { data: campaigns = [], isLoading: historyLoading } = useQuery<Campaign[]>({
        queryKey: ['adminCampaigns'],
        queryFn: async () => {
            const res = await api.get('/admin/campaigns');
            return res.data?.data || [];
        },
        enabled: activeTab === 'history'
    });

    // Create Campaign Mutation
    const createMutation = useMutation({
        mutationFn: (data: typeof formData) => api.post('/admin/campaigns', data),
        onSuccess: () => {
            addToast('Campaign launched successfully!', 'success');
            setFormData({
                title: '',
                subject: '',
                html_content: '',
                target_audience: 'CUSTOM',
                channels: ['EMAIL'],
                target_filters: {
                    branch: '',
                    cgpa_min: '0',
                    graduation_year: new Date().getFullYear().toString(),
                }
            });
            setActiveTab('history');
            queryClient.invalidateQueries({ queryKey: ['adminCampaigns'] });
        },
        onError: (err: any) => addToast(err.response?.data?.message || 'Failed to launch campaign', 'error')
    });

    const handleChannelToggle = (channel: string) => {
        setFormData(prev => ({
            ...prev,
            channels: prev.channels.includes(channel)
                ? prev.channels.filter(c => c !== channel)
                : [...prev.channels, channel]
        }));
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-3">
                        <Send size={28} /> Communication Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0">Send targeted multi-channel campaigns to your ecosystem.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('composer')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'composer' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        New Campaign
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            {activeTab === 'composer' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Composer */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <Mail size={20} className="text-indigo-500" /> Message Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Campaign Title (Internal)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Urgent: TCS Interview Prep"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Subject Line</label>
                                    <input
                                        type="text"
                                        placeholder="Enter email subject..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Message Body (Supports basic HTML)</label>
                                    <textarea
                                        placeholder="Write your announcement here..."
                                        rows={10}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                        value={formData.html_content}
                                        onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                                    />
                                </div>
                            </div>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Button variant="ghost">Save Draft</Button>
                            <Button
                                variant="primary"
                                icon={Send}
                                onClick={() => createMutation.mutate(formData)}
                                isLoading={createMutation.isPending}
                                disabled={!formData.title || !formData.subject || !formData.html_content}
                            >
                                Launch Campaign
                            </Button>
                        </div>
                    </div>

                    {/* Targeting & Channels */}
                    <div className="space-y-6">
                        {/* Channels */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <Bell size={20} className="text-amber-500" /> Channels
                            </h2>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'EMAIL', icon: Mail, label: 'Email' },
                                    { id: 'SMS', icon: MessageSquare, label: 'SMS' },
                                    { id: 'PUSH', icon: Bell, label: 'Push' }
                                ].map(ch => (
                                    <button
                                        key={ch.id}
                                        onClick={() => handleChannelToggle(ch.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${formData.channels.includes(ch.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400'}`}
                                    >
                                        <ch.icon size={20} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase">{ch.label}</span>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Audience Filters */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <Users size={20} className="text-emerald-500" /> Target Cohort
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Audience Preset</label>
                                    <select
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none cursor-pointer"
                                        value={formData.target_audience}
                                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                    >
                                        <option value="CUSTOM">Custom Filters</option>
                                        <option value="ALL_STUDENTS">All Students</option>
                                        <option value="APPROVED_STUDENTS">Approved Students</option>
                                        <option value="UNPLACED_STUDENTS">Unplaced Students</option>
                                        <option value="ALL_RECRUITERS">All Recruiters</option>
                                    </select>
                                </div>

                                {formData.target_audience === 'CUSTOM' && (
                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-slide-in-bottom">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Branch</label>
                                            <select
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none cursor-pointer"
                                                value={formData.target_filters.branch}
                                                onChange={(e) => setFormData({ ...formData, target_filters: { ...formData.target_filters, branch: e.target.value } })}
                                            >
                                                <option value="">All Branches</option>
                                                <option value="CSE">CSE</option>
                                                <option value="IT">IT</option>
                                                <option value="ECE">ECE</option>
                                                <option value="MECH">MECH</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 flex justify-between">
                                                <span>Min CGPA</span>
                                                <span className="text-indigo-600">{formData.target_filters.cgpa_min}+</span>
                                            </label>
                                            <input
                                                type="range" min="0" max="10" step="0.5"
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                value={formData.target_filters.cgpa_min}
                                                onChange={(e) => setFormData({ ...formData, target_filters: { ...formData.target_filters, cgpa_min: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {historyLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-400">
                            <RefreshCw className="animate-spin" size={32} />
                            <p className="font-medium">Loading Campaign History...</p>
                        </div>
                    ) : campaigns.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-20 text-center opacity-50">
                            <History size={48} className="mb-4 text-slate-300" />
                            <p className="text-lg font-bold">No campaigns found</p>
                            <p className="text-sm">When you launch a broadcast, it will appear here.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {campaigns.map((camp) => (
                                <Card key={camp._id} className="p-0 overflow-hidden group hover:border-indigo-300 transition-all">
                                    <div className="flex items-center gap-6 p-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${camp.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {camp.status === 'COMPLETED' ? <CheckCircle size={24} /> : <Clock size={24} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate m-0">{camp.title}</h3>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">{camp.target_audience}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate m-0">{camp.subject}</p>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <p className="text-base font-bold text-slate-800 dark:text-slate-100 m-0">{camp.sent_count} / {camp.total_recipients}</p>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase m-0">Sent Reach</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {camp.channels.map(ch => (
                                                <div key={ch} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-400" title={ch}>
                                                    {ch === 'EMAIL' && <Mail size={14} />}
                                                    {ch === 'SMS' && <MessageSquare size={14} />}
                                                    {ch === 'PUSH' && <Bell size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${camp.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`}
                                            style={{ width: `${(camp.sent_count / camp.total_recipients) * 100}%` }}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminCommunication;
