import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col gap-12 bg-white">
      {/* Hero Skeleton */}
      <Skeleton className="w-full h-[60vh] md:h-[80vh] rounded-none" />
      
      {/* Section Skeleton */}
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-6 w-48 rounded-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="flex flex-col gap-3">
               <Skeleton className="aspect-[3/4] w-full rounded-sm" />
               <Skeleton className="h-4 w-2/3 rounded-sm" />
               <Skeleton className="h-4 w-1/3 rounded-sm" />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
