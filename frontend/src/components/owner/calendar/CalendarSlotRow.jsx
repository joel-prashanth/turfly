import { CalendarClock, CheckCircle2, Lock, User } from "lucide-react";

const STATUS_STYLES = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  BOOKED: "bg-blue-50 text-blue-700 border border-blue-200",
  BLOCKED: "bg-red-50 text-red-700 border border-red-200",
};

const STATUS_LABELS = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
  BLOCKED: "Blocked",
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

function CalendarSlotRow({ slot }) {
  const isBooked = slot.status === "BOOKED";
  const isBlocked = slot.status === "BLOCKED";

  return (
    <div className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-slate-50 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-slate-100 p-3">
          <CalendarClock size={20} className="text-slate-600" />
        </div>

        <div>
          <h4 className="font-semibold text-slate-900">
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </h4>

          {isBooked && slot.booking?.player ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <User size={15} />
              <span>{slot.booking.player.name}</span>
            </div>
          ) : isBlocked ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Lock size={15} />
              <span>Blocked by owner</span>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle2 size={15} />
              <span>Ready for booking</span>
            </div>
          )}
        </div>
      </div>

      <div
        className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ${
          STATUS_STYLES[slot.status]
        }`}
      >
        {STATUS_LABELS[slot.status]}
      </div>
    </div>
  );
}

export default CalendarSlotRow;
