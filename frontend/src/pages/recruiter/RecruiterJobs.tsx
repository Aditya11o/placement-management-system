import React, { useState, useMemo, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import TagInput from '../../components/Input/TagInput';
import SkeletonList from '../../components/Skeleton/SkeletonList';
import Pagination from '../../components/Pagination/Pagination';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import {
    Briefcase, Plus, Users, Trash2, X, Copy,
    Clock, AlertTriangle, CalendarOff, CheckCircle2, TrendingUp, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Job } from '../../types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInDays, isPast, parseISO } from 'date-fns';

// ── Schema ────────────────────────────────────────────────────────────────────
const jobFormSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
    location: z.string().min(2, 'Location is required'),
    salary_min: z.coerce.number().min(0, 'Must be ≥ 0'),
    salary_max: z.coerce.number().positive('Max salary required'),
    eligible_branch: z.string().min(2, 'Eligible branches are required'),
    min_cgpa: z.coerce.number().min(0).max(10, 'Max CGPA is 10'),
    deadline: z.string().min(1, 'Deadline is required'),
    graduation_year: z.coerce.number().int().min(2000, 'Invalid year'),
    has_equity: z.boolean().default(false),
    has_bonus: z.boolean().default(false),
    is_featured: z.boolean().default(false)
}).refine(d => d.salary_max >= d.salary_min, {
    message: 'Max salary must be ≥ Min salary',
    path: ['salary_max']
});

type JobFormData = z.infer<typeof jobFormSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────
const SALARY_MAX_LIMIT = 100; // LPA slider max

/** Returns days until deadline string + badge variant */
const getDeadlineInfo = (deadline: string, status: string) => {
    if (status === 'CLOSED') return { label: 'Closed', variant: 'grey' as const, isExpiringSoon: false };
    const dl = parseISO(deadline);
    const now = new Date();
    
    if (isPast(dl)) return { label: 'Expired', variant: 'grey' as const, isExpiringSoon: false };
    
    const days = differenceInDays(dl, now);
    const isExpiringSoon = days < 3;

    if (days > 7) return { label: `Closes in ${days}d`, variant: 'green' as const, isExpiringSoon };
    if (days >= 3) return { label: `Closes in ${days}d \u26A0`, variant: 'amber' as const, isExpiringSoon };
    
    return { 
        label: days <= 0 ? (differenceInDays(dl, now) === 0 ? 'Closes today!' : 'Expiring Soon') : `${days}d left!`, 
        variant: 'red' as const, 
        isExpiringSoon: true 
    };
};

const deadlineBadgeClass = {
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
    grey: 'bg-slate-100 text-slate-500 border-slate-200',
};

