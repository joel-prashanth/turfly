function S({ className = "" }) {
  return <div className={`skeleton-shimmer rounded ${className}`} />;
}

function TurfDetailsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero image */}
      <S className="h-72 w-full rounded-2xl" />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left — TurfInfo */}
        <div className="space-y-6">
          {/* Title + rating */}
          <div className="space-y-3">
            <S className="h-8 w-2/3" />
            <div className="flex items-center gap-3">
              <S className="h-4 w-32" />
              <S className="h-4 w-24" />
            </div>
          </div>

          {/* Info chips: location, rating, price */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <S className="h-3 w-16" />
                <S className="h-5 w-28" />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <S className="h-4 w-full" />
            <S className="h-4 w-5/6" />
            <S className="h-4 w-4/6" />
          </div>

          {/* Date picker label */}
          <S className="h-5 w-32" />

          {/* Slot grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <S key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Right — owner + price card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center gap-3">
              <S className="h-12 w-12 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <S className="h-4 w-32" />
                <S className="h-3 w-24" />
              </div>
            </div>
            <S className="h-px w-full" />
            <div className="space-y-1.5">
              <S className="h-3 w-16" />
              <S className="h-9 w-28" />
            </div>
            <S className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TurfDetailsSkeleton;
