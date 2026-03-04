import React from 'react';

interface SkeletonJobCardProps {
    count?: number;
}

const SingleJobCard = () => (
    <div className="flex flex-col h-full p-6 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm animate-pulse">
        <div className="flex items-start gap-4 mb-5">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0"></div>

            <div className="grow space-y-2 py-1">
                {/* Title */}
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                {/* Subtitle */}
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
        </div>

        <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-slate-100 dark:border-slate-700/50">
            {/* Location / Salary */}
            <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
            {/* Date */}
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/5"></div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-auto">
            <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
            <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
        </div>
    </div>
);

const SkeletonJobCard: React.FC<SkeletonJobCardProps> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {Array.from({ length: count }).map((_, i) => (
                <SingleJobCard key={i} />
            ))}
        </div>
    );
};

export default SkeletonJobCard;
