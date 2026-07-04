function S({ className = "" }) {
  return <div className={`skeleton-shimmer rounded ${className}`} />;
}

function BookingActivitySkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3.5 px-1">
          <S className="h-2 w-1 rounded-full shrink-0" />
          <S className="h-3.5 w-24 shrink-0" />
          <S className="h-3.5 flex-1" />
          <S className="h-3.5 w-16 shrink-0" />
          <S className="h-5 w-20 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default BookingActivitySkeleton;
