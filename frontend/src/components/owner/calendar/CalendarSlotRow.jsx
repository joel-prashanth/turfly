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
    <div className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-slate-50">
      <div className="flex flex-1 items-start gap-4">
        <div
          className={`mt-2 h-3 w-3 rounded-full ${
            slot.status === "AVAILABLE"
              ? "bg-emerald-500"
              : slot.status === "BOOKED"
                ? "bg-blue-500"
                : "bg-red-500"
          }`}
        />

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold text-slate-900">
              {formatTime(slot.startTime)}
            </h4>

            <div className="h-px flex-1 bg-slate-300" />

            <h4 className="text-lg font-bold text-slate-900">
              {formatTime(slot.endTime)}
            </h4>
          </div>
          <div className="mt-3">
            {isBooked && slot.booking?.player ? (
              <div className="mt-3">
                <p className="text-sm text-slate-500">
                  👤 {slot.booking.player.name}
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_STYLES[slot.status]
                  }`}
                >
                  {STATUS_LABELS[slot.status]}
                </span>
              </div>
            ) : isBlocked ? (
              <div className="mt-3">
                <p className="text-sm text-slate-500">🔒 Blocked by owner</p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_STYLES[slot.status]
                  }`}
                >
                  {STATUS_LABELS[slot.status]}
                </span>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-slate-500">Ready for booking</p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_STYLES[slot.status]
                  }`}
                >
                  {STATUS_LABELS[slot.status]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarSlotRow;
