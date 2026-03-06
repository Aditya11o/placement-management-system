import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, Event as CalendarEvent, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    Calendar as CalendarIcon,
    RefreshCw,
    Video,
    MapPin,
    CheckCircle,
    Clock,
    XCircle,
    User,
    Building,
    Briefcase,
    Filter
} from 'lucide-react';
import Button from '../../components/Button/Button';
import api from '../../services/api';

// Setup localizer for react-big-calendar using date-fns
const locales = {
    'en-US': enUS,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Map backend Interview shape to Calendar Event shape
interface Interview {
    _id: string;
    student_id: { _id: string; name: string; email: string; branch: string };
    recruiter_id: { _id: string; company_name: string; contact_person: string };
    job_id: { _id: string; title: string };
    scheduled_at: string;
    location_type: string;
    location_details: string;
    status: string;
    notes?: string;
}

interface MappedEvent extends CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Interview;
}

const AdminCalendar: React.FC = () => {
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState<Date>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<MappedEvent | null>(null);
    const [companyFilter, setCompanyFilter] = useState<string>('');
    const [branchFilter, setBranchFilter] = useState<string>('');

    // Fetch all interviews across the system
    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['adminInterviews'],
        queryFn: async () => {
            const res = await api.get('/admin/interviews?limit=1000'); // Assuming max 1000 active for now
            return res.data;
        }
    });

    // Map the raw data to the shape required by react-big-calendar
    const rawEvents: MappedEvent[] = data?.data?.map((iv: Interview) => {
        const startDate = new Date(iv.scheduled_at);
        // Defaulting interview duration to 1 hour
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

        return {
            id: iv._id,
            title: `${iv.recruiter_id?.company_name || 'Company'} - ${iv.student_id?.name || 'Student'}`,
            start: startDate,
            end: endDate,
            resource: iv
        };
    }) || [];

    // Apply Filters
    const events = rawEvents.filter(ev => {
        const matchCompany = companyFilter === '' || ev.resource.recruiter_id.company_name.toLowerCase().includes(companyFilter.toLowerCase());
        const matchBranch = branchFilter === '' || ev.resource.student_id.branch.toLowerCase().includes(branchFilter.toLowerCase());
        return matchCompany && matchBranch;
    });

    // Extract unique companies and branches for dropdowns organically from fetched data
    const uniqueCompanies = Array.from(new Set(rawEvents.map(e => e.resource.recruiter_id.company_name))).filter(Boolean);
    const uniqueBranches = Array.from(new Set(rawEvents.map(e => e.resource.student_id.branch))).filter(Boolean);

    // Custom styler for the events based on status
    const eventPropGetter = (event: MappedEvent) => {
        const status = event.resource.status;
        let className = 'rounded-md border-none px-2 py-0.5 text-xs font-semibold shadow-sm transition-all hover:brightness-110';

        switch (status) {
            case 'CONFIRMED':
            case 'COMPLETED':
                className += ' bg-emerald-500 text-white';
                break;
            case 'PROPOSED':
                className += ' bg-amber-500 text-white';
                break;
            case 'REJECTED':
            case 'CANCELED':
                className += ' bg-red-500 text-white opacity-60';
                break;
            default:
                className += ' bg-indigo-500 text-white';
        }

        return { className };
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'PROPOSED': return <Clock size={16} className="text-amber-500" />;
            case 'REJECTED':
            case 'CANCELED': return <XCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-indigo-500" />;
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-[1400px] mx-auto w-full h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex justify-between items-start flex-wrap gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <CalendarIcon size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white m-0 tracking-tight">Unified Calendar</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0">Centralized view of all scheduled interviews globally.</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative group">
                        <Button
                            variant="secondary"
                            icon={CalendarIcon}
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        >
                            Sync Settings
                        </Button>
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-[60] invisible group-hover:visible animate-fade-in">
                            <h4 className="text-xs font-bold text-slate-400 uppercase p-2 tracking-wider">Cloud Calendar Sync</h4>
                            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">G</div>
                                Connect Google Calendar
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer opacity-50 grayscale cursor-not-allowed">
                                <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">O</div>
                                Microsoft Outlook (Coming)
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            value={companyFilter}
                            onChange={(e) => setCompanyFilter(e.target.value)}
                            className="bg-transparent text-sm border-none focus:ring-0 text-slate-600 dark:text-slate-300 w-32 md:w-40 py-1"
                        >
                            <option value="">All Companies</option>
                            {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <select
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            className="bg-transparent text-sm border-none focus:ring-0 text-slate-600 dark:text-slate-300 w-32 md:w-36 py-1"
                        >
                            <option value="">All Branches</option>
                            {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hidden lg:flex">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Confirmed</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Proposed</span>
                    </div>
                    <Button
                        variant="ghost"
                        icon={RefreshCw}
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className={isFetching ? 'animate-spin' : ''}
                    >
                        Sync
                    </Button>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-4 relative flex">

                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-indigo-600">
                            <RefreshCw className="animate-spin" size={32} />
                            <span className="font-bold tracking-widest text-sm">LOADING SCHEDULE...</span>
                        </div>
                    </div>
                )}

                <div className={`flex-1 transition-all duration-300 ${selectedEvent ? 'lg:w-2/3 lg:pr-4' : 'w-full'}`}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        eventPropGetter={eventPropGetter}
                        onSelectEvent={setSelectedEvent}
                        popup
                        selectable
                        className="custom-calendar global-admin-calendar font-sans"
                        messages={{
                            next: "Next",
                            previous: "Prev",
                            today: "Today",
                            month: "Month",
                            week: "Week",
                            day: "Day"
                        }}
                    />
                </div>

                {/* Event Details Sidebar */}
                {selectedEvent && (
                    <div className="hidden lg:flex flex-col w-1/3 border-l border-slate-100 dark:border-slate-800 pl-6 animate-slide-in-right overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white m-0">Interview Details</h3>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Status Header */}
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <StatusIcon status={selectedEvent.resource.status} />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800 dark:text-white">{selectedEvent.resource.status}</span>
                                    <span className="text-xs text-slate-500">
                                        {format(new Date(selectedEvent.resource.scheduled_at), "EEEE, MMMM do yyyy 'at' h:mm a")}
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                            {/* Company & Job */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                                    <Building size={20} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Recruiter</span>
                                    <span className="text-base font-bold text-slate-800 dark:text-white truncate">
                                        {selectedEvent.resource.recruiter_id?.company_name || 'N/A'}
                                    </span>
                                    <span className="text-sm text-slate-500 truncate flex items-center gap-1.5 mt-1">
                                        <Briefcase size={14} /> {selectedEvent.resource.job_id?.title || 'Unknown Role'}
                                    </span>
                                </div>
                            </div>

                            {/* Student */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                                    <User size={20} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Candidate</span>
                                    <span className="text-base font-bold text-slate-800 dark:text-white truncate">
                                        {selectedEvent.resource.student_id?.name || 'N/A'}
                                    </span>
                                    <span className="text-sm text-slate-500 truncate">
                                        {selectedEvent.resource.student_id?.branch || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                                    {selectedEvent.resource.location_type === 'VIRTUAL' ? <Video size={20} /> : <MapPin size={20} />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                                        {selectedEvent.resource.location_type} LOCATION
                                    </span>
                                    {selectedEvent.resource.location_type === 'VIRTUAL' ? (
                                        <a href={selectedEvent.resource.location_details} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 break-all underline-offset-2 hover:underline">
                                            {selectedEvent.resource.location_details}
                                        </a>
                                    ) : (
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 break-words">
                                            {selectedEvent.resource.location_details}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedEvent.resource.notes && (
                                <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-4">
                                    <span className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-2 block">Notes</span>
                                    <p className="text-sm text-amber-900/80 dark:text-amber-200/70 m-0 leading-relaxed">
                                        {selectedEvent.resource.notes}
                                    </p>
                                </div>
                            )}

                        </div>

                        {/* Mobile Close Button Container (Only visible if we make it modal on mobile later) */}
                        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 hidden">
                            <Button isFullWidth variant="secondary" onClick={() => setSelectedEvent(null)}>Close Details</Button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                /* Override react-big-calendar defaults for modern look */
                .global-admin-calendar .rbc-header {
                    padding: 12px 8px;
                    font-weight: 700;
                    color: var(--color-slate-500);
                    border-bottom: 1px solid var(--color-slate-200);
                }
                .dark .global-admin-calendar .rbc-header {
                    color: var(--color-slate-400);
                    border-bottom-color: var(--color-slate-800);
                }
                .global-admin-calendar .rbc-today {
                    background-color: var(--color-indigo-50);
                }
                .dark .global-admin-calendar .rbc-today {
                    background-color: rgba(99, 102, 241, 0.1); /* indigo-500/10 */
                }
                .global-admin-calendar .rbc-event {
                    padding: 2px 6px;
                }
                .global-admin-calendar .rbc-off-range-bg {
                    background-color: var(--color-slate-50);
                }
                .dark .global-admin-calendar .rbc-off-range-bg {
                    background-color: rgba(15, 23, 42, 0.5); /* slate-900/50 */
                }
                .global-admin-calendar .rbc-month-view,
                .global-admin-calendar .rbc-time-view {
                    border-radius: 12px;
                    border: 1px solid var(--color-slate-200);
                    overflow: hidden;
                }
                .dark .global-admin-calendar .rbc-month-view,
                .dark .global-admin-calendar .rbc-time-view {
                    border-color: var(--color-slate-800);
                }
                .global-admin-calendar .rbc-day-bg + .rbc-day-bg,
                .global-admin-calendar .rbc-month-row + .rbc-month-row {
                    border-color: var(--color-slate-200);
                }
                .dark .global-admin-calendar .rbc-day-bg + .rbc-day-bg,
                .dark .global-admin-calendar .rbc-month-row + .rbc-month-row {
                    border-color: var(--color-slate-800);
                }
                .global-admin-calendar .rbc-toolbar button {
                    border-radius: 8px;
                    color: var(--color-slate-600);
                    border-color: var(--color-slate-200);
                }
                .global-admin-calendar .rbc-toolbar button.rbc-active {
                    background-color: var(--color-indigo-600);
                    color: white;
                    border-color: var(--color-indigo-600);
                    box-shadow: none;
                }
                .dark .global-admin-calendar .rbc-toolbar button {
                    color: var(--color-slate-300);
                    border-color: var(--color-slate-700);
                }
                .dark .global-admin-calendar .rbc-toolbar button:hover {
                    background-color: var(--color-slate-800);
                }
                .dark .global-admin-calendar .rbc-toolbar button.rbc-active {
                    background-color: var(--color-indigo-500);
                    border-color: var(--color-indigo-500);
                }
            `}</style>
        </div>
    );
};

export default AdminCalendar;
