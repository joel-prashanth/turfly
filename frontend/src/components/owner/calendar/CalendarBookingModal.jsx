import { useState } from "react";
import {
  CalendarDays,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  User,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../ui/Button";
import { ownerCancelBooking } from "../../../api/bookingApi";

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

function CalendarBookingModal({ open, onClose, slot, onCancelled }) {
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!open || !slot) return null;

  const booking = slot.booking;
  const playerName = booking?.player?.name || "Player";
  const playerEmail = booking?.player?.email || null;
  const playerPhone = booking?.player?.phone || null;
  const amount = booking?.amount || null;
  const bookingStatus = booking?.status || "CONFIRMED";

  const isUpcoming = new Date(slot.endTime) > new Date();
  const canCancel = booking && bookingStatus === "CONFIRMED" && isUpcoming;

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await ownerCancelBooking(booking.id);
      toast.success("Booking cancelled.");
      setConfirmCancel(false);
      onClose();
      onCancelled?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-blue-600">Booking Details</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {slot.turfName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Slot info */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-semibold text-slate-900">
                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
              </p>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  bookingStatus === "CONFIRMED"
                    ? "border-blue-200 bg-white text-blue-700"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {bookingStatus}
              </span>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                {formatDate(slot.startTime)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
              </div>
              {slot.sport && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  {slot.sport}
                </div>
              )}
              {amount && (
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <IndianRupee className="h-4 w-4 text-blue-500" />
                  ₹{amount.toLocaleString("en-IN")}
                </div>
              )}
            </div>
          </div>

          {/* Player info */}
          {booking ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Booked by</p>
                  <p className="font-semibold text-slate-900">{playerName}</p>
                </div>
              </div>

              {(playerEmail || playerPhone) && (
                <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  {playerEmail && <p>{playerEmail}</p>}
                  {playerPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {playerPhone}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Slot is booked but player details are not available.
            </div>
          )}

          {/* Cancel confirmation */}
          {confirmCancel && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Cancel this booking?
              </p>
              <p className="mt-1 text-sm text-red-700">
                The slot will become available again. This cannot be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleCancel}
                  loading={cancelling}
                >
                  Yes, cancel it
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelling}
                >
                  Keep booking
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          {canCancel && !confirmCancel ? (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
              Cancel booking
            </button>
          ) : (
            <span />
          )}

          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CalendarBookingModal;
