const SkeletonField = ({ wide = false }: { wide?: boolean }) => (
    <div className={`flex flex-col gap-1.5 ${wide ? 'col-span-2' : 'col-span-1'}`}>
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-md bg-slate-100 border border-slate-200" />
    </div>
);

const SkeletonProfileForm = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        {/* Page Header */}
        <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-2">
                <div className="h-8 w-48 rounded bg-slate-200" />
                <div className="h-4 w-72 rounded bg-slate-100" />
            </div>
            <div className="h-10 w-28 rounded-lg bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                    <div className="w-6 h-6 rounded bg-slate-200" />
                    <div className="h-4 w-32 rounded bg-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SkeletonField wide />
                    <SkeletonField wide />
                </div>
            </div>

            {/* Academic / Details Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                    <div className="w-6 h-6 rounded bg-slate-200" />
                    <div className="h-4 w-40 rounded bg-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SkeletonField wide />
                    <SkeletonField />
                    <SkeletonField />
                    <SkeletonField />
                    <SkeletonField />
                </div>
            </div>

            {/* Skills / Full-width Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                    <div className="w-6 h-6 rounded bg-slate-200" />
                    <div className="h-4 w-36 rounded bg-slate-200" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-7 w-20 rounded-full bg-slate-200" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default SkeletonProfileForm;
