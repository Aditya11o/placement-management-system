import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import Button from '../Button/Button';
import { useToast } from '../../context/ToastContext';
import { format, parseISO } from 'date-fns';

interface SlotPickerModalProps {
    jobId: string;
    applicationId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

interface Slot {
    _id: string;
    start_time: string;
    end_time: string;
    is_booked: boolean;
}

const SlotPickerModal: React.FC<SlotPickerModalProps> = ({ jobId, applicationId, onClose, onSuccess }) => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedSlotId, setSelectedSlotId] = useState<string>('');

    const { data: slots = [], isLoading } = useQuery<Slot[]>({
        queryKey: ['availableSlots', jobId],
        queryFn: async () => {
            const res = await api.get(`/interviews/slots/${jobId}`);
            return res.data.data;
        }
    });

    const bookMutation = useMutation({
        mutationFn: async () => {
            return api.post(`/interviews/slots/${selectedSlotId}/book`, {
                application_id: applicationId
            });
        },
        onSuccess: () => {
            addToast('Interview booked successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: ['studentInterviews'] });
            queryClient.invalidateQueries({ queryKey: ['studentApplications'] });
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Booking failed', 'error');
        }
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Book Your Interview</h3>
                            <p className="text-xs text-slate-500">Select a time that works for you.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="space-y-3 py-12">
                            {[1, 2, 3].map(i => <div key={i} className="h-14 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <AlertCircle size={48} className="text-slate-300 mb-4" />
                            <h4 className="text-slate-600 dark:text-slate-300 font-bold">No slots available</h4>
                            <p className="text-sm text-slate-500 max-w-[240px] mt-2">
                                The recruiter hasn't shared any interview slots yet. Please check back later or contact the representative.
                            </p>
                            <Button variant="ghost" className="mt-6" onClick={onClose}>Close</Button>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {slots.map(slot => (
                                <button
                                    key={slot._id}
                                    onClick={() => setSelectedSlotId(slot._id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedSlotId === slot._id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-sm'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl transition-colors ${selectedSlotId === slot._id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">
                                                {format(parseISO(slot.start_time), 'EEEE, MMM d')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {format(parseISO(slot.start_time), 'h:mm a')} – {format(parseISO(slot.end_time), 'h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`p-1.5 rounded-full transition-all ${selectedSlotId === slot._id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 scale-110' : 'bg-slate-100 dark:bg-slate-700 text-slate-300'}`}>
                                        <ChevronRight size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {slots.length > 0 && (
                    <div className="p-6 pt-2">
                        <Button
                            variant="primary"
                            isFullWidth
                            className="h-12 text-sm font-bold shadow-indigo-500/20"
                            icon={CheckCircle2}
                            disabled={!selectedSlotId}
                            onClick={() => bookMutation.mutate()}
                            isLoading={bookMutation.isPending}
                        >
                            Confirm Booking
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-tighter">
                            A Google Calendar invite will be automatically sent to your email.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlotPickerModal;
