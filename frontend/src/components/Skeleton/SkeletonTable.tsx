interface SkeletonTableProps {
    rows?: number;
    cols?: number;
}

const SkeletonTable = ({ rows = 5, cols = 5 }: SkeletonTableProps) => {
    const colWidths = ['w-1/4', 'w-1/5', 'w-1/6', 'w-1/5', 'w-1/4', 'w-1/5'];

    return (
        <div className="animate-pulse w-full overflow-hidden">
            {/* Header row */}
            <div className="flex gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200">
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className={`h-3 rounded bg-slate-200 ${colWidths[i % colWidths.length]}`} />
                ))}
            </div>

            {/* Data rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={rowIdx}
                    className="flex items-center gap-4 px-6 py-5 border-b border-slate-100"
                >
                    {/* First column — avatar + two lines */}
                    <div className="flex items-center gap-3 w-1/4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1">
                            <div className="h-3 rounded bg-slate-200 w-3/4" />
                            <div className="h-2.5 rounded bg-slate-100 w-1/2" />
                        </div>
                    </div>

                    {/* Remaining columns */}
                    {Array.from({ length: cols - 1 }).map((_, colIdx) => (
                        <div
                            key={colIdx}
                            className={`h-3 rounded bg-slate-200 ${colWidths[(colIdx + 1) % colWidths.length]}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default SkeletonTable;
