import { CalendarDays, Clock, IndianRupee, MapPin } from "lucide-react";

import Card from "../ui/Card";

const sportColors = {
  FOOTBALL: "bg-green-100 text-green-700",
  CRICKET: "bg-blue-100 text-blue-700",
  BADMINTON: "bg-yellow-100 text-yellow-700",
  TENNIS: "bg-purple-100 text-purple-700",
  BASKETBALL: "bg-orange-100 text-orange-700",
  VOLLEYBALL: "bg-pink-100 text-pink-700",
};

const statusColors = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

function BookingCard({ booking }) {
  const turf = booking.slot.turf;

  return (
    <Card className="overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-xl hover:border-green-200">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <img
          src={turf.imageUrl || FALLBACK_IMAGE}
          alt={turf.name}
          className="h-56 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <div className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  sportColors[turf.sport]
                }`}
              >
                {turf.sport}
              </span>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {turf.name}
              </h2>

              <div className="mt-5 space-y-3 text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  {turf.location}
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays size={18} />
                  {formatDate(booking.slot.startTime)}
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  {formatTime(booking.slot.startTime)} –{" "}
                  {formatTime(booking.slot.endTime)}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="flex items-center text-2xl font-bold text-green-700">
                <IndianRupee size={24} />
                {turf.pricePerHour}
                <span className="ml-1 text-sm text-slate-500">/hr</span>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  statusColors[booking.status]
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default BookingCard;
