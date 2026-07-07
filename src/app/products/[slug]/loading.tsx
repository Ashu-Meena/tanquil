import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen pt-36 pb-20">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Breadcrumb Skeleton */}
        <Skeleton className="w-48 h-4 mb-8" />

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Gallery Skeleton */}
          <div className="w-full lg:w-[60%] flex-col-reverse md:flex-row gap-4 flex lg:h-[calc(100vh-120px)]">
            <div className="flex md:flex-col gap-4 w-full md:w-24">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-20 h-28 md:w-full md:h-32" />
              ))}
            </div>
            <Skeleton className="w-full aspect-[3/4] md:h-[calc(100vh-200px)] md:aspect-auto" />
          </div>

          {/* Details Skeleton */}
          <div className="w-full lg:w-[40%] flex flex-col">
            <Skeleton className="w-3/4 h-10 mb-4" />
            <Skeleton className="w-24 h-8 mb-8" />
            
            <Skeleton className="w-32 h-4 mb-4" />
            <div className="flex gap-3 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
              ))}
            </div>

            <Skeleton className="w-full h-24 mb-8" />
            
            <Skeleton className="w-full h-12 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="flex-1 h-12" />
              <Skeleton className="w-14 h-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
