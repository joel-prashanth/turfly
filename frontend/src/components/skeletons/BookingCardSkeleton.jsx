function S({ className = "" }) {
  return <div className={`skeleton-shimmer rounded ${className}`} />;
}

function BookingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex">
        {/* Status rail */}
        <div className="hidden w-1.5 shrink-0 sm:block bg-slate-200" />

        <div className="grid flex-1 lg:grid-cols-[280px_1fr]">
          {/* Image column */}
          <div className="relative h-56 overflow-hidden bg-slate-100 lg:h-full">
            <S className="h-full w-full min-h-[14rem] rounded-none" />
            {/* Badges on image */}
            <div className="absolute left-4 top-4 flex gap-2">
              <S className="h-6 w-20 rounded-full" />
              <S className="h-6 w-20 rounded-full" />
            </div>
            {/* Turf name on image */}
            <div className="absolute bottom-4 left-4 space-y-2">
              <S className="h-5 w-32" />
              <S className="h-3 w-24" />
            </div>
          </div>

          {/* Info column */}
          <div className="flex flex-col justify-between p-5">
            {/* 4-col info grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-dashed border-slate-200 pb-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <S className="h-2.5 w-14" />
                  <S className="h-4 w-20" />
                </div>
              ))}
            </div>

            {/* Amount + actions row */}
            <div className="mt-4 flex items-center justify-between">
              <div className="space-y-1.5">
                <S className="h-2.5 w-12" />
                <S className="h-6 w-20" />
                <S className="h-2.5 w-16" />
              </div>
              <div className="flex gap-2">
                <S className="h-7 w-24 rounded-full" />
                <S className="h-7 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingCardSkeleton;
