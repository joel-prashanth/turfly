import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  IndianRupee,
  MapPin,
  Phone,
  ChevronRight,
  UserCheck,
  UserX,
} from "lucide-react";
import toast from "react-hot-toast";

import Card from "../ui/Card";
import BookingStatusBadge from "./BookingStatusBadge";
import { markAttendance } from "../../api/depositApi";

function OwnerBookingCard({ booking, onViewDetails, onAttendanceMarked }) {
  const { player, slot, status } = booking;
  const playerName = player?.name || booking.walkInName || "Walk-in";
  const playerPhone = player?.phone || booking.walkInPhone || "—";
  const [marking, setMarking] = useState(null); // "attended" | "no_show"

  const slotEnded = new Date(slot.endTime) < new Date();
  const needsAttendance =
    status === "CONFIRMED" &&
    slotEnded &&
    !booking.attendanceStatus &&
    booking.depositStatus === "PAID";

  const handleAttendance = async (attended) => {
    setMarking(attended ? "attended" : "no_show");
    try {
      await markAttendance(booking.id, attended);
      toast.success(attended ? "Attendance marked — deposit will be refunded." : "No-show recorded — deposit forfeited.");
      onAttendanceMarked?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setMarking(null);
    }
  };

  const turf = slot.turf;

  return (
    <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {playerName}
            </h3>

            <BookingStatusBadge status={status} />
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Phone size={16} />

              {playerPhone}
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

        <div className="flex shrink-0 flex-col items-end gap-2">
          {/* Attendance status badge */}
          {booking.attendanceStatus === "ATTENDED" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <UserCheck size={12} /> Attended
            </span>
          )}
          {booking.attendanceStatus === "NO_SHOW" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              <UserX size={12} /> No-show
            </span>
          )}

          {/* Attendance prompt */}
          {needsAttendance && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Did they show up?</span>
              <button
                onClick={() => handleAttendance(true)}
                disabled={!!marking}
                className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
              >
                <UserCheck size={13} />
                {marking === "attended" ? "..." : "Yes"}
              </button>
              <button
                onClick={() => handleAttendance(false)}
                disabled={!!marking}
                className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
              >
                <UserX size={13} />
                {marking === "no_show" ? "..." : "No-show"}
              </button>
            </div>
          )}

          <button
            onClick={() => onViewDetails?.(booking)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50"
          >
            View Details
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
}

export default OwnerBookingCard;
