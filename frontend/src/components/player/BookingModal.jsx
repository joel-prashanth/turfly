import { Calendar, Clock, MapPin } from "lucide-react";

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

function BookingModal({ open, turf, slot, loading, onClose, onConfirm }) {
  if (!turf || !slot) {
    return null;
  }

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        Cancel
      </Button>

      <Button onClick={onConfirm} loading={loading}>
        Confirm Booking
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      title="Confirm Booking"
      footer={footer}
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl">
          <img
            src={turf.imageUrl}
            alt={turf.name}
            className="h-48 w-full object-cover"
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-900">{turf.name}</h3>

          <div className="mt-2 flex items-center gap-2 text-slate-600">
            <MapPin size={18} />
            <span>{turf.location}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar size={18} />

            <span>{formatDate(slot.startTime)}</span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-slate-700">
            <Clock size={18} />

            <span>
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </span>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">Booking Price</p>

            <p className="mt-1 text-2xl font-bold text-emerald-600">
              ₹{turf.pricePerHour}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Once confirmed, this slot will be reserved exclusively for you.
        </p>
      </div>
    </Modal>
  );
}

export default BookingModal;
