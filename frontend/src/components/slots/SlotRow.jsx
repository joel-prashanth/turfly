import { CheckCircle2, Clock, IndianRupee, Lock, User } from "lucide-react";
import SlotActions from "./SlotActions";

const STATUS_META = {
  AVAILABLE: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rail: "bg-emerald-500",
    label: "Available",
  },
  BOOKED: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    rail: "bg-blue-500",
    label: "Booked",
  },
  BLOCKED: {
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    rail: "bg-slate-400",
    label: "Blocked",
  },
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getDuration = (start, end) => {
  const mins = (new Date(end) - new Date(start)) / 60000;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

const getAmount = (start, end, pricePerHour) => {
  if (!pricePerHour) return null;
  const hours = (new Date(end) - new Date(start)) / 3600000;
  return Math.round(hours * Number(pricePerHour));
};

function SlotRow({ slot, pricePerHour, refreshSlots, onEdit, onWalkIn }) {
  const isBooked = slot.status === "BOOKED";
  const isBlocked = slot.status === "BLOCKED";
  const duration = getDuration(slot.startTime, slot.endTime);
  const amount = getAmount(slot.startTime, slot.endTime, pricePerHour);
  const meta = STATUS_META[slot.status] ?? STATUS_META.AVAILABLE;

  const renderHelper = () => {
    if (isBooked) {
      return (
        <span className="flex items-center gap-1 text-blue-600">
          <User size={13} />
          {slot.booking?.player?.name || slot.booking?.walkInName || "Booked"}
        </span>
      );
    }
    if (isBlocked) {
      return (
        <span className="flex items-center gap-1 text-slate-500">
          <Lock size={13} />
          Blocked by you
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-emerald-600">
        <CheckCircle2 size={13} />
        Open for booking
      </span>
    );
  };

  return (
    <div className="flex overflow-hidden transition-colors hover:bg-slate-50">
      {/* Colored left rail */}
      <div className={`w-1 shrink-0 ${meta.rail}`} />

      <div className="flex flex-1 flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left — time + meta */}
        <div className="flex items-center gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isBooked ? "bg-blue-50" : isBlocked ? "bg-slate-100" : "bg-emerald-50"
          }`}>
            <Clock size={17} className={
              isBooked ? "text-blue-500" : isBlocked ? "text-slate-400" : "text-emerald-600"
            } />
          </div>

          <div>
            <p className="text-base font-bold text-slate-900">
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500">
              <span>{duration}</span>
              {amount !== null && (
                <span className="flex items-center gap-0.5 font-semibold text-slate-700">
                  <IndianRupee size={12} />
                  {amount.toLocaleString("en-IN")}
                </span>
              )}
              {renderHelper()}
            </div>
          </div>
        </div>

        {/* Right — status badge + actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${meta.badge}`}>
            {meta.label}
          </span>
          <SlotActions slot={slot} refreshSlots={refreshSlots} onEdit={onEdit} onWalkIn={onWalkIn} />
        </div>
      </div>
    </div>
  );
}

export default SlotRow;
