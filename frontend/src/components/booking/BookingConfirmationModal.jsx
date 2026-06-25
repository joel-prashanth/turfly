import {
  AlertCircle,
  CalendarDays,
  Clock,
  IndianRupee,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const formatDuration = (startMs, endMs) => {
  const mins = (endMs - startMs) / 60000;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${m} min`;
};

const formatPrice = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const slotAmount = (slot, pricePerHour) => {
  const hrs = (new Date(slot.endTime) - new Date(slot.startTime)) / 3600000;
  return Math.round(hrs * Number(pricePerHour || 0));
};

function BookingConfirmationModal({ open, turf, slots = [], loading, onClose, onConfirm }) {
  if (!slots.length || !turf) return null;

  const sorted = [...slots].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalDuration = new Date(last.endTime) - new Date(first.startTime);
  const totalAmount = sorted.reduce((sum, s) => sum + slotAmount(s, turf.pricePerHour), 0);

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Confirm Booking"
      size="md"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={onConfirm} loading={loading}>Confirm Booking</Button>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Venue */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-base font-bold text-slate-900">{turf.name}</h3>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={12} className="shrink-0 text-slate-400" />
                <span className="truncate">{turf.location}</span>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
              {turf.sport?.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        {/* Date / time / duration */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <CalendarDays size={13} /> Date
            </div>
            <p className="mt-1 text-sm font-bold text-slate-900">{formatDate(first.startTime)}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Clock size={13} /> Time
            </div>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatTime(first.startTime)} &ndash; {formatTime(last.endTime)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Clock size={13} /> Duration
            </div>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatDuration(new Date(first.startTime), new Date(last.endTime))}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <IndianRupee size={13} /> Rate
            </div>
            <p className="mt-1 text-sm font-bold text-slate-900">
              &#8377;{formatPrice(turf.pricePerHour)} / hr
            </p>
          </div>
        </div>

        {/* Per-slot breakdown when >1 slot */}
        {sorted.length > 1 && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Slot breakdown</p>
            {sorted.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  Slot {i + 1} · {formatTime(s.startTime)} – {formatTime(s.endTime)}
                </span>
                <span className="font-semibold text-slate-800">
                  &#8377;{formatPrice(slotAmount(s, turf.pricePerHour))}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-700">Total payable</p>
          <p className="text-2xl font-black tracking-tight text-emerald-700">
            &#8377;{formatPrice(totalAmount)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs leading-5 text-slate-600">
              Slot{sorted.length > 1 ? "s" : ""} reserved for you instantly. Pay at the venue on game day.
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs leading-5 text-amber-800">
              <span className="font-semibold">Cancellation: </span>
              {turf.cancellationWindowHours === 0
                ? "Not allowed by this venue."
                : `Must cancel at least ${turf.cancellationWindowHours}h before slot starts.`}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BookingConfirmationModal;
