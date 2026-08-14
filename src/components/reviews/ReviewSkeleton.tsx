import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface ReviewSkeletonProps {
  count?: number;
}

export function ReviewSkeleton({ count = 6 }: ReviewSkeletonProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border border-[#3E2519]/70 bg-[#1D100A] rounded-2xl p-6 space-y-4">
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-[#2C1810]" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 bg-[#2C1810]" />
                  <Skeleton className="h-3 w-16 bg-[#2C1810]" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 bg-[#2C1810]" />
            </div>
            <Skeleton className="h-3.5 w-full bg-[#2C1810]" />
            <Skeleton className="h-3.5 w-4/5 bg-[#2C1810]" />
            <div className="pt-3 border-t border-[#3E2519]/40 flex justify-between">
              <Skeleton className="h-6 w-20 rounded-full bg-[#2C1810]" />
              <Skeleton className="h-6 w-6 rounded-full bg-[#2C1810]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
