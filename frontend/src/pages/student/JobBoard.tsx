import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { Search, MapPin, Building, Calendar, DollarSign, Send, CheckCircle, ChevronLeft, ChevronRight, Filter, Briefcase } from 'lucide-react';
import api from '../../services/api';
import JobModal, { UIJob } from '../../components/JobModal/JobModal';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];

const JobBoard: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    // Pagination & General State
    const [page, setPage] = useState(1);
    const limit = 12;
    const [applyingTo, setApplyingTo] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<UIJob | null>(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [minSalary, setMinSalary] = useState<number>(0);
    const [locationSearch, setLocationSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('-createdAt');

    const handleTypeToggle = (type: string) => {
        setSelectedTypes(prev => {
            const isSelected = prev.includes(type);
            if (isSelected) return prev.filter(t => t !== type);
            return [...prev, type];
        });
        setPage(1); // Reset page on filter change
    };

    const { data: queryData, isLoading, isFetching } = useQuery({
        queryKey: ['studentJobs', page, searchTerm, selectedTypes, minSalary, locationSearch, sortBy],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort: sortBy,
            });

            if (selectedTypes.length > 0) {
                // Duplicate keys for array filtering natively handled by URLSearchParams
                selectedTypes.forEach(t => params.append('type[in]', t));
            }
            if (minSalary > 0) {
                params.append('salary_package[gte]', minSalary.toString());
            }
            if (locationSearch.trim()) {
                params.append('location[regex]', locationSearch.trim());
                params.append('location[options]', 'i');
            }
            if (searchTerm.trim()) {
                // Our backend might use title for direct search
                params.append('title[regex]', searchTerm.trim());
                params.append('title[options]', 'i');
            }

            const res = await api.get(`/jobs?${params.toString()}`);
            return res.data;
        },
        // Keep previous data while fetching new to avoid harsh loading flickers
        placeholderData: (prev) => prev
    });

    const jobs: UIJob[] = queryData?.data || [];
    const totalPages = queryData?.total ? Math.ceil(queryData.total / limit) : 1;

    const handleApply = async (jobId: string) => {
        setApplyingTo(jobId);
        try {
            await api.post('/applications', { job: jobId });
            addToast('Successfully applied to job!', 'success');
            queryClient.invalidateQueries({ queryKey: ['studentJobs'] });
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to apply. Check if you have an active resume.', 'error');
        } finally {
            setApplyingTo(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative">
            <div>
                <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1">Job Discovery Board</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base m-0">Find and apply to the latest placement opportunities.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start relative w-full">

                {/* ─── SIDEBAR FILTERS ───────────────────────────────────────── */}
                <aside className="w-full lg:w-[280px] shrink-0 sticky top-4 z-10 transition-all duration-300">
                    <Card className="p-5 flex flex-col gap-7 shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <Filter size={20} className="text-indigo-600 dark:text-indigo-400" />
                                <h2 className="font-bold text-lg m-0 text-slate-800 dark:text-slate-100">Filters</h2>
                            </div>
                            {(selectedTypes.length > 0 || minSalary > 0 || locationSearch || searchTerm) && (
                                <button
                                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300"
                                    onClick={() => {
                                        setSelectedTypes([]);
                                        setMinSalary(0);
                                        setLocationSearch('');
                                        setSearchTerm('');
                                        setPage(1);
                                    }}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Job Roles Filter */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-xs tracking-wider uppercase opacity-80">Job Type</h3>
                            <div className="flex flex-col gap-2.5">
                                {JOB_TYPES.map(type => (
                                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-300 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-800/50 transition-colors group-hover:border-indigo-400">
                                            <input
                                                type="checkbox"
                                                className="absolute opacity-0 cursor-pointer w-full h-full z-10"
                                                checked={selectedTypes.includes(type)}
                                                onChange={() => handleTypeToggle(type)}
                                            />
                                            {selectedTypes.includes(type) && (
                                                <div className="absolute inset-0 bg-indigo-500 flex items-center justify-center text-white p-0.5 pointer-events-none">
                                                    <svg viewBox="0 0 14 14" fill="none"><path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[15px] transition-colors ${selectedTypes.includes(type) ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Salary Slider */}
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-xs tracking-wider uppercase opacity-80">Min Salary</h3>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded text-sm">
                                    {minSalary > 0 ? `₹${minSalary}L+` : 'Any'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="1"
                                value={minSalary}
                                onChange={(e) => { setMinSalary(Number(e.target.value)); setPage(1); }}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                <span>₹0L</span>
                                <span>₹50L+</span>
                            </div>
                        </div>

                        {/* Location Text Search */}
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-xs tracking-wider uppercase opacity-80">Location</h3>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="e.g. Bangalore, Remote"
                                    className="w-full py-2.5 pr-3 pl-9 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-[14px] text-slate-800 dark:text-slate-200 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                    value={locationSearch}
                                    onChange={(e) => { setLocationSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                    </Card>
                </aside>

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
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
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
                        <div className="mt-12"><Loader /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {jobs.length === 0 ? (
                                <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50">
                                    <Briefcase size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">No matching jobs found</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters, location, or search terms to find more opportunities.</p>
                                    <Button variant="secondary" className="mt-6" onClick={() => {
                                        setSelectedTypes([]); setMinSalary(0); setLocationSearch(''); setSearchTerm(''); setPage(1);
                                    }}>Clear All Filters</Button>
                                </div>
                            ) : (
                                jobs.map(job => (
                                    <Card key={job._id} className="flex flex-col h-full p-6 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 group bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/60">
                                        <div className="flex items-start gap-4 mb-5 relative">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-500/20 dark:to-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold shrink-0 border border-slate-100 dark:border-indigo-500/20 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                {job.company?.company_name?.charAt(0) || 'C'}
                                            </div>
                                            <div className="grow pr-16 min-w-0">
                                                <h3 className="text-[17px] mb-1 text-slate-900 dark:text-slate-50 leading-snug font-bold truncate" title={job.title}>{job.title}</h3>
                                                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                    <Building size={14} className="text-slate-400 dark:text-slate-500" />
                                                    <span className="truncate max-w-[120px]" title={job.company?.company_name}>{job.company?.company_name || 'Unknown'}</span>
                                                </span>
                                            </div>
                                            {job.status === 'ACTIVE' ? (
                                                <span className="absolute top-0 right-0 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 tracking-wider">Open</span>
                                            ) : (
                                                <span className="absolute top-0 right-0 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 tracking-wider">Closed</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2.5 mb-5 pb-5 border-b border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-[14px]">
                                                <div className="flex items-center gap-2 max-w-[50%]">
                                                    <MapPin size={16} className="text-slate-400 shrink-0" />
                                                    <span className="truncate">{job.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-400">
                                                    <DollarSign size={16} className="shrink-0" />
                                                    <span>₹{job.salary_package} LPA</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[13px] mt-1">
                                                <Calendar size={14} className="shrink-0" />
                                                <span>Apply Before: <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(job.deadline).toLocaleDateString()}</span></span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6 grow content-start">
                                            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold text-slate-600 dark:text-slate-300">Min CGPA: {job.min_cgpa}</div>
                                            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold text-slate-600 dark:text-slate-300">{job.type}</div>
                                        </div>

                                        <div className="flex gap-3 mt-auto">
                                            <div className="flex-1"><Button isFullWidth variant="ghost" size="sm" onClick={() => setSelectedJob(job)}>Details</Button></div>
                                            <div className="flex-1">
                                                <Button
                                                    isFullWidth
                                                    variant={job.hasApplied ? 'secondary' : 'primary'}
                                                    size="sm"
                                                    onClick={() => handleApply(job._id)}
                                                    disabled={job.status !== 'ACTIVE' || applyingTo === job._id || job.hasApplied}
                                                    isLoading={applyingTo === job._id}
                                                    icon={job.hasApplied ? CheckCircle : Send}
                                                    className="shadow-sm"
                                                >
                                                    {job.hasApplied ? 'Applied' : 'Apply'}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex items-center justify-between sm:justify-center gap-4 mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                            <button
                                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                                disabled={page === 1}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all ${page === 1 ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow active:scale-95'}`}
                            >
                                <ChevronLeft size={18} /> Prev
                            </button>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Page {page} of {totalPages}
                                </span>
                            </div>
                            <button
                                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                                disabled={page === totalPages}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all ${page === totalPages ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow active:scale-95'}`}
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Job Details Slide-over Panel */}
            <JobModal
                isOpen={!!selectedJob}
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                onApply={handleApply}
                isApplying={applyingTo === selectedJob?._id}
            />
        </div>
    );
};

export default JobBoard;
