function S({ className = "" }) {
  return <div className={`skeleton-shimmer rounded ${className}`} />;
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <S className="h-3.5 w-24" />
            <S className="h-8 w-8 rounded-xl" />
          </div>
          <S className="h-8 w-16" />
          <S className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export default DashboardStatsSkeleton;
