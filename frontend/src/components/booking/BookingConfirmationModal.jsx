import { CalendarDays, Clock, IndianRupee, MapPin } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

function BookingConfirmationModal({
  open,
  turf,
  slot,
  loading,
  onClose,
  onConfirm,
}) {
  if (!slot || !turf) return null;

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Confirm Booking"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button onClick={onConfirm} loading={loading}>
            Confirm Booking
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{turf.name}</h3>

          <div className="mt-2 flex items-center gap-2 text-slate-600">
            <MapPin size={17} />
            {turf.location}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <CalendarDays size={18} className="text-green-600" />

            <span>{formatDate(slot.startTime)}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock size={18} className="text-green-600" />

            <span>
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <IndianRupee size={18} className="text-green-600" />

            <span className="font-semibold">₹{turf.pricePerHour} / hour</span>
          </div>
        </div>

        <p className="text-sm leading-7 text-slate-500">
          Please confirm your booking. Once confirmed, this slot will no longer
          be available for other players.
        </p>
      </div>
    </Modal>
  );
}

export default BookingConfirmationModal;
