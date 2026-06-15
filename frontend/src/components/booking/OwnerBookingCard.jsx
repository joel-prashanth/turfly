import {
  CalendarDays,
  Clock3,
  IndianRupee,
  MapPin,
  Phone,
  ChevronRight,
} from "lucide-react";

import Card from "../ui/Card";
import Badge from "../ui/Badge";
import BookingStatusBadge from "./BookingStatusBadge";

function OwnerBookingCard({ booking, onViewDetails }) {
  const { player, slot, status } = booking;

  const turf = slot.turf;

  return (
    <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {player.name}
            </h3>

            <BookingStatusBadge status={status} />
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Phone size={16} />

              {player.phone}
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} />

              {turf.name}
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays size={16} />

              {new Date(slot.startTime).toLocaleDateString()}
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={16} />

              {new Date(slot.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" - "}
              {new Date(slot.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className="flex items-center gap-2 font-medium text-slate-900">
              <IndianRupee size={16} />

              {turf.pricePerHour}
            </div>
          </div>
        </div>

        <button
          onClick={() => onViewDetails?.(booking)}
          className="flex items-center gap-2 self-end rounded-lg px-3 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50"
        >
          View Details
          <ChevronRight size={18} />
        </button>
      </div>
    </Card>
  );
}

export default OwnerBookingCard;
