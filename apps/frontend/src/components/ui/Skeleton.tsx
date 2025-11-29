interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 4 }: TableSkeletonProps) => (
    <div className="space-y-3 p-4">
        {/* Header */}
        <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={`header-${i}`} className="h-8 flex-1" />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12 flex-1" />
                ))}
            </div>
        ))}
    </div>
);

export const CardSkeleton = () => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
    </div>
);

export const StatCardsSkeleton = ({ count = 4 }: { count?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

export const ListSkeleton = ({ items = 5 }: { items?: number }) => (
    <div className="space-y-4 p-4">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
            </div>
        ))}
    </div>
);

export default Skeleton;
