import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getTurfReviews } from "../../api/reviewApi";
import Card from "../ui/Card";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function StarRow({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 shrink-0 text-right text-slate-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 shrink-0 text-slate-400">{count}</span>
    </div>
  );
}

export default function TurfReviews({ turfId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!turfId) return;
    getTurfReviews(turfId, { limit: 20 })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [turfId]);

  if (loading) return (
    <div className="mt-8 animate-pulse space-y-3">
      <div className="h-5 w-32 rounded bg-slate-200" />
      <div className="h-24 rounded-2xl bg-slate-100" />
    </div>
  );

  if (!data || data.totalRatings === 0) return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">Reviews</h2>
      <p className="mt-3 text-sm text-slate-400">No reviews yet. Be the first to review after your booking!</p>
    </div>
  );

  // count per star
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data.reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">
        Reviews <span className="ml-1 text-sm font-normal text-slate-400">({data.totalRatings})</span>
      </h2>

      {/* Summary */}
      <Card className="mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center gap-1 sm:w-28">
          <p className="text-5xl font-black text-slate-900">{data.avgRating}</p>
          <StarRow rating={Math.round(data.avgRating)} size={16} />
          <p className="text-xs text-slate-400">{data.totalRatings} ratings</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {counts.map(({ star, count }) => (
            <RatingBar key={star} label={star} count={count} total={data.totalRatings} />
          ))}
        </div>
      </Card>

      {/* Review list */}
      <div className="mt-4 space-y-3">
        {data.reviews.map((r) => {
          const initials = r.player.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
          return (
            <Card key={r.id} className="p-4">
              <div className="flex items-start gap-3">
                {r.player.avatarUrl ? (
                  <img src={r.player.avatarUrl} alt={r.player.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{r.player.name}</p>
                    <StarRow rating={r.rating} size={13} />
                    <span className="text-xs text-slate-400">{fmtDate(r.createdAt)}</span>
                  </div>
                  {r.comment && (
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">{r.comment}</p>
                  )}
                  {r.ownerReply && (
                    <div className="mt-3 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5">
                      <p className="text-xs font-semibold text-green-700">Owner reply</p>
                      <p className="mt-1 text-sm leading-5 text-green-800">{r.ownerReply}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
