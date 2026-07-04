function S({ className = "" }) {
  return <div className={`skeleton-shimmer rounded ${className}`} />;
}

function OwnerBookingListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-3 bg-slate-50">
        {[20, 32, 20, 14, 14].map((w, i) => (
          <S key={i} className={`h-3 w-${w} shrink-0`} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <S className="h-3.5 w-28 shrink-0" />
          <S className="h-3.5 flex-1" />
          <S className="h-3.5 w-20 shrink-0" />
          <S className="h-3.5 w-16 shrink-0" />
          <S className="h-5 w-20 rounded-full shrink-0" />
          <S className="h-7 w-20 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default OwnerBookingListSkeleton;