// ── Component ─────────────────────────────────────────────────────────────────
const RecruiterJobs: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingJobId, setEditingJobId] = useState<string | null>(null); // null = new job

    // ── Salary slider display state ──────────────────────────────────────────
    const [salaryMin, setSalaryMin] = useState(4);
    const [salaryMax, setSalaryMax] = useState(20);
    const [page, setPage] = useState(1);
    const limit = 6; // Set a reasonable limit for production density

    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } =
        useForm<JobFormData>({
            resolver: zodResolver(jobFormSchema) as any,
            defaultValues: {
                title: '',
                description: '',
                requirements: [],
                location: '',
                salary_min: 4,
                salary_max: 20,
                eligible_branch: '',
                min_cgpa: 6,
                deadline: '',
                graduation_year: new Date().getFullYear(),
                has_equity: false,
                has_bonus: false,
                is_featured: false
            }
        });

    // ── Fetch jobs with pagination ──────────────────────────────────────────
    const { data, isLoading } = useQuery<{ jobs: Job[], total: number, totalPages: number }>({
        queryKey: ['recruiterJobs', page],
        queryFn: async () => {
            const res = await api.get(`/jobs/recruiter?page=${page}&limit=${limit}`);
            return {
                jobs: res.data.data,
                total: res.data.pagination.total,
                totalPages: res.data.pagination.pages
            };
        },
        refetchInterval: 60_000,
    });

    const jobs = data?.jobs || [];
    const totalPages = data?.totalPages || 0;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const openNewJobModal = useCallback(() => {
        setEditingJobId(null);
        setSalaryMin(4);
        setSalaryMax(20);
        reset({
            title: '', description: '', requirements: [], location: '',
            salary_min: 4, salary_max: 20, eligible_branch: '',
            min_cgpa: 6, deadline: '', graduation_year: new Date().getFullYear()
        });
        setIsModalOpen(true);
    }, [reset]);

    const openCloneModal = useCallback((job: Job) => {
        const { _id, created_at, applicationCount, ...rest } = job;
        reset({
            ...rest,
            title: `${job.title} (Clone)`,
            deadline: '',
            salary_min: job.salary_min || job.package_lpa,
            salary_max: job.salary_max || job.package_lpa,
            has_equity: job.has_equity || false,
            has_bonus: job.has_bonus || false,
            is_featured: job.is_featured || false
        } as any);
        setSalaryMin(job.salary_min || job.package_lpa);
        setSalaryMax(job.salary_max || job.package_lpa);
        setEditingJobId(null);
        setIsModalOpen(true);
    }, [reset]);



    const onSubmit = async (data: JobFormData) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                package_lpa: data.salary_max, // backward-compat: send max as package_lpa
            };
            await api.post('/jobs', payload);
            addToast('Job posted successfully!', 'success');
            setIsModalOpen(false);
            reset();
            queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to post job', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleJobStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
            await api.put(`/jobs/${id}`, { status: newStatus });
            addToast(`Job marked as ${newStatus}`, 'success');
            queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
        } catch {
            addToast('Failed to update job status', 'error');
        }
    };

    const deleteJob = async (id: string) => {
        if (!window.confirm('Delete this job post entirely?')) return;
        try {
            await api.delete(`/jobs/${id}`);
            addToast('Job deleted', 'success');
            queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
        } catch {
            addToast('Failed to delete job', 'error');
        }
    };

    // ── Salary slider fill track ──────────────────────────────────────────────
    const sliderFillStyle = useMemo(() => ({
        left: `${(salaryMin / SALARY_MAX_LIMIT) * 100}%`,
        right: `${100 - (salaryMax / SALARY_MAX_LIMIT) * 100}%`
    }), [salaryMin, salaryMax]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <ErrorBoundary>
            <div className="flex flex-col gap-8 animate-fade-in">
                {/* Page Header */}
                <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-700 mb-1">Manage Jobs</h1>
                        <p className="text-slate-500 text-base m-0">Create and oversee your company's placement drives.</p>
                    </div>
                    <Button variant="primary" icon={Plus} onClick={openNewJobModal}>Post New Job</Button>
                </div>

                {/* Job List */}
                {isLoading ? (
                    <SkeletonList count={5} />
                ) : (
                    <div className="flex flex-col gap-5">
                        {jobs.length === 0 ? (
                            <Card className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                                <Briefcase size={48} className="text-slate-400 mb-4 opacity-50" />
                                <h3 className="text-xl font-semibold mb-2 text-slate-700">No jobs posted yet</h3>
                                <p className="mb-6">Create your first listing to start receiving applications.</p>
                                <Button onClick={openNewJobModal}>Create Job</Button>
                            </Card>
                        ) : (
                            jobs.map(job => {
                                const deadlineInfo = getDeadlineInfo(job.deadline || '', job.status);
                                const appCount = job.applicationCount || 0;
                                return (
                                    <Card key={job._id} className={`p-6 border border-slate-200 transition-all hover:border-indigo-300 hover:shadow-md ${job.status === 'CLOSED' ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100 gap-4">
                                            <div className="flex flex-col min-w-0">
                                                <h3 className="text-xl font-bold text-indigo-700 mb-0.5 truncate">{job.title}</h3>
                                                <span className="text-sm text-slate-500">{job.location}</span>
                                            </div>

                                            {/* App Count Badge */}
                                            <div className="flex flex-col items-center bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 shrink-0 min-w-[70px]">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={14} className="text-indigo-500" />
                                                    <span className="text-xl font-black text-indigo-700 leading-none">{appCount}</span>
                                                </div>
                                                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide mt-0.5">
                                                    {appCount === 1 ? 'Applicant' : 'Applicants'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Meta Pills */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-semibold text-emerald-700">
                                                ₹{job.package_lpa} LPA
                                            </span>
                                            <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600">
                                                CGPA {job.min_cgpa}+
                                            </span>
                                            <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600">
                                                Batch {job.graduation_year}
                                            </span>
                                            <span className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border ${job.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {job.status}
                                            </span>
                                            {job.is_featured && (
                                                <span className="px-3 py-1.5 bg-orange-100 border border-orange-200 rounded-lg text-xs font-bold text-orange-700 flex items-center gap-1 animate-pulse">
                                                    <TrendingUp size={12} /> HOT JOB
                                                </span>
                                            )}
                                        </div>

                                        {/* Footer row */}
                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                            {/* Expiry Countdown Badge */}
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${deadlineBadgeClass[deadlineInfo.variant]}`}>
                                                {deadlineInfo.variant === 'green' && <CheckCircle2 size={13} />}
                                                {deadlineInfo.variant === 'amber' && <AlertTriangle size={13} />}
                                                {deadlineInfo.variant === 'red' && <Clock size={13} />}
                                                {deadlineInfo.variant === 'grey' && <CalendarOff size={13} />}
                                                {deadlineInfo.label}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openCloneModal(job)}
                                                    title="Duplicate this job"
                                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-colors"
                                                >
                                                    <Copy size={14} />
                                                    Duplicate
                                                </button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleJobStatus(job._id, job.status)}
                                                >
                                                    {job.status === 'ACTIVE' ? 'Close Drive' : 'Re-open'}
                                                </Button>

                                                <button
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-colors text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    onClick={() => navigate(`/recruiter/jobs/${job._id}/applicants`)}
                                                    title="View Applicants"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                <button
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-colors text-slate-400 hover:bg-red-50 hover:text-red-500"
                                                    onClick={() => deleteJob(job._id)}
                                                    title="Delete job"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        )}

                        {/* Pagination */}
                        <Pagination 
                            currentPage={page} 
                            totalPages={totalPages} 
                            onPageChange={setPage} 
                            isLoading={isLoading} 
                        />
                    </div>
                )}

                {/* ── Job Form Modal ─────────────────────────────────────────────── */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                            {/* Modal Header */}
                            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 m-0">
                                        {editingJobId ? 'Edit Job' : 'Post a New Job'}
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Fill in the details to publish your job.</p>
                                </div>
                                <button
                                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    onClick={() => { setIsModalOpen(false); reset(); }}
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1 space-y-6">

                                {/* Title + Location */}
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <div className="flex-1">
                                        <Input
                                            label="Job Title"
                                            placeholder="e.g. Software Engineer"
                                            {...register('title')}
                                            error={errors.title?.message}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            label="Location"
                                            placeholder="e.g. Bengaluru / Remote"
                                            {...register('location')}
                                            error={errors.location?.message}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Job Description
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        className={`w-full px-4 py-3 border rounded-xl font-sans text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 transition-all resize-y focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-700 ${errors.description ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-200 focus:border-indigo-400'}`}
                                        rows={5}
                                        placeholder="Describe the role, responsibilities, and what you offer…"
                                    />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                                </div>

                                {/* Requirements TagInput */}
                                <Controller
                                    name="requirements"
                                    control={control}
                                    render={({ field }) => (
                                        <TagInput
                                            label="Key Requirements (Press Enter or , to add)"
                                            placeholder="e.g. React, Node.js, AWS"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.requirements?.message}
                                        />
                                    )}
                                />

                                {/* Salary Range Slider */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Salary Range
                                        </label>
                                        <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-lg">
                                            ₹{salaryMin} – ₹{salaryMax} LPA
                                        </span>
                                    </div>
                                    <div className="relative h-6 flex items-center px-1">
                                        {/* Track background */}
                                        <div className="absolute inset-x-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                        {/* Filled range */}
                                        <div
                                            className="absolute h-2 bg-indigo-500 rounded-full pointer-events-none transition-all"
                                            style={sliderFillStyle}
                                        />
                                        {/* Min thumb */}
                                        <input
                                            type="range"
                                            min={0}
                                            max={SALARY_MAX_LIMIT}
                                            step={1}
                                            value={salaryMin}
                                            {...register('salary_min')}
                                            onChange={e => {
                                                const v = Math.min(Number(e.target.value), salaryMax - 1);
                                                setSalaryMin(v);
                                                setValue('salary_min', v, { shouldValidate: true });
                                            }}
                                            className="absolute inset-x-0 w-full appearance-none bg-transparent h-2 cursor-pointer range-thumb-indigo"
                                            style={{ zIndex: salaryMin > SALARY_MAX_LIMIT - 10 ? 5 : 3 }}
                                        />
                                        {/* Max thumb */}
                                        <input
                                            type="range"
                                            min={0}
                                            max={SALARY_MAX_LIMIT}
                                            step={1}
                                            value={salaryMax}
                                            {...register('salary_max')}
                                            onChange={e => {
                                                const v = Math.max(Number(e.target.value), salaryMin + 1);
                                                setSalaryMax(v);
                                                setValue('salary_max', v, { shouldValidate: true });
                                                (setValue as any)('package_lpa', v); // Sync package_lpa with max salary
                                            }}
                                            className="absolute inset-x-0 w-full appearance-none bg-transparent h-2 cursor-pointer range-thumb-indigo"
                                            style={{ zIndex: 4 }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                                        <span>₹0 LPA</span>
                                        <span>₹{SALARY_MAX_LIMIT} LPA</span>
                                    </div>
                                    {(errors.salary_min || errors.salary_max) && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.salary_max?.message || errors.salary_min?.message}
                                        </p>
                                    )}
                                </div>

                                {/* CGPA, Deadline, Grad Year row */}
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Min CGPA
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min={0}
                                                max={10}
                                                step={0.5}
                                                className="flex-1 accent-indigo-600"
                                                {...register('min_cgpa')}
                                                onChange={e => setValue('min_cgpa', Number(e.target.value), { shouldValidate: true })}
                                            />
                                            <span className="text-sm font-black text-indigo-700 w-10 text-right">
                                                {watch('min_cgpa')}
                                            </span>
                                        </div>
                                        {errors.min_cgpa && <p className="text-red-500 text-xs mt-1">{errors.min_cgpa.message}</p>}
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Application Deadline
                                        </label>
                                        <input
                                            type="date"
                                            {...register('deadline')}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 ${errors.deadline ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-200'}`}
                                        />
                                        {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>}
                                    </div>

                                    <div className="flex-1">
                                        <Input
                                            label="Target Graduation Year"
                                            type="number"
                                            {...register('graduation_year')}
                                            error={errors.graduation_year?.message}
                                        />
                                    </div>
                                </div>

                                {/* Eligible Branches */}
                                <div>
                                    <Input
                                        label="Eligible Branches (e.g. CSE, IT, ECE)"
                                        placeholder="CSE, IT, ECE"
                                        {...register('eligible_branch')}
                                        error={errors.eligible_branch?.message}
                                    />
                                </div>

                                {/* Benefit Toggles */}
                                <div className="flex flex-col sm:flex-row gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex-1 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Equity / ESOPs</p>
                                            <p className="text-xs text-slate-500">Includes stock options or equity</p>
                                        </div>
                                        <Controller
                                            name="has_equity"
                                            control={control}
                                            render={({ field }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(!field.value)}
                                                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${field.value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                >
                                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            )}
                                        />
                                    </div>
                                    <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-700" />
                                    <div className="flex-1 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Performance Bonus</p>
                                            <p className="text-xs text-slate-500">Includes annual variable pay</p>
                                        </div>
                                        <Controller
                                            name="has_bonus"
                                            control={control}
                                            render={({ field }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(!field.value)}
                                                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${field.value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                >
                                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Featured / Hot Job Toggle */}
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-orange-800 dark:text-orange-300">Mark as Hot Job</p>
                                            <p className="text-xs text-orange-600 dark:text-orange-400/70">Increases visibility and adds a "HOT" urgency badge.</p>
                                        </div>
                                    </div>
                                    <Controller
                                        name="is_featured"
                                        control={control}
                                        render={({ field }) => (
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(!field.value)}
                                                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${field.value ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                            >
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        )}
                                    />
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => { setIsModalOpen(false); reset(); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" isLoading={isSubmitting}>
                                        Publish Job
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default RecruiterJobs;
