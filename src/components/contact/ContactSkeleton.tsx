import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function ContactSkeleton() {
  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border border-[#2C1810] bg-[#1D100A] rounded-md p-6 space-y-4">
          <CardContent className="p-0 space-y-4">
            <Skeleton className="h-10 w-10 rounded-md bg-[#2C1810]" />
            <Skeleton className="h-5 w-32 bg-[#2C1810]" />
            <Skeleton className="h-4 w-full bg-[#2C1810]" />
            <Skeleton className="h-4 w-2/3 bg-[#2C1810]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
