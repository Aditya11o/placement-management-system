import React from 'react';
import { Filter, MapPin } from 'lucide-react';
import Card from '../../../components/Card/Card';

interface JobFiltersProps {
    selectedTypes: string[];
    onTypeToggle: (type: string) => void;
    minSalary: number;
    setMinSalary: (val: number) => void;
    locationSearch: string;
    setLocationSearch: (val: string) => void;
    searchTerm: string;
    onClearAll: () => void;
    jobTypes: string[];
}

const JobFilters: React.FC<JobFiltersProps> = ({
    selectedTypes,
    onTypeToggle,
    minSalary,
    setMinSalary,
    locationSearch,
    setLocationSearch,
    searchTerm,
    onClearAll,
    jobTypes
}) => {
    const hasAnyFilter = selectedTypes.length > 0 || minSalary > 0 || locationSearch || searchTerm;

    return (
        <aside className="w-full lg:w-[280px] shrink-0 sticky top-4 z-10 transition-all duration-300">
            <Card className="p-5 flex flex-col gap-7 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-indigo-600 dark:text-indigo-400" />
                        <h2 className="font-bold text-lg m-0 text-slate-800 dark:text-slate-100">Filters</h2>
                    </div>
                    {hasAnyFilter && (
                        <button
                            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 bg-transparent border-none cursor-pointer"
                            onClick={onClearAll}
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {/* Job Roles Filter */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-xs tracking-wider uppercase opacity-80">Job Type</h3>
                    <div className="flex flex-col gap-2.5">
                        {jobTypes.map(type => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-300 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-800/50 transition-colors group-hover:border-indigo-400">
                                    <input
                                        type="checkbox"
                                        className="absolute opacity-0 cursor-pointer w-full h-full z-10"
                                        checked={selectedTypes.includes(type)}
                                        onChange={() => onTypeToggle(type)}
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
                        onChange={(e) => { setMinSalary(Number(e.target.value)); }}
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
                            onChange={(e) => { setLocationSearch(e.target.value); }}
                        />
                    </div>
                </div>
            </Card>
        </aside>
    );
};

export default JobFilters;
