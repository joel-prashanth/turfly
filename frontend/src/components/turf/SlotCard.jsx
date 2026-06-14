import Button from "../ui/Button";
import Card from "../ui/Card";
import { CalendarDays, Clock } from "lucide-react";

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

const getDuration = (start, end) => {
  const diff =
    (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60;

  return `${diff} min`;
};

const statusStyles = {
  AVAILABLE: "bg-green-100 text-green-700",
  BOOKED: "bg-red-100 text-red-700",
  BLOCKED: "bg-slate-200 text-slate-700",
};

function SlotCard({ slot, canBook, onBook }) {
  const isAvailable = slot.status === "AVAILABLE";

  return (
    <Card
      className="
        border
        border-slate-200
        p-6
        transition-all
        duration-300
        hover:border-green-200
        hover:shadow-lg
      "
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Slot Details */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[slot.status]
              }`}
            >
              {slot.status}
            </span>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={16} />
              {formatDate(slot.startTime)}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Clock className="text-green-600" size={22} />

            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Duration: {getDuration(slot.startTime, slot.endTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          {isAvailable ? (
            canBook ? (
              <Button onClick={() => onBook(slot)}>Book Now</Button>
            ) : (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                Players Only
              </span>
            )
          ) : (
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                statusStyles[slot.status]
              }`}
            >
              {slot.status === "BOOKED" ? "Booked" : "Blocked"}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default SlotCard;
