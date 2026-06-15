import Card from "../ui/Card";

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="p-6 animate-pulse" hover={false}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 w-24 rounded bg-slate-200" />

              <div className="mt-4 h-8 w-20 rounded bg-slate-300" />
            </div>

            <div className="h-12 w-12 rounded-xl bg-slate-200" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStatsSkeleton;
