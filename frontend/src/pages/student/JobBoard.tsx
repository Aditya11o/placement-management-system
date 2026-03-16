import React, { useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';
import SkeletonJobCard from '../../components/Skeleton/SkeletonJobCard';
import { Search, Grid, List, Sparkles, Zap, Briefcase as BriefcaseIcon, IndianRupee } from 'lucide-react';
import JobModal, { UIJob } from '../../components/JobModal/JobModal';
import { useDebounce } from '../../hooks/useDebounce';
import { studentService } from '../../services/studentService';
import EmptyState from '../../components/EmptyState/EmptyState';
import PageHeader from '../../components/PageHeader/PageHeader';

import { motion, Variants, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useCallback, useMemo } from 'react';
import JobCard from './components/JobCard';
import JobFilters from './components/JobFilters';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];

const JobBoard: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    // Layout & View State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

    // Pagination & General State
    const limit = 12;
    const observerRef = useRef<HTMLDivElement>(null);
    const isBottomVisible = useInView(observerRef);
    const [applyingTo, setApplyingTo] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<UIJob | null>(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [minSalary, setMinSalary] = useState<number>(0);
    const [locationSearch, setLocationSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('-createdAt');
    const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const handleTypeToggle = useCallback((type: string) => {
        setSelectedTypes(prev => {
            const isSelected = prev.includes(type);
            if (isSelected) return prev.filter(t => t !== type);
            return [...prev, type];
        });
    }, []);

    const { 
        data: infiniteData, 
        isLoading, 
        isFetchingNextPage, 
        fetchNextPage, 
        hasNextPage 
    } = useInfiniteQuery({
        queryKey: ['studentJobs', debouncedSearchTerm, selectedTypes, minSalary, locationSearch, sortBy, activeQuickFilter],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams({
                page: (pageParam as number).toString(),
                limit: limit.toString(),
                sort: sortBy,
            });

            if (selectedTypes.length > 0) {
                selectedTypes.forEach(t => params.append('type[in]', t));
            }
            if (minSalary > 0) {
                params.append('salary_package[gte]', minSalary.toString());
            }
            if (locationSearch.trim()) {
                params.append('location[regex]', locationSearch.trim());
                params.append('location[options]', 'i');
            }
            if (debouncedSearchTerm.trim()) {
                params.append('title[regex]', debouncedSearchTerm.trim());
                params.append('title[options]', 'i');
            }

            // Quick Filters Logic
            if (activeQuickFilter === 'Remote') {
                params.append('location[regex]', 'Remote');
                params.append('location[options]', 'i');
            } else if (activeQuickFilter === 'Internship') {
                params.append('type', 'Internship');
            } else if (activeQuickFilter === 'High Salary') {
                params.append('salary_package[gte]', '15');
            }

            return await studentService.getEligibleJobs(params);
        },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage.total) return undefined;
            const totalPages = Math.ceil(lastPage.total / limit);
            const nextPage = allPages.length + 1;
            return nextPage <= totalPages ? nextPage : undefined;
        },
        initialPageParam: 1,
    });

    useEffect(() => {
        if (isBottomVisible && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isBottomVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Fetch Student Profile for Match Breakdown
    const { data: profileData } = useQuery({
        queryKey: ['studentProfile'],
        queryFn: () => studentService.getProfile(),
        enabled: true,
    });
    const studentProfile = profileData?.data;

    // Fetch Full Job Details (including matchScore) when selected
    const { data: jobDetailsResponse } = useQuery({
        queryKey: ['jobDetails', selectedJob?._id],
        queryFn: () => studentService.getJobById(selectedJob!._id),
        enabled: !!selectedJob,
        staleTime: 60000,
    });

    const prefetchJob = useCallback((jobId: string) => {
        queryClient.prefetchQuery({
            queryKey: ['jobDetails', jobId],
            queryFn: () => studentService.getJobById(jobId),
            staleTime: 60000,
        });
    }, [queryClient]);

    const enrichedJob = jobDetailsResponse?.success ? { ...selectedJob, ...jobDetailsResponse.data, matchScore: (jobDetailsResponse as any).matchScore } as UIJob : selectedJob;

    const jobs: UIJob[] = useMemo(() => 
        infiniteData?.pages.flatMap(page => page.data) || [], 
    [infiniteData]);

    const handleApply = useCallback(async (jobId: string) => {
        setApplyingTo(jobId);
        try {
            await studentService.applyForJob(jobId);
            addToast('Successfully applied to job!', 'success');
            queryClient.invalidateQueries({ queryKey: ['studentJobs'] });
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to apply. Check if you have an active resume.', 'error');
        } finally {
            setApplyingTo(null);
        }
    }, [addToast, queryClient]);

    const toggleSaveJob = useCallback((jobId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedJobs(prev => {
            const next = new Set(prev);
            if (next.has(jobId)) {
                next.delete(jobId);
                addToast('Job removed from saved list', 'info');
            } else {
                next.add(jobId);
                addToast('Job saved successfully!', 'success');
            }
            return next;
        });
    }, [addToast]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } }
    };

    const quickFilters = [
        { label: 'Remote', icon: Zap },
        { label: 'Internship', icon: BriefcaseIcon },
        { label: 'High Salary', icon: IndianRupee },
        { label: 'AI Matched', icon: Sparkles },
    ];

    return (
        <div className="flex flex-col gap-8 relative pb-20">
            <PageHeader
                title="Career Opportunities"
                subtitle="Your AI-powered bridge to the world's most innovative companies."
            />

            <div className="flex flex-col lg:flex-row gap-10 relative">

                {/* ─── SIDEBAR FILTERS ───────────────────────────────────────── */}
                <JobFilters 
                    selectedTypes={selectedTypes}
                    onTypeToggle={handleTypeToggle}
                    minSalary={minSalary}
                    setMinSalary={setMinSalary}
                    locationSearch={locationSearch}
                    setLocationSearch={setLocationSearch}
                    searchTerm={searchTerm}
                    onClearAll={() => {
                        setSelectedTypes([]);
                        setMinSalary(0);
                        setLocationSearch('');
                        setSearchTerm('');
                        setActiveQuickFilter(null);
                    }}
                    jobTypes={JOB_TYPES}
                />

                {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────── */}
                <div className="flex flex-col flex-1 w-full min-w-0 gap-8 relative">

                    {/* Top Control Bar */}
                    <div className="flex flex-col gap-6 sticky top-0 z-20 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl py-4 -mt-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Command Search */}
                            <div className="relative w-full md:max-w-2xl group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 group-focus-within:scale-110 transition-all duration-300" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by role, skill, or company..."
                                    className="w-full py-4 pr-6 pl-14 rounded-2xl border-none bg-white dark:bg-slate-800 text-[16px] text-slate-800 dark:text-slate-200 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all focus:ring-4 focus:ring-indigo-500/10 outline-none placeholder:text-slate-400 font-medium"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); }}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                    <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 text-[10px] font-medium text-slate-400">
                                        <span className="text-xs">⌘</span>K
                                    </kbd>
                                </div>
                            </div>

                            {/* View & Sort Controls */}
                            <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-end">
                                {/* Layout Toggle */}
                                <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <button 
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>

                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); }}
                                    className="py-3 pl-5 pr-12 rounded-xl border-none bg-white dark:bg-slate-800 text-[14px] text-slate-600 dark:text-slate-300 font-bold shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[center_right_15px] cursor-pointer"
                                >
                                    <option value="-createdAt">NEWEST FIRST</option>
                                    <option value="-salary_package">HIGHEST SALARY</option>
                                    <option value="deadline">ENDING SOON</option>
                                </select>
                            </div>
                        </div>

                        {/* Quick Filter Chips */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-2">Quick Filter:</span>
                            {quickFilters.map((filter) => {
                                const Icon = filter.icon;
                                const isActive = activeQuickFilter === filter.label;
                                return (
                                    <button
                                        key={filter.label}
                                        onClick={() => setActiveQuickFilter(isActive ? null : filter.label)}
                                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
                                            isActive 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105' 
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600'
                                        }`}
                                    >
                                        <Icon size={14} className={isActive ? 'animate-pulse' : ''} />
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Results Count & Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-50 bg-slate-200 animate-pulse" />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-slate-500">
                                <span className="text-indigo-600 dark:text-indigo-400">{jobs.length}</span> opportunities found for you
                            </span>
                        </div>
                    </div>

                    {/* Results Display */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="skeleton"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <SkeletonJobCard count={6} />
                                </motion.div>
                            ) : jobs.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="pt-12"
                                >
                                    <EmptyState 
                                        variant="jobs"
                                        title="No Opportunities Match Your Current Search"
                                        description="We couldn't find any roles matching your exact filters. Try broadening your search or adjusting the salary range."
                                        actionLabel="Reset Search Engine"
                                        onAction={() => {
                                            setSelectedTypes([]); setMinSalary(0); setLocationSearch(''); setSearchTerm(''); setActiveQuickFilter(null);
                                        }}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={viewMode}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className={viewMode === 'grid' 
                                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
                                        : "flex flex-col gap-4"
                                    }
                                >
                                    {jobs.map((job: UIJob) => (
                                        <JobCard 
                                            key={job._id}
                                            job={job}
                                            onApply={handleApply}
                                            onToggleSave={toggleSaveJob}
                                            onSelect={setSelectedJob}
                                            onPrefetch={prefetchJob}
                                            isApplying={applyingTo === job._id}
                                            isSaved={savedJobs.has(job._id)}
                                            variants={itemVariants}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Infinite Scroll Sentinel */}
                    <div ref={observerRef} className="w-full h-12 flex items-center justify-center mt-8">
                        {isFetchingNextPage && (
                            <div className="flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-widest">
                                <Loader />
                                <span>Syncing more opportunities...</span>
                            </div>
                        )}
                        {!hasNextPage && jobs.length > 0 && (
                            <div className="flex flex-col items-center gap-4 py-8 border-t border-slate-100 dark:border-slate-800 w-full">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">End of Transmission</p>
                                <div className="h-1.5 w-12 bg-indigo-500/20 rounded-full" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Job Details Slide-over Panel */}
            <JobModal
                isOpen={!!selectedJob}
                job={enrichedJob}
                studentProfile={studentProfile}
                onClose={() => setSelectedJob(null)}
                onApply={handleApply}
                isApplying={applyingTo === selectedJob?._id}
            />
        </div>
    );
};

export default JobBoard;
