import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

function TurfCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white">
      {/* Image */}
      <Skeleton className="h-60 w-full rounded-none" />

      <div className="p-6">
        {/* Sport Badge */}
        <Skeleton className="h-6 w-24 rounded-full" />

        {/* Status Badge */}
        <Skeleton className="mt-5 h-6 w-20 rounded-full" />

        {/* Title */}
        <Skeleton className="mt-6 h-8 w-3/4" />

        {/* Description */}
        <Skeleton className="mt-5 h-4 w-full" />
        <Skeleton className="mt-3 h-4 w-5/6" />

        {/* Location */}
        <Skeleton className="mt-6 h-5 w-2/3" />

        {/* Price */}
        <Skeleton className="mt-8 h-10 w-32" />

        {/* Button */}
        <Skeleton className="mt-8 h-11 w-full rounded-xl" />
      </div>
    </Card>
  );
}

export default TurfCardSkeleton;
