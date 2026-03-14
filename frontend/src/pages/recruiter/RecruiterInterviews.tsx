import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    format, parse, startOfWeek, getDay, addMinutes, parseISO,
    isToday, isTomorrow
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonTable from '../../components/Skeleton/SkeletonTable';
import {
    Calendar as CalendarIcon, Clock, MapPin, User, Video,
    CheckCircle2, XCircle, AlertTriangle, RefreshCw, LayoutGrid,
    Columns, X, CalendarClock, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Interview {
    _id: string;
    studentName: string;
    studentEmail: string;
    jobTitle: string;
    scheduledAt: string;        // ISO string
    durationMinutes: number;
    type: string;
    location: string;
    status: InterviewStatus;
    notes?: string;
}

export type InterviewType = 'Technical' | 'HR' | 'Behavioral' | 'Initial Screening' | 'Portfolio Review' | 'Cultural Fit';

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Interview & { type?: string };
}

// ── RBC Localizer ─────────────────────────────────────────────────────────────
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales: { 'en-US': enUS },
});

// ── Mock Data ─────────────────────────────────────────────────────────────────
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const mockInterviews: Interview[] = [
    {
        _id: 'int_1', studentName: 'Alice Johnson', studentEmail: 'alice@student.edu',
        jobTitle: 'Frontend Engineer',
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
        durationMinutes: 45, type: 'Technical Interview',
        location: 'https://meet.google.com/abc-defg-hij', status: 'SCHEDULED'
    },
    {
        _id: 'int_2', studentName: 'Bob Smith', studentEmail: 'bob@student.edu',
        jobTitle: 'Backend Developer',
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30).toISOString(),
        durationMinutes: 30, type: 'Initial Screening',
        location: 'Zoom Link', status: 'SCHEDULED'
    },
    {
        _id: 'int_3', studentName: 'Carol White', studentEmail: 'carol@student.edu',
        jobTitle: 'UX Designer',
        scheduledAt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0).toISOString(),
        durationMinutes: 60, type: 'Portfolio Review',
        location: 'Conference Room B', status: 'SCHEDULED'
    },
    {
        _id: 'int_4', studentName: 'David Patel', studentEmail: 'david@student.edu',
        jobTitle: 'Data Scientist',
        scheduledAt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0).toISOString(),
        durationMinutes: 45, type: 'Technical Interview',
        location: 'https://zoom.us/j/123456', status: 'SCHEDULED'
    },
    {
        _id: 'int_5', studentName: 'Eva Chen', studentEmail: 'eva@student.edu',
        jobTitle: 'DevOps Engineer',
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 0).toISOString(),
        durationMinutes: 30, type: 'HR Round',
        location: 'Office - Floor 3', status: 'COMPLETED'
    },
];

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<InterviewStatus, { label: string; bg: string; text: string; border: string; calBg: string }> = {
    SCHEDULED: {
        label: 'Scheduled', bg: 'bg-indigo-50', text: 'text-indigo-700',
        border: 'border-indigo-200', calBg: '#6366f1'
    },
    COMPLETED: {
        label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700',
        border: 'border-emerald-200', calBg: '#10b981'
    },
    CANCELLED: {
        label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500',
        border: 'border-slate-200', calBg: '#94a3b8'
    },
    NO_SHOW: {
        label: 'No Show', bg: 'bg-amber-50', text: 'text-amber-700',
        border: 'border-amber-200', calBg: '#f59e0b'
    },
};

// ── Type Color Helpers ────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
    'Technical': '#ec4899',           // Pink
    'HR': '#8b5cf6',                  // Violet
    'Behavioral': '#f59e0b',          // Amber
    'Initial Screening': '#3b82f6',   // Blue
    'Portfolio Review': '#14b8a6',    // Teal
    'Cultural Fit': '#f43f5e'         // Rose
};

