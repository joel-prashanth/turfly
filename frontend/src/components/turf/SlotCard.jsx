import { CalendarDays, Clock } from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";

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

function SlotCard({ slot, canBook, onBook }) {
  const now = new Date();

  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);

  const isInProgress = now >= start && now < end;
  const hasEnded = now >= end;

  const renderAction = () => {
    if (slot.status === "BOOKED") {
      return (
        <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
          Booked
        </span>
      );
    }

    if (slot.status === "BLOCKED") {
      return (
        <span className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Blocked
        </span>
      );
    }

    if (hasEnded) {
      return (
        <span className="rounded-full bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
          Unavailable
        </span>
      );
    }

    if (isInProgress) {
      return (
        <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
          In Progress
        </span>
      );
    }

    if (canBook) {
      return <Button onClick={() => onBook(slot)}>Book Now</Button>;
    }

    return (
      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
        Players Only
      </span>
    );
  };

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
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={16} />
            {formatDate(slot.startTime)}
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
          {renderAction()}
        </div>
      </div>
    </Card>
  );
}

export default SlotCard;