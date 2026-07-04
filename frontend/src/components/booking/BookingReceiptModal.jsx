import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  Printer,
  Share2,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const SPORT_LABEL = {
  FOOTBALL: "Football", CRICKET: "Cricket", BADMINTON: "Badminton",
  TENNIS: "Tennis", BASKETBALL: "Basketball", VOLLEYBALL: "Volleyball",
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const fmtDuration = (start, end) => {
  const mins = (new Date(end) - new Date(start)) / 60000;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

const fmtPrice = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function BookingReceiptModal({ open, booking, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const turf = booking.slot.turf;
  const extraSlots = booking.extraSlots ?? [];
  const endTime = extraSlots.length > 0
    ? extraSlots[extraSlots.length - 1].slot.endTime
    : booking.slot.endTime;
  const totalSlots = 1 + extraSlots.length;
  const refId = booking.id.slice(0, 8).toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(refId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = `Turfly Booking\n${refId}\n${turf.name} · ${fmtDate(booking.slot.startTime)}\n${fmtTime(booking.slot.startTime)}–${fmtTime(endTime)}`;
    if (navigator.share) {
      await navigator.share({ title: "Turfly Booking", text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Booking Receipt" size="sm">
      <div className="space-y-4 pb-2">

        {/* Confirmed badge */}
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700">Confirmed</span>
        </div>

        {/* Booking ref */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Booking Ref</p>
            <p className="mt-0.5 font-mono text-xl font-bold tracking-wider text-slate-900">{refId}</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <Copy size={13} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Details */}
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">

          <div className="flex items-center gap-3 px-4 py-3">
            <MapPin size={15} className="shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Venue</p>
              <p className="truncate text-sm font-bold text-slate-900">{turf.name}</p>
              <p className="truncate text-xs text-slate-500">{turf.location}</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {SPORT_LABEL[turf.sport] ?? turf.sport}
            </span>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <CalendarDays size={15} className="shrink-0 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="text-sm font-bold text-slate-900">{fmtDate(booking.slot.startTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <Clock size={15} className="shrink-0 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Time</p>
              <p className="text-sm font-bold text-slate-900">
                {fmtTime(booking.slot.startTime)} – {fmtTime(endTime)}
                <span className="ml-2 text-xs font-semibold text-slate-400">
                  ({fmtDuration(booking.slot.startTime, endTime)}{totalSlots > 1 ? ` · ${totalSlots} slots` : ""})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold text-slate-500">Amount due at venue</p>
            <p className="text-base font-black text-slate-900">₹{fmtPrice(booking.amount)}</p>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-slate-400">
          Show this reference at the venue to check in. Pay on arrival.
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 gap-1.5" onClick={handleShare}>
            <Share2 size={14} /> Share
          </Button>
          <Button variant="secondary" className="flex-1 gap-1.5" onClick={handlePrint}>
            <Printer size={14} /> Print
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
