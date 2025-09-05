import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export const SkeletonCard = ({ className, showAvatar = false, lines = 3 }: SkeletonCardProps) => (
  <div className={cn("rounded-lg border p-4 space-y-3", className)}>
    {showAvatar && (
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    )}
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  </div>
);

interface SkeletonListProps {
  count?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonList = ({ count = 3, showAvatar = false, className }: SkeletonListProps) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} showAvatar={showAvatar} />
    ))}
  </div>
);

export const SkeletonTable = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, j) => (
          <Skeleton key={j} className="h-6 w-full" />
        ))}
      </div>
    ))}
  </div>
);