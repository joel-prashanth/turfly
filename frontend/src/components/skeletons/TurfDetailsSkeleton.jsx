import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

function TurfDetailsSkeleton() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <Card className="overflow-hidden" hover={false}>
        <Skeleton className="h-72 w-full rounded-none lg:h-[460px]" />

        <div className="p-8">
          <Skeleton className="h-7 w-28 rounded-full" />

          <Skeleton className="mt-6 h-10 w-2/3" />

          <Skeleton className="mt-6 h-5 w-80" />

          <Skeleton className="mt-10 h-5 w-full" />
          <Skeleton className="mt-3 h-5 w-11/12" />
          <Skeleton className="mt-3 h-5 w-4/5" />
        </div>
      </Card>

      {/* Slots */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-6" hover={false}>
            <Skeleton className="h-6 w-36 rounded-full" />

            <Skeleton className="mt-5 h-8 w-72" />

            <Skeleton className="mt-3 h-4 w-40" />

            <div className="mt-6 flex justify-end">
              <Skeleton className="h-11 w-32 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TurfDetailsSkeleton;
