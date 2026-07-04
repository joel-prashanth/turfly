function S({ className = "" }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

function TurfCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">

      {/* Image — darker so it reads as a photo placeholder */}
      <div className="relative h-48 overflow-hidden">
        <div className="skeleton-shimmer-dark h-full w-full" />
        {/* Sport badge */}
        <div className="absolute left-3 top-3">
          <S className="h-6 w-16 rounded-full" />
        </div>
        {/* Name + location pinned to bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 space-y-2">
          <S className="h-5 w-2/3" />
          <S className="h-3 w-4/5" />
        </div>
      </div>

      {/* Body — white background with clearly visible elements */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Description + price */}
        <div className="flex items-start justify-between gap-4">
          <S className="mt-1 h-3 w-1/2" />
          <div className="shrink-0 space-y-1.5 text-right">
            <S className="ml-auto h-6 w-16" />
            <S className="ml-auto h-2.5 w-12" />
          </div>
        </div>

        {/* Rating */}
        <S className="h-3 w-28" />

        {/* Owner */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <S className="h-6 w-6 shrink-0 rounded-lg" />
          <S className="h-3 w-32" />
        </div>

        {/* CTA button */}
        <S className="mt-1 h-11 w-full rounded-xl" />

      </div>
    </div>
  );
}

export default TurfCardSkeleton;
