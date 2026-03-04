interface SkeletonCardProps {
    count?: number;
}

const SingleCard = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
            {/* Icon placeholder */}
            <div className="w-10 h-10 rounded-lg bg-slate-200" />
            {/* Badge / label placeholder */}
            <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        {/* Big number */}
        <div className="h-8 w-1/3 rounded bg-slate-200 mb-2" />
        {/* Label beneath */}
        <div className="h-3 w-2/3 rounded bg-slate-100" />
    </div>
);

const SkeletonCard = ({ count = 4 }: SkeletonCardProps) => (
    <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count}`}>
        {Array.from({ length: count }).map((_, i) => (
            <SingleCard key={i} />
        ))}
    </div>
);

export default SkeletonCard;
