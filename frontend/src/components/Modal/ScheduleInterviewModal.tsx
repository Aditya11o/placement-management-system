import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Calendar, Clock, MapPin, AlignLeft, Info, Video, Building2, CheckCircle } from 'lucide-react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { format, addMinutes, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

// ── Schema ────────────────────────────────────────────────────────────────────
const scheduleInterviewSchema = z.object({
    date: z.string().min(1, 'Please select a date'),
    time: z.string().min(1, 'Please select a time'),
    duration: z.string().min(1, 'Duration is required'),
    type: z.string().min(1, 'Interview type is required'),
    location: z.string().min(2, 'Location or link is required'),
    notes: z.string().optional()
});

export type ScheduleInterviewFormData = z.infer<typeof scheduleInterviewSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────
const getSmartDefaults = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().split('T')[0];

    // Round up to nearest 30-min slot in business hours
    const now = new Date();
    const mins = now.getMinutes();
    const roundedMins = mins < 30 ? 30 : 0;
    const roundedHour = mins < 30 ? now.getHours() : now.getHours() + 1;
    const safeHour = Math.min(Math.max(roundedHour, 9), 17); // clamp 9am–5pm
    const time = `${String(safeHour).padStart(2, '0')}:${String(roundedMins).padStart(2, '0')}`;

    return { date, time };
};

