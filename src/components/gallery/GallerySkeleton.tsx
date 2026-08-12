import { Skeleton } from '../ui/skeleton';

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="aspect-square rounded-md overflow-hidden bg-[#1D100A] border border-[#2C1810]">
          <Skeleton className="w-full h-full bg-[#2C1810]" />
        </div>
      ))}
    </div>
  );
}
