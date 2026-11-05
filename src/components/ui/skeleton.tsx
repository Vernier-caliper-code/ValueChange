export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-line/50 ${className}`} />;
}

export function ArticleListSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-6">
          <Skeleton className="h-[140px] w-[220px]" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="overflow-hidden rounded-[9px] border border-line bg-white">
          <Skeleton className="h-[190px] w-full" />
          <div className="p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
