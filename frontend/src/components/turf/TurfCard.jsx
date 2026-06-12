import { MapPin, IndianRupee } from "lucide-react";

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
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <img
        src={turf.imageUrl || FALLBACK_IMAGE}
        alt={turf.name}
        className="h-56 w-full object-cover"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              turf.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {turf.isActive ? "Active" : "Inactive"}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              sportColors[turf.sport]
            }`}
          >
            {turf.sport}
          </span>
        </div>

        <h2 className="text-3xl font-bold">{turf.name}</h2>

        <p className="mt-3 line-clamp-2 text-slate-500">
          {turf.description || "No description available."}
        </p>

        <div className="mt-5 flex items-center gap-2 text-slate-600">
          <MapPin size={18} />
          {turf.location}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xl font-bold text-green-700">
          <IndianRupee size={20} />₹{turf.pricePerHour}/hour
        </div>

        {actions && (
          <div className="mt-6 border-t border-slate-200 pt-6">{actions}</div>
        )}
      </div>
    </Card>
  );
}

export default TurfCard;
