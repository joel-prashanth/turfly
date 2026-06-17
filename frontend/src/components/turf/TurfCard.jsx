import { MapPin } from "lucide-react";

import Card from "../ui/Card";

const sportColors = {
  FOOTBALL: "bg-green-100 text-green-700",
  CRICKET: "bg-blue-100 text-blue-700",
  BADMINTON: "bg-yellow-100 text-yellow-700",
  TENNIS: "bg-purple-100 text-purple-700",
  BASKETBALL: "bg-orange-100 text-orange-700",
  VOLLEYBALL: "bg-pink-100 text-pink-700",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200";

function TurfCard({ turf, actions }) {
  return (
    <Card
      className="
        group
        overflow-hidden
        border
        border-slate-200/80
        bg-white
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-green-200
        hover:shadow-xl
      "
    >
      <div className="relative overflow-hidden">
        <img
          src={turf.imageUrl || FALLBACK_IMAGE}
          alt={turf.name}
          className="
            h-48
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-105
          "
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
              sportColors[turf.sport] || "bg-slate-100 text-slate-700"
            }`}
          >
            {turf.sport}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              turf.isActive
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                turf.isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />

            {turf.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <h2 className="line-clamp-1 text-xl font-bold tracking-tight text-slate-900">
          {turf.name}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {turf.description || "No description available."}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <MapPin size={16} className="shrink-0 text-slate-400" />
          <span className="truncate">{turf.location}</span>
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold tracking-tight text-green-600">
              ₹{turf.pricePerHour}
            </span>

            <span className="pb-0.5 text-sm text-slate-500">/ hour</span>
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