// ── Component ─────────────────────────────────────────────────────────────────
const RecruiterInterviews: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [currentView, setCurrentView] = useState<View>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // ── Data Fetching ─────────────────────────────────────────────────────────
    const { data: interviews = [], isLoading } = useQuery<Interview[]>({
        queryKey: ['recruiterInterviews'],
        queryFn: async () => {
            try {
                const res = await api.get('/interviews/recruiter');
                return res.data.data;
            } catch {
                return mockInterviews;
            }
        },
        enabled: !!user,
        refetchInterval: 30_000,
    });

    // ── Calendar Events ───────────────────────────────────────────────────────
    const events = useMemo<CalendarEvent[]>(() =>
        interviews.map(iv => {
            const start = parseISO(iv.scheduledAt);
            const duration = iv.durationMinutes || 45;
            const end = addMinutes(start, duration);
            return {
                id: iv._id,
                title: iv.studentName,
                start,
                end,
                resource: iv,
            };
        }),
        [interviews]
    );

    // ── Upcoming panel (today + tomorrow) ────────────────────────────────────
    const upcomingPills = useMemo(() => {
        const t: Interview[] = [];
        const tm: Interview[] = [];
        interviews.forEach(iv => {
            if (iv.status === 'CANCELLED') return;
            const d = parseISO(iv.scheduledAt);
            if (isToday(d)) t.push(iv);
            else if (isTomorrow(d)) tm.push(iv);
        });
        return { today: t, tomorrow: tm };
    }, [interviews]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const patchStatus = useCallback(async (id: string, status: InterviewStatus) => {
        setIsUpdating(true);
        try {
            await api.patch(`/interviews/${id}`, { status });
        } catch {
            // optimistic — update local query cache even if backend fails (demo)
        }
        queryClient.setQueryData<Interview[]>(['recruiterInterviews'], old =>
            (old || []).map(iv => iv._id === id ? { ...iv, status } : iv)
        );
        setIsUpdating(false);
        setIsDetailOpen(false);
        addToast(`Interview marked as ${STATUS_CONFIG[status].label}`, 'success');
    }, [queryClient, addToast]);

    const handleReschedule = useCallback(async () => {
        if (!selectedInterview || !rescheduleDate || !rescheduleTime) return;
        setIsUpdating(true);
        const newISO = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
        try {
            await api.patch(`/interviews/${selectedInterview._id}/reschedule`, { 
                scheduled_at: newISO,
                reason: rescheduleReason 
            });
            addToast('Interview rescheduled and candidate notified', 'success');
        } catch (e: any) { 
            // fallback for missing backend or mock
            addToast(e.response?.data?.message || 'Failed to reschedule via API (using mock)', 'error');
        }
        
        queryClient.setQueryData<Interview[]>(['recruiterInterviews'], old =>
            (old || []).map(iv => iv._id === selectedInterview._id ? { ...iv, scheduledAt: newISO, status: 'SCHEDULED' } : iv)
        );
        
        setIsUpdating(false);
        setIsRescheduleOpen(false);
        setIsDetailOpen(false);
    }, [selectedInterview, rescheduleDate, rescheduleTime, rescheduleReason, queryClient, addToast]);

    const openDetail = useCallback((iv: Interview) => {
        setSelectedInterview(iv);
        setIsDetailOpen(true);
    }, []);

    const openReschedule = useCallback(() => {
        if (!selectedInterview) return;
        const d = parseISO(selectedInterview.scheduledAt);
        setRescheduleDate(format(d, 'yyyy-MM-dd'));
        setRescheduleTime(format(d, 'HH:mm'));
        setRescheduleReason('');
        setIsRescheduleOpen(true);
    }, [selectedInterview]);

    // ── RBC Callbacks ─────────────────────────────────────────────────────────
    const onSelectEvent = useCallback((event: CalendarEvent) => {
        openDetail(event.resource);
    }, [openDetail]);

    const eventStyleGetter = useCallback((event: CalendarEvent) => {
        const iv = event.resource;
        let bg = STATUS_CONFIG[iv.status]?.calBg || '#6366f1';
        
        // If it's scheduled, color override by type if available
        if (iv.status === 'SCHEDULED' && iv.type) {
             bg = TYPE_COLORS[iv.type] || bg;
        }

        const isCompleted = iv.status === 'COMPLETED';
        const isCancelled = iv.status === 'CANCELLED';
        return {
            style: {
                backgroundColor: bg,
                borderColor: bg,
                borderRadius: '6px',
                opacity: isCancelled ? 0.5 : 1,
                textDecoration: isCancelled ? 'line-through' : 'none',
                color: 'white',
                fontSize: '12px',
                fontWeight: isCompleted ? '600' : '500',
                boxShadow: `0 2px 6px ${bg}60`,
            },
        };
    }, []);

    // ── Loading Skeleton ───────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="h-10 w-64 rounded bg-slate-200 animate-pulse" />
                <Card className="p-0 border-slate-200 overflow-hidden">
                    <SkeletonTable rows={6} cols={7} />
                </Card>
            </div>
        );
    }

    const todayCount = upcomingPills.today.length;
    const tomorrowCount = upcomingPills.tomorrow.length;

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-8">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">Interview Calendar</h1>
                    <p className="text-slate-500 m-0">Manage screenings, schedule rounds, and track outcomes.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Stats strip */}
                    <div className="flex items-center gap-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">
                            <span className="block text-xl font-black text-indigo-600 leading-none">{todayCount}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Today</span>
                        </div>
                        <div className="px-4 py-2.5 text-center">
                            <span className="block text-xl font-black text-slate-800 dark:text-white leading-none">{tomorrowCount}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tomorrow</span>
                        </div>
                    </div>
                    {/* View toggle */}
                    <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                        {(['week', 'day'] as View[]).map(v => (
                            <button
                                key={v}
                                onClick={() => setCurrentView(v)}
                                className={`px-4 py-2.5 text-sm font-bold flex items-center gap-1.5 transition-colors ${currentView === v ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                {v === 'week' ? <Columns size={15} /> : <LayoutGrid size={15} />}
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Upcoming Panel (Today + Tomorrow) ───────────────────────── */}
            {(upcomingPills.today.length > 0 || upcomingPills.tomorrow.length > 0) && (
                <div className="flex flex-col gap-3">
                    {upcomingPills.today.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Today</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
                                {upcomingPills.today.map(iv => (
                                    <UpcomingPill key={iv._id} interview={iv} onClick={() => openDetail(iv)} />
                                ))}
                            </div>
                        </div>
                    )}
                    {upcomingPills.tomorrow.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tomorrow</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
                                {upcomingPills.tomorrow.map(iv => (
                                    <UpcomingPill key={iv._id} interview={iv} onClick={() => openDetail(iv)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Calendar ────────────────────────────────────────────────── */}
            <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-700/60 shadow-md rbc-wrapper">
                <Calendar
                    localizer={localizer}
                    events={events}
                    view={currentView}
                    onView={setCurrentView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    onSelectEvent={onSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    style={{ height: 600 }}
                    popup
                    components={{
                        toolbar: (toolbarProps) => (
                            <CalendarToolbar
                                {...toolbarProps}
                                view={currentView}
                                onView={setCurrentView}
                            />
                        ),
                    }}
                />
            </Card>

            {/* ── Interview Detail Modal ───────────────────────────────────── */}
            {isDetailOpen && selectedInterview && (
                <InterviewDetailModal
                    interview={selectedInterview}
                    onClose={() => setIsDetailOpen(false)}
                    onReschedule={openReschedule}
                    onCancel={() => setIsCancelConfirmOpen(true)}
                    onStatusChange={(status) => patchStatus(selectedInterview._id, status)}
                    isUpdating={isUpdating}
                />
            )}

            {/* ── Reschedule Modal ─────────────────────────────────────────── */}
            {isRescheduleOpen && selectedInterview && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsRescheduleOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                            <CalendarClock size={20} className="text-indigo-500" />
                            Reschedule Interview
                        </h3>
                        <p className="text-sm text-slate-500 mb-5">
                            Rescheduling for <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedInterview.studentName}</span>
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Date</label>
                                <input
                                    type="date"
                                    value={rescheduleDate}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    onChange={e => setRescheduleDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Time</label>
                                <input
                                    type="time"
                                    value={rescheduleTime}
                                    onChange={e => setRescheduleTime(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reason for Reschedule (Optional)</label>
                                <textarea
                                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none dark:text-slate-200"
                                    placeholder="This will be included in the automated email sent to the candidate..."
                                    value={rescheduleReason}
                                    onChange={(e) => setRescheduleReason(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setIsRescheduleOpen(false)} className="flex-1">Cancel</Button>
                            <Button
                                variant="primary"
                                onClick={handleReschedule}
                                isLoading={isUpdating}
                                className="flex-1"
                                icon={CalendarClock}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Cancel Confirmation ──────────────────────────────────────── */}
            {isCancelConfirmOpen && selectedInterview && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsCancelConfirmOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <XCircle size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Cancel Interview?</h3>
                                <p className="text-sm text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg p-3 mb-5">
                            You are about to cancel the interview with <span className="font-bold">{selectedInterview.studentName}</span> for <span className="font-bold">{selectedInterview.jobTitle}</span>.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setIsCancelConfirmOpen(false)} className="flex-1">Go Back</Button>
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    setIsCancelConfirmOpen(false);
                                    await patchStatus(selectedInterview._id, 'CANCELLED');
                                }}
                                isLoading={isUpdating}
                                className="flex-1"
                            >
                                Cancel Interview
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Upcoming Pill Sub-component ───────────────────────────────────────────────
const UpcomingPill: React.FC<{ interview: Interview; onClick: () => void }> = ({ interview, onClick }) => {
    const isOnline = interview.location.includes('http');
    return (
        <button
            onClick={onClick}
            className="snap-start shrink-0 flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/60 rounded-xl px-4 py-3 shadow-sm transition-all hover:shadow-md group"
        >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                <User size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{interview.studentName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock size={11} />
                    {format(parseISO(interview.scheduledAt), 'h:mm a')}
                    <span className="mx-1 text-slate-300">•</span>
                    {isOnline ? <Video size={11} className="text-blue-500" /> : <MapPin size={11} />}
                    {isOnline ? 'Online' : interview.location}
                </p>
            </div>
        </button>
    );
};

// ── Interview Detail Modal ────────────────────────────────────────────────────
const InterviewDetailModal: React.FC<{
    interview: Interview;
    onClose: () => void;
    onReschedule: () => void;
    onCancel: () => void;
    onStatusChange: (status: InterviewStatus) => void;
    isUpdating: boolean;
}> = ({ interview, onClose, onReschedule, onCancel, onStatusChange, isUpdating }) => {
    const cfg = STATUS_CONFIG[interview.status];
    const isOnline = interview.location.includes('http');
    const start = parseISO(interview.scheduledAt);
    const end = addMinutes(start, interview.durationMinutes);
    const canAct = interview.status === 'SCHEDULED';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-3 pr-8">
                        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <User size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{interview.studentName}</h3>
                            <p className="text-white/70 text-sm">{interview.jobTitle}</p>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.label}
                        </span>
                    </div>

                    {/* Info rows */}
                    <InfoRow icon={<Clock size={16} className="text-indigo-500" />} label="Time">
                        {format(start, 'EEEE, MMM d • h:mm a')} – {format(end, 'h:mm a')} ({interview.durationMinutes || 45} min)
                    </InfoRow>
                    <InfoRow icon={<CalendarIcon size={16} className="text-purple-500" />} label="Type">
                        <span className="font-semibold" style={{ color: TYPE_COLORS[interview.type] || '#6366f1' }}>
                            {interview.type || 'Technical'}
                        </span>
                    </InfoRow>
                    <InfoRow icon={isOnline ? <Video size={16} className="text-blue-500" /> : <MapPin size={16} className="text-slate-500" />} label="Location">
                        {isOnline ? (
                            <a href={interview.location} target="_blank" rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline font-medium">
                                Join Meeting →
                            </a>
                        ) : interview.location}
                    </InfoRow>
                    <InfoRow icon={<User size={16} className="text-slate-500" />} label="Email">
                        {interview.studentEmail}
                    </InfoRow>

                    {/* Status actions */}
                    {canAct && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Outcome</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => onStatusChange('COMPLETED')}
                                    disabled={isUpdating}
                                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-sm border border-emerald-200 transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle2 size={15} /> Completed
                                </button>
                                <button
                                    onClick={() => onStatusChange('NO_SHOW')}
                                    disabled={isUpdating}
                                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-sm border border-amber-200 transition-colors disabled:opacity-50"
                                >
                                    <AlertTriangle size={15} /> No Show
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                {canAct && (
                    <div className="px-6 pb-6 flex gap-3">
                        <button
                            onClick={onReschedule}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm transition-colors"
                        >
                            <RefreshCw size={15} /> Reschedule
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors"
                        >
                            <XCircle size={15} /> Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Info Row helper ───────────────────────────────────────────────────────────
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{children}</p>
        </div>
    </div>
);

// ── Custom Toolbar ─────────────────────────────────────────────────────────────
const CalendarToolbar: React.FC<any> = ({ label, onNavigate }) => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                <button
                    onClick={() => onNavigate('PREV')}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    onClick={() => onNavigate('TODAY')}
                    className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 border-x border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    Today
                </button>
                <button
                    onClick={() => onNavigate('NEXT')}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 ml-1">
                <CalendarIcon size={18} className="text-indigo-500" />
                {label}
            </h2>
        </div>
    </div>
);

export default RecruiterInterviews;
