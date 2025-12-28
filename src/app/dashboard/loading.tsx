
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[350px] w-full" />
    </div>
  );
}
