import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Plus, Trash2, Briefcase, AlertCircle } from 'lucide-react';
import api from '../../../services/api';
import Button from '../../../components/Button/Button';
import Card from '../../../components/Card/Card';
import { useToast } from '../../../context/ToastContext';
import { format, addHours, startOfHour, addMinutes } from 'date-fns';

interface Job {
    _id: string;
    title: string;
    company_name: string;
}

interface Slot {
    _id: string;
    start_time: string;
    end_time: string;
    is_booked: boolean;
}

const AvailabilityManager: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [newSlotDate, setNewSlotDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [newSlotTime, setNewSlotTime] = useState<string>('09:00');
    const [duration, setDuration] = useState<number>(45);

    // Fetch Jobs
    const { data: jobs = [] } = useQuery<Job[]>({
        queryKey: ['recruiterJobsShort'],
        queryFn: async () => {
            const res = await api.get('/jobs/recruiter');
            return res.data.data;
        }
    });

    // Fetch Slots
    const { data: slots = [], isLoading: slotsLoading } = useQuery<Slot[]>({
        queryKey: ['interviewSlots', selectedJobId],
        queryFn: async () => {
            if (!selectedJobId) return [];
            const res = await api.get(`/interviews/slots/${selectedJobId}`);
            return res.data.data;
        },
        enabled: !!selectedJobId
    });

    const createSlotMutation = useMutation({
        mutationFn: async () => {
            const start = new Date(`${newSlotDate}T${newSlotTime}`);
            const end = addMinutes(start, duration);
            return api.post('/interviews/slots', {
                job_id: selectedJobId,
                slots: [{ start_time: start.toISOString(), end_time: end.toISOString() }]
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interviewSlots', selectedJobId] });
            addToast('Availability slot added successfully', 'success');
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Failed to add slot', 'error');
        }
    });

    const deleteSlotMutation = useMutation({
        mutationFn: async (slotId: string) => {
            return api.delete(`/interviews/slots/${slotId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interviewSlots', selectedJobId] });
            addToast('Slot removed', 'success');
        }
    });

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Manage Availability</h3>
                    <p className="text-xs text-slate-500">Define time slots for students to book interviews.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Job Selection */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Job</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                            <option value="">Select a job to manage slots...</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedJobId && (
                    <>
                        {/* New Slot Form */}
                        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[140px]">
                                <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1.5 ml-1">Date</label>
                                <input
                                    type="date"
                                    value={newSlotDate}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    onChange={(e) => setNewSlotDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex-1 min-w-[100px]">
                                <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1.5 ml-1">Start Time</label>
                                <input
                                    type="time"
                                    value={newSlotTime}
                                    onChange={(e) => setNewSlotTime(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex-1 min-w-[100px]">
                                <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1.5 ml-1">Duration (Min)</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {[15, 30, 45, 60, 90].map(d => (
                                        <option key={d} value={d}>{d} min</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                variant="primary"
                                onClick={() => createSlotMutation.mutate()}
                                isLoading={createSlotMutation.isPending}
                                icon={Plus}
                                className="h-10 px-6 font-bold"
                            >
                                Add Slot
                            </Button>
                        </div>

                        {/* Existing Slots */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Existing Slots</label>
                            {slotsLoading ? (
                                <div className="space-y-2">
                                    {[1, 2].map(i => <div key={i} className="h-12 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />)}
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <Clock size={32} className="text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">No slots defined for this job yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {slots.map(slot => (
                                        <div
                                            key={slot._id}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${slot.is_booked ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${slot.is_booked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    <Clock size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                        {format(new Date(slot.start_time), 'MMM d, h:mm a')}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                                                        {slot.is_booked ? 'Booked' : 'Available'}
                                                    </p>
                                                </div>
                                            </div>
                                            {!slot.is_booked && (
                                                <button
                                                    onClick={() => deleteSlotMutation.mutate(slot._id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {!selectedJobId && (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <AlertCircle size={40} className="text-slate-300 mb-3" />
                        <h4 className="text-slate-500 font-bold">Select a job to start</h4>
                        <p className="text-slate-400 text-xs max-w-[240px] mt-1">
                            Choose a position above to view and manage its interview scheduling slots.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default AvailabilityManager;
