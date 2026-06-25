import { MapPin, IndianRupee, Star, Navigation2 } from "lucide-react";

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
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.8</span>
                <span className="text-slate-400">(120 reviews)</span>
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
      </div>
    </Card>
  );
}

export default TurfInfo;
