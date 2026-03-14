import React from 'react';
import { Search, Filter, LayoutTemplate } from 'lucide-react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { Job } from '../../../types';

interface ApplicantFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedJob: string;
    setSelectedJob: (val: string) => void;
    minMatchScore: number;
    setMinMatchScore: (val: number) => void;
    jobs: Job[];
    isBulkMode: boolean;
    setIsBulkMode: (val: boolean) => void;
    onOpenPipelineModal: () => void;
}

const ApplicantFilters: React.FC<ApplicantFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    selectedJob,
    setSelectedJob,
    minMatchScore,
    setMinMatchScore,
    jobs,
    isBulkMode,
    setIsBulkMode,
    onOpenPipelineModal
}) => {
    return (
        <Card className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 p-4 lg:px-6">
            <div className="flex flex-wrap items-center gap-4 flex-grow">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        onClick={onOpenPipelineModal}
                        icon={LayoutTemplate}
                    >
                        Edit Pipeline
                    </Button>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${!isBulkMode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                            onClick={() => setIsBulkMode(false)}
                        >
                            Kanban View
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isBulkMode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                            onClick={() => setIsBulkMode(true)}
                        >
                            Bulk Actions
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-md border border-slate-200 flex-grow max-w-[300px]">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-[15px] text-slate-800 font-sans cursor-text"
                    />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-md border border-slate-200">
                    <Filter size={18} className="text-slate-400 shrink-0" />
                    <select
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                        className="bg-transparent border-none outline-none text-[15px] text-slate-800 font-sans cursor-pointer focus:ring-0 max-w-[200px]"
                    >
                        <option value="ALL">All Jobs</option>
                        {jobs.map((j) => (
                            <option key={j._id} value={j._id}>{j.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-indigo-50/50 px-5 py-3 rounded-lg border border-indigo-100 shrink-0">
                <span className="text-sm font-semibold text-indigo-900 whitespace-nowrap">
                    Min Match Score:
                </span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(Number(e.target.value))}
                    className="w-[120px] accent-indigo-600"
                />
                <span className="text-sm font-bold w-10 text-right text-indigo-700">{minMatchScore}%+</span>
            </div>
        </Card>
    );
};

export default ApplicantFilters;
