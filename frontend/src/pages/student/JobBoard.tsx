import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { Search, MapPin, Building, Calendar, DollarSign, Send, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { Job } from '../../types';

// Extended Job interface specifically for the UI state
interface UIJob extends Job {
    company?: { company_name: string };
    salary_package?: string;
    min_cgpa?: number;
    eligible_branch?: string;
    hasApplied?: boolean;
}

const JobBoard: React.FC = () => {
    const { addToast } = useToast();
    const [jobs, setJobs] = useState<UIJob[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [applyingTo, setApplyingTo] = useState<string | null>(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data.data);
        } catch (error) {
            addToast('Failed to load jobs', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async (jobId: string) => {
        setApplyingTo(jobId);
        try {
            await api.post('/applications', { job: jobId });
            addToast('Successfully applied to job!', 'success');
            // Update local state to show 'Applied'
            setJobs(jobs.map(j => j._id === jobId ? { ...j, hasApplied: true } : j));
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to apply. Check if you have an active resume.', 'error');
        } finally {
            setApplyingTo(null);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">Job Discovery Board</h1>
                    <p className="text-slate-500 text-base m-0">Find and apply to the latest placement opportunities.</p>
                </div>
                <div className="relative w-full max-w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search jobs by title or company..."
                        className="w-full py-3.5 pr-4 pl-11 rounded-full border border-slate-300 bg-white shadow-sm font-sans text-[15px] transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredJobs.length === 0 ? (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center p-8 text-slate-500 italic bg-white rounded-xl shadow-sm border border-slate-200">
                            <p>No jobs found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <Card key={job._id} className="flex flex-col h-full p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start gap-4 mb-5 relative">
                                    <div className="w-12 h-12 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold shrink-0">
                                        {job.company?.company_name?.charAt(0) || 'C'}
                                    </div>
                                    <div className="grow pr-16">
                                        <h3 className="text-lg mb-1 text-slate-900 leading-snug font-bold overflow-hidden text-ellipsis whitespace-nowrap" title={job.title}>{job.title}</h3>
                                        <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                            <Building size={14} className="text-slate-400" /> <span className="truncate max-w-[120px]" title={job.company?.company_name}>{job.company?.company_name || 'Unknown Company'}</span>
                                        </span>
                                    </div>
                                    {job.status === 'OPEN' ? (
                                        <span className="absolute top-0 right-0 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-700">Open</span>
                                    ) : (
                                        <span className="absolute top-0 right-0 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-red-100 text-red-700">Closed</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 mb-5 pb-5 border-b border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <MapPin size={16} />
                                        <span className="truncate">{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <DollarSign size={16} />
                                        <span>₹{job.salary_package} LPA</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <Calendar size={16} />
                                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6 grow content-start">
                                    <div className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">Min CGPA: {job.min_cgpa}</div>
                                    <div className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium" title={job.eligible_branch}>Allowed: {job.eligible_branch ? job.eligible_branch.substring(0, 15) : 'Any'}{job.eligible_branch && job.eligible_branch.length > 15 && '...'}</div>
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <div className="flex-1"><Button isFullWidth variant="ghost" size="sm">View Details</Button></div>
                                    <div className="flex-1">
                                        <Button
                                            isFullWidth
                                            variant={job.hasApplied ? 'secondary' : 'primary'}
                                            size="sm"
                                            onClick={() => handleApply(job._id)}
                                            disabled={job.status !== 'OPEN' || applyingTo === job._id || job.hasApplied}
                                            isLoading={applyingTo === job._id}
                                            icon={job.hasApplied ? CheckCircle : Send}
                                        >
                                            {job.hasApplied ? 'Applied' : 'Apply Now'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default JobBoard;
