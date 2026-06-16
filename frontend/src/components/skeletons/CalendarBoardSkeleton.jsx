import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

function CalendarBoardSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="overflow-hidden p-0" hover={false}>
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="mt-3 h-4 w-28" />
          </div>

          <div className="divide-y divide-slate-100">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between px-6 py-5"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />

                  <div>
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="mt-3 h-4 w-28" />
                  </div>
                </div>

                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default CalendarBoardSkeleton;
