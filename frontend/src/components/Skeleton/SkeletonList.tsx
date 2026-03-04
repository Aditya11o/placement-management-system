import React from 'react';

interface SkeletonListProps {
    count?: number;
}

const SingleRow = () => (
    <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 animate-pulse w-full last:border-b-0">
        {/* Avatar/Icon Placeholder */}
        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0"></div>

        {/* Main Content Area */}
        <div className="flex flex-col gap-2 grow">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        </div>

        {/* Right side Elements (Status, Action) */}
        <div className="flex items-center gap-3 shrink-0">
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full hidden sm:block"></div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
    </div>
);

const SkeletonList: React.FC<SkeletonListProps> = ({ count = 5 }) => {
    return (
        <div className="w-full flex flex-col border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
            {Array.from({ length: count }).map((_, i) => (
                <SingleRow key={i} />
            ))}
        </div>
    );
};

export default SkeletonList;
