import {
  CalendarDays,
  Clock,
  IndianRupee,
  MapPin,
  User,
  X,
} from "lucide-react";

import Button from "../../ui/Button";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

function CalendarBookingModal({ open, onClose, slot }) {
  if (!open || !slot) return null;

  const booking = slot.booking;

  const playerName =
    booking?.player?.name ||
    booking?.user?.name ||
    booking?.playerName ||
    "Player";

  const playerEmail =
    booking?.player?.email ||
    booking?.user?.email ||
    booking?.playerEmail ||
    "Not available";

  const amount =
    booking?.amount ||
    booking?.totalAmount ||
    booking?.price ||
    booking?.finalAmount ||
    null;

  const bookingStatus = booking?.status || "CONFIRMED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-blue-600">Booking Details</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {slot.turfName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View player and slot booking information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-700">Booked Slot</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </h3>
              </div>

              <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                {bookingStatus}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                <span>{formatDate(slot.startTime)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>{slot.sport || "Sport"}</span>
              </div>

              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-blue-600" />
                <span>{amount ? `₹${amount}` : "Amount not available"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                <User className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Booked by</p>
                <h3 className="font-semibold text-slate-900">{playerName}</h3>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Contact
              </p>
              <p className="mt-1 text-sm text-slate-700">{playerEmail}</p>
            </div>
          </div>

          {!booking && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Booking object is not coming from the calendar API yet. The slot
              is booked, but detailed player information is missing.
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CalendarBookingModal;
