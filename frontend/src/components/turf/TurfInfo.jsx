import { MapPin, IndianRupee, Star, Navigation2, Clock } from "lucide-react";

import Card from "../ui/Card";
import turfImages from "../../utils/turfImages";

const sportColors = {
  FOOTBALL: "bg-green-100 text-green-700",
  CRICKET: "bg-blue-100 text-blue-700",
  BADMINTON: "bg-yellow-100 text-yellow-700",
  TENNIS: "bg-purple-100 text-purple-700",
  BASKETBALL: "bg-orange-100 text-orange-700",
  VOLLEYBALL: "bg-pink-100 text-pink-700",
};

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

function fmt12(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function BusinessHoursDisplay({ hours }) {
  if (!hours) return null;

  // Group consecutive days with same hours
  const groups = [];
  let current = null;
  for (const { key, label } of DAYS) {
    const day = hours[key];
    if (!day) continue;
    const sig = day.closed ? "closed" : `${day.open}-${day.close}`;
    if (current && current.sig === sig) {
      current.end = label;
    } else {
      current = { start: label, end: label, sig, closed: day.closed, open: day.open, close: day.close };
      groups.push(current);
    }
  }

  return (
    <div className="mt-10 border-t border-slate-200 pt-8">
      <div className="flex items-center gap-2 mb-5">
        <Clock size={20} className="text-slate-400" />
        <h2 className="text-2xl font-semibold text-slate-900">Hours</h2>
        <span className="text-xs text-slate-400 ml-1 italic">Typical hours · not guaranteed</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
        {groups.map((g, i) => {
          const range = g.start === g.end ? g.start : `${g.start}–${g.end}`;
          return (
            <div key={i} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-2.5">
              <span className="text-sm font-medium text-slate-700">{range}</span>
              {g.closed ? (
                <span className="text-sm text-slate-400">Closed</span>
              ) : (
                <span className="text-sm text-slate-600">{fmt12(g.open)} – {fmt12(g.close)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TurfInfo({ turf }) {
  const fallbackImage = turfImages[turf.name.length % turfImages.length];

  const image = turf.imageUrl || fallbackImage;

  return (
    <Card className="mb-12 overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Hero Image */}
      <div className="relative">
        <img
          src={image}
          alt={turf.name}
          className="h-64 w-full object-cover sm:h-80 lg:h-[460px]"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute left-6 top-6">
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-sm ${
              sportColors[turf.sport]
            }`}
          >
            {turf.sport}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {turf.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-6 text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-slate-400" />
                <span>{turf.location}</span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${turf.name} ${turf.location}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <Navigation2 size={12} />
                  Get Directions
                </a>
              </div>

              <div className="flex items-center gap-2">
                {turf.avgRating ? (
                  <>
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{turf.avgRating}</span>
                    <span className="text-slate-400">({turf.reviewCount} {turf.reviewCount === 1 ? "review" : "reviews"})</span>
                  </>
                ) : (
                  <>
                    <Star size={18} className="fill-slate-200 text-slate-200" />
                    <span className="text-slate-400 text-sm italic">No reviews yet</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-green-50 px-6 py-5">
            <div className="text-sm font-medium uppercase tracking-wide text-green-700">
              Price
            </div>

            <div className="mt-2 flex items-end gap-1">
              <IndianRupee size={28} className="mb-1 text-green-700" />

              <span className="text-4xl font-bold text-green-700">
                {turf.pricePerHour}
              </span>

              <span className="mb-1 text-slate-500">/ hour</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            About this venue
          </h2>

          <p className="mt-4 max-w-4xl leading-8 text-slate-600">
            {turf.description ||
              "No description has been added for this turf yet."}
          </p>
        </div>

        <BusinessHoursDisplay hours={turf.businessHours} />
      </div>
    </Card>
  );
}

export default TurfInfo;