const INTERVIEW_TYPES = [
    { value: 'Initial Screening', label: 'Screening', icon: CheckCircle },
    { value: 'Technical Interview', label: 'Technical', icon: Info },
    { value: 'HR Interview', label: 'HR Round', icon: Building2 },
    { value: 'Final Round', label: 'Final', icon: Video },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface ScheduleInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicantId: string;
    studentName: string;
    jobTitle: string;
    onSuccess?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
    isOpen,
    onClose,
    applicantId,
    studentName,
    jobTitle,
    onSuccess
}) => {
    const { user } = useAuth();
    const isCalendarConnected = !!(user as any)?.calendar_tokens;
    const { addToast } = useToast();
    const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
    const smartDefaults = useMemo(() => getSmartDefaults(), []);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<ScheduleInterviewFormData>({
        resolver: zodResolver(scheduleInterviewSchema),
        defaultValues: {
            duration: '30',
            type: 'Technical Interview',
            ...smartDefaults
        }
    });

    // Live watch values for the preview panel
    const watchDate = watch('date');
    const watchTime = watch('time');
    const watchDuration = watch('duration');
    const watchType = watch('type');
    const watchLocation = watch('location');

    // Compute end time for preview
    const endTime = useMemo(() => {
        if (!watchDate || !watchTime) return null;
        try {
            const start = parseISO(`${watchDate}T${watchTime}`);
            const end = addMinutes(start, parseInt(watchDuration || '30', 10));
            return format(end, 'h:mm a');
        } catch {
            return null;
        }
    }, [watchDate, watchTime, watchDuration]);

    const startTimeFormatted = useMemo(() => {
        if (!watchDate || !watchTime) return null;
        try {
            return format(parseISO(`${watchDate}T${watchTime}`), 'EEE, MMM d · h:mm a');
        } catch {
            return null;
        }
    }, [watchDate, watchTime]);

    if (!isOpen) return null;

    const onSubmit = async (data: ScheduleInterviewFormData) => {
        try {
            const scheduledAt = new Date(`${data.date}T${data.time}`).toISOString();
            // Auto-generate a mock Google Meet link if location is left blank
            const isVirtual = data.location.toLowerCase().includes('http') || data.location.trim() === '';
            const finalLocation = data.location.trim() || `https://meet.google.com/mock-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;

            const payload = {
                application_id: applicantId,
                scheduled_at: scheduledAt,
                duration_minutes: parseInt(data.duration, 10),
                type: data.type,
                location_type: isVirtual ? 'VIRTUAL' : 'PHYSICAL',
                location_details: finalLocation,
                notes: data.notes || ''
            };

            await api.post('/interviews', payload);

            addToast('Interview scheduled & invite sent!', 'success');
            reset();
            onSuccess?.();
            onClose();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to schedule interview', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up max-h-[90dvh] flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-900">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Schedule Interview</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            With <span className="font-semibold text-indigo-600 dark:text-indigo-400">{studentName}</span> for <span className="font-medium text-slate-700 dark:text-slate-300">{jobTitle}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-white/70 dark:hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-5">

                        {/* Date and Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <Calendar size={16} className="text-indigo-500" /> Date
                                </label>
                                <Input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    {...register('date')}
                                    error={errors.date?.message}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <Clock size={16} className="text-indigo-500" /> Time
                                </label>
                                <Input
                                    type="time"
                                    {...register('time')}
                                    error={errors.time?.message}
                                />
                            </div>
                        </div>

                        {/* Timezone chip */}
                        <div className="flex items-center gap-1.5 -mt-2">
                            <Info size={12} className="text-slate-400 shrink-0" />
                            <span className="text-xs text-slate-400 font-medium">
                                Time is in your local timezone: <span className="text-indigo-500 font-semibold">{timezone}</span>
                            </span>
                        </div>

                        {/* Interview Type — Pill Group */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                <Info size={16} className="text-indigo-500" /> Interview Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {INTERVIEW_TYPES.map(({ value, label, icon: Icon }) => {
                                    const isSelected = watchType === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setValue('type', value, { shouldValidate: true })}
                                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${isSelected
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50'
                                                }`}
                                        >
                                            <Icon size={16} className={isSelected ? 'text-indigo-500' : 'text-slate-400'} />
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                <Clock size={16} className="text-indigo-500" /> Duration
                            </label>
                            <select
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                {...register('duration')}
                            >
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="45">45 Minutes</option>
                                <option value="60">60 Minutes (1 hr)</option>
                                <option value="90">90 Minutes (1.5 hr)</option>
                                <option value="120">120 Minutes (2 hr)</option>
                            </select>
                            {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                        </div>

                        {/* Location / Meeting Link */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                <MapPin size={16} className="text-indigo-500" /> Location or Meeting Link
                            </label>
                            <Input
                                placeholder="e.g., https://meet.google.com/... or 'Conference Room A'"
                                {...register('location')}
                                error={errors.location?.message}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                <AlignLeft size={16} className="text-indigo-500" /> Message / Notes
                                <span className="text-slate-400 font-normal ml-1">(optional)</span>
                            </label>
                            <textarea
                                rows={2}
                                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none transition-all focus:outline-none focus:ring-2 focus:border-transparent text-sm ${errors.notes ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'}`}
                                placeholder="E.g., Please be prepared to discuss your recent projects..."
                                {...register('notes')}
                            />
                        </div>

                        {/* Calendar Sync Status */}
                        {isCalendarConnected ? (
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                <div className="text-xs">
                                    <p className="font-bold text-emerald-700 dark:text-emerald-400">Google Calendar Connected</p>
                                    <p className="text-emerald-600 dark:text-emerald-500/80">Student and recruiter will receive calendar invites automatically.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                                <Info size={18} className="text-amber-500 shrink-0" />
                                <div className="text-xs">
                                    <p className="font-bold text-amber-700 dark:text-amber-400">Calendar Not Connected</p>
                                    <p className="text-amber-600 dark:text-amber-500/80">Connect your Google Calendar in Profile settings to send automated invites.</p>
                                </div>
                            </div>
                        )}

                        {/* Live Summary Preview */}
                        {(watchDate || watchTime || watchLocation) && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-3">Interview Summary</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <Calendar size={14} className="text-indigo-500 shrink-0" />
                                        <span className="font-medium">{startTimeFormatted ?? '—'}</span>
                                        {endTime && <span className="text-slate-400">→ {endTime}</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <Info size={14} className="text-indigo-500 shrink-0" />
                                        <span>{watchType || '—'}</span>
                                        <span className="text-slate-400">· {watchDuration} min</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <MapPin size={14} className="text-indigo-500 shrink-0" />
                                        <span className="truncate">{watchLocation || '—'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={onClose}
                            isFullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            isLoading={isSubmitting}
                            isFullWidth
                            icon={Calendar}
                        >
                            Send Invite
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleInterviewModal;
