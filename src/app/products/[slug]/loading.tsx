import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen pt-36 pb-20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-20">
          
          {/* Gallery Skeleton */}
          <div className="hidden md:flex w-full lg:w-[60%] flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-4 w-24 flex-shrink-0">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-28 md:w-full md:h-32 rounded-sm" />
              ))}
            </div>
            <Skeleton className="w-full aspect-[3/4] md:h-[calc(100vh-200px)] md:aspect-auto rounded-sm" />
          </div>

          {/* Product Info Skeleton */}
          <div className="w-full lg:w-[40%] flex flex-col pt-4">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-32 mb-8" />
            
            <Skeleton className="h-4 w-16 mb-4" />
            <div className="flex gap-2 mb-8">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-full" />
              ))}
            </div>

            <Skeleton className="h-4 w-16 mb-4" />
            <div className="grid grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2 mb-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="py-2 h-10 w-full rounded-sm" />
              ))}
            </div>

            <Skeleton className="h-12 w-full mb-6" />
            <div className="flex gap-3 mb-6">
              <Skeleton className="flex-1 h-12 rounded-sm" />
              <Skeleton className="w-14 h-12 rounded-sm" />
            </div>
            
            <div className="border-t border-border-light pt-6 mt-2 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
