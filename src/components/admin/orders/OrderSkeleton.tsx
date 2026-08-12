import { Skeleton } from '../../ui/skeleton';

export function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {/* Desktop Skeleton Table */}
      <div className="hidden md:block border border-border/80 rounded-md overflow-hidden bg-card p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/40">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>

      {/* Mobile Skeleton Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-md border border-border/80 bg-card space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
