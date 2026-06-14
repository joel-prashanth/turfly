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
        hover:-translate-y-1.5
        hover:border-green-200
        hover:shadow-2xl
      "
    >
      <div className="relative overflow-hidden">
        <img
          src={turf.imageUrl || FALLBACK_IMAGE}
          alt={turf.name}
          className="
            h-60
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

        {/* Sport Badge */}
        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${sportColors[turf.sport]}`}
          >
            {turf.sport}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Status */}
        <div className="mb-4 flex items-center">
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

        {/* Name */}
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {turf.name}
        </h2>

        {/* Description */}
        <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-slate-500">
          {turf.description || "No description available."}
        </p>

        {/* Location */}
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
          <MapPin size={17} className="shrink-0 text-slate-400" />
          <span className="truncate">{turf.location}</span>
        </div>

        {/* Price */}
        <div className="mt-7 flex items-end justify-between">
          <div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold tracking-tight text-green-600">
                ₹{turf.pricePerHour}
              </span>

              <span className="pb-1 text-sm text-slate-500">/ hour</span>
            </div>
          </div>
        </div>

        {actions && (
          <div className="mt-6 border-t border-slate-100 pt-6">{actions}</div>
        )}
      </div>
    </Card>
  );
}

export default TurfCard;
