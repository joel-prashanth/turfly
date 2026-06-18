import { Clock, IndianRupee, MapPin, Star } from "lucide-react";

import Card from "../ui/Card";

const sportColors = {
  FOOTBALL: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CRICKET: "bg-blue-100 text-blue-700 border-blue-200",
  BADMINTON: "bg-yellow-100 text-yellow-700 border-yellow-200",
  TENNIS: "bg-purple-100 text-purple-700 border-purple-200",
  BASKETBALL: "bg-orange-100 text-orange-700 border-orange-200",
  VOLLEYBALL: "bg-pink-100 text-pink-700 border-pink-200",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200";

const formatSportLabel = (sport) => {
  if (!sport) return "Sport";

  return sport
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatPrice = (price) => {
  const amount = Number(price || 0);

  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

function TurfCard({ turf, actions }) {
  return (
    <Card
      className="
        group overflow-hidden border border-slate-200/80 bg-white
        transition-all duration-300
        hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl
      "
    >
      <div className="relative overflow-hidden bg-slate-100">
        <img
          src={turf.imageUrl || FALLBACK_IMAGE}
          alt={turf.name}
          className="
            h-52 w-full object-cover
            transition-transform duration-700
            group-hover:scale-105
          "
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`
              rounded-full border px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-md
              ${sportColors[turf.sport] || "border-slate-200 bg-white text-slate-700"}
            `}
          >
            {formatSportLabel(turf.sport)}
          </span>

          <span
            className={`
              inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-md
              ${
                turf.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }
            `}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                turf.isActive ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {turf.isActive ? "Available" : "Inactive"}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-1 text-xl font-bold tracking-tight text-white">
                {turf.name}
              </h2>

              <div className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
                <MapPin size={15} className="shrink-0" />
                <span className="truncate">{turf.location}</span>
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm sm:flex">
              <Star className="h-3.5 w-3.5 fill-current" />
              New
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
          {turf.description ||
            "A sports venue ready for your next match, practice session, or weekend game."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <IndianRupee className="h-4 w-4" />
              Price
            </div>

            <div className="mt-2 flex items-end gap-1">
              <span className="text-2xl font-bold tracking-tight text-emerald-600">
                ₹{formatPrice(turf.pricePerHour)}
              </span>
              <span className="pb-1 text-xs font-medium text-slate-500">
                / hour
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Clock className="h-4 w-4" />
              Booking
            </div>

            <p className="mt-2 text-sm font-bold text-slate-900">
              View live slots
            </p>
            <p className="mt-1 text-xs text-slate-500">Choose a time</p>
          </div>
        </div>

        {actions && (
          <div className="mt-5 border-t border-slate-100 pt-5">{actions}</div>
        )}
      </div>
    </Card>
  );
}

export default TurfCard;
