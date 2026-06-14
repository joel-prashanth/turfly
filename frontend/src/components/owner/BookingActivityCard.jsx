import { CalendarDays, Clock3, User } from "lucide-react";

import Card from "../ui/Card";

function BookingActivityCard({ booking }) {
  const { player, slot, status } = booking;

  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);

  const date = start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const startTime = start.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  const endTime = end.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  const initials = player.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const statusStyles = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <Card className="border border-slate-200 p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        {/* Left */}
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
            {initials}
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {player.name}
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Booked{" "}
              <span className="font-medium text-slate-800">
                {slot.turf.name}
              </span>
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {slot.turf.sport}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[status]
                }`}
              >
                {status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <CalendarDays size={15} />
                {date}
              </div>

              <div className="flex items-center gap-1">
                <Clock3 size={15} />
                {startTime} - {endTime}
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <User className="text-slate-300" size={20} />
      </div>
    </Card>
  );
}

export default BookingActivityCard;
