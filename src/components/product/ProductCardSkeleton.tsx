import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col w-full h-full">
      <Skeleton className="aspect-[4/5] md:aspect-[3/4] w-full mb-4 rounded-sm" />
      <div className="px-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4 rounded-sm" />
        <Skeleton className="h-4 w-1/4 rounded-sm" />
      </div>
    </div>
  );
}
