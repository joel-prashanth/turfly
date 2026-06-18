import {
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  ShieldCheck,
} from "lucide-react";

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

const formatDuration = (start, end) => {
  const diffInMinutes =
    (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60;

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours && minutes) {
    return `${hours} hr ${minutes} min`;
  }

  if (hours) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }

  return `${minutes} min`;
};

const calculateAmount = (slot, pricePerHour) => {
  const durationHours =
    (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) /
    1000 /
    60 /
    60;

  return Math.round(durationHours * Number(pricePerHour || 0));
};

const formatPrice = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
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

  const duration = formatDuration(slot.startTime, slot.endTime);
  const totalAmount = calculateAmount(slot, turf.pricePerHour);

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Confirm Booking"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button onClick={onConfirm} loading={loading}>
            Confirm Booking
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h3 className="line-clamp-1 text-xl font-bold text-slate-900">
                {turf.name}
              </h3>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={16} className="shrink-0 text-slate-400" />
                <span className="truncate">{turf.location}</span>
              </div>

              <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                {turf.sport?.replaceAll("_", " ")}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <CalendarDays size={16} />
              Date
            </div>

            <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
              {formatDate(slot.startTime)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Clock size={16} />
              Time
            </div>

            <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Clock size={16} />
              Duration
            </div>

            <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
              {duration}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <IndianRupee size={16} />
              Price
            </div>

            <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
              ₹{formatPrice(turf.pricePerHour)} / hour
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Total payable
              </p>

              <p className="mt-1 text-xs text-emerald-700/80">
                Calculated from slot duration and turf hourly price.
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-black tracking-tight text-emerald-700">
                ₹{formatPrice(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <p className="text-sm leading-6 text-slate-600">
              Once confirmed, this slot will be reserved for you and will no
              longer be available for other players. Razorpay payment will be
              connected in the next sprint.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BookingConfirmationModal;
