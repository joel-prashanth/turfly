import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

const barHeights = [96, 142, 78, 164, 118, 186, 136];

function RevenueChartSkeleton() {
  return (
    <Card className="mt-14 p-6" hover={false}>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />

      <Skeleton className="mt-8 h-10 w-32" />

      <div className="mt-10 flex h-56 items-end justify-between gap-3">
        {barHeights.map((height, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-3">
            <Skeleton
              className="w-full rounded-xl"
              style={{
                height: `${height}px`,
              }}
            />

            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default RevenueChartSkeleton;
