import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen pt-32">
      {/* Banner Skeleton */}
      <Skeleton className="w-full h-[40vh] md:h-[50vh] rounded-none" />

      <div className="container mx-auto px-6 lg:px-12 py-12">
        {/* Toolbar Skeleton */}
        <div className="flex justify-between mb-8 border-b border-[#EFEFEF] pb-6">
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-48 h-6 hidden md:block" />
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="space-y-10">
              <div>
                <Skeleton className="w-32 h-6 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="w-full h-4" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="w-32 h-6 mb-4" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="w-full h-8" />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid Skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col">
                  <Skeleton className="w-full aspect-[4/5] md:aspect-[3/4] mb-4" />
                  <Skeleton className="w-3/4 h-5 mb-2" />
                  <Skeleton className="w-1/4 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
