import React, { useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';
import SkeletonJobCard from '../../components/Skeleton/SkeletonJobCard';
import { Search } from 'lucide-react';
import JobModal, { UIJob } from '../../components/JobModal/JobModal';
import { useDebounce } from '../../hooks/useDebounce';
import { studentService } from '../../services/studentService';
import EmptyState from '../../components/EmptyState/EmptyState';
import PageHeader from '../../components/PageHeader/PageHeader';

import { motion, Variants, useInView } from 'framer-motion';
import { useRef, useEffect, useCallback, useMemo } from 'react';
import JobCard from './components/JobCard';
import JobFilters from './components/JobFilters';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];

const JobBoard: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

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
        isFetching, 
        isFetchingNextPage, 
        fetchNextPage, 
        hasNextPage 
    } = useInfiniteQuery({
        queryKey: ['studentJobs', debouncedSearchTerm, selectedTypes, minSalary, locationSearch, sortBy],
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
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="flex flex-col gap-6 relative">
            <PageHeader
                title="Job Board"
                subtitle="Discover career opportunities from top companies."
            />

            <div className="flex flex-col lg:flex-row gap-8 relative">

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
                    }}
                    jobTypes={JOB_TYPES}
                />

                {/* ─── MAIN GRID AREA ─────────────────────────────────────────── */}
                <div className="flex flex-col flex-1 w-full min-w-0 gap-6 relative">

                    {/* Top Row: Search & Sort */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 z-10 w-full bg-slate-50 dark:bg-slate-900 sticky top-0 py-2">
                        {/* Search Input */}
                        <div className="relative w-full sm:max-w-[400px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by job title..."
                                className="w-full py-2.5 pr-4 pl-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[15px] text-slate-800 dark:text-slate-200 shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); }}
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); }}
                                className="py-2.5 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[14px] text-slate-800 dark:text-slate-200 font-medium shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[center_right_10px]"
                            >
                                <option value="-createdAt">Newest First</option>
                                <option value="-salary_package">Highest Salary</option>
                                <option value="deadline">Deadline Approaching</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading Overlay when fetching new data for filters */}
                    {isFetching && !isLoading && (
                        <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 rounded-xl flex items-start justify-center pt-24">
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-indigo-500">
                                <Loader />
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <SkeletonJobCard count={6} />
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            {jobs.length === 0 ? (
                                <div className="col-span-1 md:col-span-2 xl:col-span-3">
                                    <EmptyState 
                                        illustration="/src/assets/illustrations/empty_jobs.png"
                                        title="No matching jobs found"
                                        description="Try adjusting your filters, location, or search terms to find more opportunities."
                                        actionLabel="Clear All Filters"
                                        onAction={() => {
                                            setSelectedTypes([]); setMinSalary(0); setLocationSearch(''); setSearchTerm('');
                                        }}
                                    />
                                </div>
                            ) : (
                                jobs.map((job: UIJob) => (
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
                                    />
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Infinite Scroll Sentinel */}
                    <div ref={observerRef} className="w-full h-8 flex items-center justify-center mt-4">
                        {isFetchingNextPage && (
                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide">
                                <Loader />
                                <span>Loading more opportunities...</span>
                            </div>
                        )}
                        {!hasNextPage && jobs.length > 0 && (
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">You've reached the end of the board</p>
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
