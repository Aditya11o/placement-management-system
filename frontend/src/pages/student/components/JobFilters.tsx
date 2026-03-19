import React from 'react';
import { Filter, MapPin, Briefcase, IndianRupee, X, Lightbulb } from 'lucide-react';
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
        <aside className="w-full lg:w-[300px] shrink-0 sticky top-4 z-10">
            <Card border className="p-6 flex flex-col gap-8 !bg-white/80 dark:!bg-slate-800/90 backdrop-blur-xl shadow-premium border-slate-200/60 dark:border-slate-700/50">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                            <Filter size={18} />
                        </div>
                        <h2 className="font-black text-[13px] uppercase tracking-[0.2em] m-0 text-slate-800 dark:text-slate-100">Filters</h2>
                    </div>
                    {hasAnyFilter && (
                        <button
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                            onClick={onClearAll}
                        >
                            <X size={12} />
                            Reset
                        </button>
                    )}
                </div>

                {/* Job Category */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-slate-400" />
                        <h3 className="font-black text-slate-500 dark:text-slate-400 text-[10px] tracking-[0.2em] uppercase">Job Type</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {jobTypes.map(type => (
                            <label key={type} className="flex items-center justify-between cursor-pointer group">
                                <span className={`text-sm tracking-tight transition-colors ${selectedTypes.includes(type) ? 'text-indigo-600 dark:text-indigo-400 font-bold underline decoration-indigo-500/30 underline-offset-4' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`}>
                                    {type}
                                </span>
                                <div className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-slate-200 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-800/30 transition-all group-hover:border-indigo-400">
                                    <input
                                        type="checkbox"
                                        className="absolute opacity-0 cursor-pointer w-full h-full z-10"
                                        checked={selectedTypes.includes(type)}
                                        onChange={() => onTypeToggle(type)}
                                    />
                                    {selectedTypes.includes(type) && (
                                        <div className="absolute inset-0 bg-indigo-500 flex items-center justify-center text-white scale-110 pointer-events-none">
                                            <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M3 8L6 11L11 3.5" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" /></svg>
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Salary Visualizer Overlay */}
                <div className="space-y-5 pt-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <IndianRupee size={14} className="text-slate-400" />
                            <h3 className="font-black text-slate-500 dark:text-slate-400 text-[10px] tracking-[0.2em] uppercase">Minimum Salary</h3>
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-black bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">
                            {minSalary > 0 ? `₹${minSalary}L` : 'Base'}
                        </span>
                    </div>
                    <div className="relative px-1">
                        <input
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            value={minSalary}
                            onChange={(e) => { setMinSalary(Number(e.target.value)); }}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-100 dark:bg-slate-700 accent-indigo-500 transition-all hover:accent-indigo-600"
                        />
                        <div className="flex justify-between mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <span>0L</span>
                            <span>25L</span>
                            <span>50L+</span>
                        </div>
                    </div>
                </div>

                {/* Location Search Control */}
                <div className="space-y-5 pt-2">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        <h3 className="font-black text-slate-500 dark:text-slate-400 text-[10px] tracking-[0.2em] uppercase">Target Location</h3>
                    </div>
                    <div className="relative group/loc">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/loc:text-indigo-500 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="e.g. Bangalore, Remote"
                            className="w-full py-3 pr-4 pl-10 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 text-sm text-slate-800 dark:text-slate-200 transition-all outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 font-medium placeholder:text-slate-400"
                            value={locationSearch}
                            onChange={(e) => { setLocationSearch(e.target.value); }}
                        />
                    </div>
                </div>

                {/* Pro Tip */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                        <Lightbulb size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pro Placement Tip</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium italic">
                        "Enabling **Remote** and **High Salary** filters highlights our most competitive global roles."
                    </p>
                </div>
            </Card>
        </aside>
    );
};

export default JobFilters;
