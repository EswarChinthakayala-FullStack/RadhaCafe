import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function MenuSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden border border-[#2C1810] bg-[#1D100A] rounded-md space-y-4">
          <Skeleton className="aspect-[4/3] w-full bg-[#2C1810]" />
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32 bg-[#2C1810]" />
              <Skeleton className="h-5 w-16 bg-[#2C1810]" />
            </div>
            <Skeleton className="h-4 w-20 bg-[#2C1810]" />
            <Skeleton className="h-3 w-full bg-[#2C1810]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
