import { useEffect, useRef, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock,
  Lock,
  MoreVertical,
  Pencil,
  Trash2,
  Unlock,
  User,
} from "lucide-react";

const STATUS_CONFIG = {
  AVAILABLE: {
    label: "Available",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    rail: "bg-emerald-500",
    icon: CheckCircle2,
    helper: "Ready for booking",
  },
  BOOKED: {
    label: "Booked",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    rail: "bg-blue-500",
    icon: User,
    helper: "Booked by player",
  },
  BLOCKED: {
    label: "Blocked",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    rail: "bg-red-500",
    icon: Lock,
    helper: "Blocked by owner",
  },
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

function CalendarSlotCard({
  slot,
  onEdit,
  onBlock,
  onUnblock,
  onDelete,
  onViewBooking,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const statusConfig = STATUS_CONFIG[slot.status] || STATUS_CONFIG.AVAILABLE;
  const StatusIcon = statusConfig.icon;

  const booking = slot.booking;

  const playerName =
    booking?.player?.name ||
    booking?.user?.name ||
    booking?.playerName ||
    "Player";

  const helperText =
    slot.status === "BOOKED" ? `Booked by ${playerName}` : statusConfig.helper;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="group relative overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`absolute left-0 top-0 h-full w-1.5 ${statusConfig.rail}`}
      />

      <div className="flex items-start justify-between gap-4 p-4 pl-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <p className="font-semibold text-slate-900">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.badge}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
              />
              {statusConfig.label}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2">
              <StatusIcon className="h-4 w-4 text-slate-600" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {slot.turfName}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">{helperText}</p>
            </div>
          </div>
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
              {slot.status === "BOOKED" && (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onViewBooking?.(slot);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <User className="h-4 w-4" />
                  View Booking
                </button>
              )}

              {slot.status !== "BOOKED" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      onEdit?.(slot);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Slot
                  </button>

                  {slot.status === "AVAILABLE" && (
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        onBlock?.(slot);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <Ban className="h-4 w-4" />
                      Block Slot
                    </button>
                  )}

                  {slot.status === "BLOCKED" && (
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        onUnblock?.(slot);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <Unlock className="h-4 w-4" />
                      Unblock Slot
                    </button>
                  )}

                  <div className="my-2 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      onDelete?.(slot);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Slot
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarSlotCard;
