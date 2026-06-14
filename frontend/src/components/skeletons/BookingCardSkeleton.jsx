import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

function BookingCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-60 w-full rounded-none" />

        <div className="p-6">
          <Skeleton className="h-6 w-24 rounded-full" />

          <Skeleton className="mt-6 h-8 w-64" />

          <Skeleton className="mt-6 h-4 w-56" />
          <Skeleton className="mt-4 h-4 w-48" />
          <Skeleton className="mt-4 h-4 w-60" />

          <div className="mt-8 flex justify-between">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default BookingCardSkeleton;
