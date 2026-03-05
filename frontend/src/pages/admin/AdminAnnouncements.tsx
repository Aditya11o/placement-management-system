import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import { Megaphone, Trash2, Plus, Calendar, User } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

interface Announcement {
    _id: string;
    title: string;
    message: string;
    created_at: string;
    created_by: string;
}

const AdminAnnouncements = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });

    // Fetch Announcements
    const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
        queryKey: ['adminAnnouncements'],
        queryFn: async () => {
            const res = await api.get('/announcements');
            return res.data.data;
        }
    });

    // Create Announcement Mutation
    const createMutation = useMutation({
        mutationFn: async (data: typeof newAnnouncement) => {
            return await api.post('/announcements', data);
        },
        onSuccess: () => {
            addToast('Announcement broadcasted successfully!', 'success');
            setIsModalOpen(false);
            setNewAnnouncement({ title: '', message: '' });
            queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Failed to post announcement', 'error');
        }
    });

    // Delete Announcement Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return await api.delete(`/announcements/${id}`);
        },
        onSuccess: () => {
            addToast('Announcement deleted', 'info');
            queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
        },
        onError: () => {
            addToast('Failed to delete announcement', 'error');
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
            return addToast('Please fill in all fields', 'info');
        }
        createMutation.mutate(newAnnouncement);
    };

    if (isLoading) return <div className="p-6"><SkeletonCard count={3} /></div>;

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">Global Announcements</h1>
                    <p className="text-slate-500 text-base m-0">Broadcast messages to all students and recruiters.</p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setIsModalOpen(true)}
                >
                    New Announcement
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {announcements.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                        <Megaphone size={48} className="text-slate-300 mb-4 opacity-50" />
                        <p className="text-lg font-medium">No announcements yet.</p>
                        <p className="text-sm">Create your first broadcast to notify users.</p>
                    </Card>
                ) : (
                    announcements.map((ann) => (
                        <Card key={ann._id} className="p-0 overflow-hidden border-l-4 border-l-indigo-500">
                            <div className="p-6">
                                <div className="flex justify-between items-start gap-4 mb-3">
                                    <h3 className="text-xl font-bold text-slate-800 m-0">{ann.title}</h3>
                                    <button
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this announcement?')) {
                                                deleteMutation.mutate(ann._id);
                                            }
                                        }}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="text-slate-600 text-base leading-relaxed mb-4 whitespace-pre-wrap">
                                    {ann.message}
                                </p>
                                <div className="flex items-center gap-6 text-[13px] text-slate-400 font-medium pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        <span>{new Date(ann.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User size={14} />
                                        <span>Admin Post</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <Card className="w-full max-w-lg shadow-2xl relative animate-scale-in">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-800 m-0 flex items-center gap-2">
                                <Megaphone className="text-indigo-600" size={24} />
                                New Broadcast
                            </h2>
                            <button className="bg-transparent border-none text-slate-400 cursor-pointer p-1 hover:text-slate-600" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Announcement Title</label>
                                <input
                                    className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-base"
                                    placeholder="e.g. Schedule Update for TCS"
                                    value={newAnnouncement.title}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                                <textarea
                                    className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-base min-h-[150px] resize-none"
                                    placeholder="Enter the full message for students and recruiters..."
                                    value={newAnnouncement.message}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    isLoading={createMutation.isPending}
                                >
                                    Broadcast Now
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminAnnouncements;
