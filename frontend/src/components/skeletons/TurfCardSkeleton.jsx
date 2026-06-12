import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

const TurfCardSkeleton = () => {
  return (
    <Card className="p-6">
      <Skeleton className="h-8 w-2/3" />

      <Skeleton className="mt-5 h-5 w-1/2" />

      <Skeleton className="mt-3 h-5 w-1/3" />

      <div className="mt-8 flex gap-3">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </Card>
  );
};

export default TurfCardSkeleton;
