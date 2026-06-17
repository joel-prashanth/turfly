import Card from "../ui/Card";

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card
          key={index}
          className="relative overflow-hidden p-5"
          hover={false}
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 animate-pulse">
              <div className="h-4 w-24 rounded bg-slate-200" />

              <div className="mt-4 h-8 w-20 rounded bg-slate-300" />

              <div className="mt-3 h-3 w-28 rounded bg-slate-200" />
            </div>

            <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStatsSkeleton;
