import { MapPin, Star, Clock } from "lucide-react";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function fmt12(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const s = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${s}` : `${h12}:${String(m).padStart(2, "0")} ${s}`;
}

function TodayHours({ hours }) {
  if (!hours) return null;
  const key = DAY_KEYS[new Date().getDay()];
  const day = hours[key];
  if (!day) return null;
  if (day.closed) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Clock size={12} className="shrink-0" />
        <span>Closed today</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Clock size={12} className="shrink-0 text-emerald-500" />
      <span className="text-emerald-700 font-medium">Open today</span>
      <span className="text-slate-400">{fmt12(day.open)} – {fmt12(day.close)}</span>
    </div>
  );
}

const sportBadge = {
  FOOTBALL:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  CRICKET:    "bg-blue-50 text-blue-700 border-blue-200",
  BADMINTON:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  TENNIS:     "bg-purple-50 text-purple-700 border-purple-200",
  BASKETBALL: "bg-orange-50 text-orange-700 border-orange-200",
  VOLLEYBALL: "bg-pink-50 text-pink-700 border-pink-200",
};

const FALLBACK =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200";

const sportLabel = (s) =>
  s ? s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "Sport";

const formatPrice = (p) =>
  Number(p || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

function TurfCard({ turf, actions }) {
  const unlisted = turf.isActive === false;

  return (
    <div className={[
      "group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300",
      unlisted
        ? "border-gray-200 opacity-75"
        : "border-slate-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300",
    ].join(" ")}>

      {/* ── IMAGE ── */}
      <div className="relative overflow-hidden">
        <img
          src={turf.imageUrl || FALLBACK}
          alt={turf.name}
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        {/* Unlisted overlay */}
        {unlisted && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="rounded-full bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80">
              Unlisted
            </span>
          </div>
        )}

        {/* Sport badge — top left */}
        <div className="absolute left-3 top-3">
          <span className={[
            "rounded-full border px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm",
            sportBadge[turf.sport] || "border-slate-200 bg-white/80 text-slate-700",
          ].join(" ")}>
            {sportLabel(turf.sport)}
          </span>
        </div>

        {/* Name + location — bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <h2 className="line-clamp-1 text-lg font-bold leading-snug tracking-tight text-white">
            {turf.name}
          </h2>
          <div className="mt-1 flex items-center gap-1 text-xs text-white/75">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{turf.location}</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 flex-col p-4">

        {/* Price + description row */}
        <div className="flex items-start justify-between gap-4">
          <p className="line-clamp-2 text-sm leading-6 text-slate-500 flex-1">
            {turf.description || "A sports venue ready for your next match or practice session."}
          </p>
          <div className="shrink-0 text-right">
            <p className="text-xl font-bold tracking-tight text-slate-900">
              ₹{formatPrice(turf.pricePerHour)}
            </p>
            <p className="text-[11px] text-slate-400">per hour</p>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-1.5">
          {turf.avgRating ? (
            <>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={13}
                    className={n <= Math.round(turf.avgRating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{turf.avgRating}</span>
              <span className="text-xs text-slate-400">({turf.reviewCount} {turf.reviewCount === 1 ? "review" : "reviews"})</span>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">No reviews yet</span>
          )}
        </div>

        {/* Today's hours — always rendered to keep card height consistent */}
        <div className="mt-2 h-4">
          <TodayHours hours={turf.businessHours} />
        </div>

        {/* Owner */}
        {turf.owner && (
          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
            {turf.owner.avatarUrl ? (
              <img
                src={turf.owner.avatarUrl}
                alt={turf.owner.name}
                className="h-6 w-6 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
                {turf.owner.name?.[0]?.toUpperCase()}
              </div>
            )}
            <p className="text-xs text-slate-400">
              by <span className="font-medium text-slate-600">{turf.owner.businessName || turf.owner.name}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="mt-4 border-t border-slate-100 pt-4">{actions}</div>
        )}
      </div>
    </div>
  );
}

export default TurfCard;
