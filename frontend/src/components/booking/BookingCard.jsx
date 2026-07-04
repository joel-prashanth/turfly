import { useState } from "react";
import {
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Star,
  Clock,
  IndianRupee,
  MapPin,
  QrCode,
  Receipt,
  ReceiptText,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import PaymentQrModal from "../ui/PaymentQrModal";
import DepositPaymentModal from "./DepositPaymentModal";
import ExtendSessionSheet from "./ExtendSessionSheet";
import RescheduleModal from "./RescheduleModal";
import BookingReceiptModal from "./BookingReceiptModal";
import ReviewModal from "./ReviewModal";

const sportColors = {
  FOOTBALL: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CRICKET: "bg-blue-100 text-blue-700 border-blue-200",
  BADMINTON: "bg-yellow-100 text-yellow-700 border-yellow-200",
  TENNIS: "bg-purple-100 text-purple-700 border-purple-200",
  BASKETBALL: "bg-orange-100 text-orange-700 border-orange-200",
  VOLLEYBALL: "bg-pink-100 text-pink-700 border-pink-200",
};

const statusConfig = {
  CONFIRMED: {
    label: "Confirmed",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    rail: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    rail: "bg-amber-500",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
    rail: "bg-blue-500",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
    rail: "bg-red-500",
  },
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatSportLabel = (sport) => {
  if (!sport) return "Sport";

  return sport
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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

function BookingCard({ booking, onCancel, onDepositPaid, onExtended, onRescheduled }) {
  const [showQr, setShowQr] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const turf = booking.slot.turf;

  // If multi-slot booking, endTime is the last extra slot's endTime
  const extraSlots = booking.extraSlots ?? [];
  const bookingEndTime = extraSlots.length > 0
    ? extraSlots[extraSlots.length - 1].slot.endTime
    : booking.slot.endTime;
  const totalSlots = 1 + extraSlots.length;
  const status = statusConfig[booking.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  const qrUrl = turf.owner?.paymentQrUrl;
  const cancellationWindowHours = turf.cancellationWindowHours ?? 24;
  const withinWindow =
    cancellationWindowHours === 0
      ? true
      : Date.now() + cancellationWindowHours * 3600000 >
        new Date(booking.slot.startTime).getTime();
  const canCancel = booking.status === "CONFIRMED" && !withinWindow;
  const cancelBlocked = booking.status === "CONFIRMED" && withinWindow;
  const amount =
    booking.amount || calculateAmount(booking.slot, turf.pricePerHour);

  const paymentStatus = booking.payment?.status || null;
  const now = new Date();
  const slotUpcoming = new Date(booking.slot.startTime) > now;
  const slotActive =
    booking.status === "CONFIRMED" &&
    new Date(booking.slot.startTime) <= now &&
    new Date(booking.slot.endTime) > now;
  const depositPending =
    booking.status === "CONFIRMED" &&
    (slotUpcoming || slotActive) &&
    !booking.depositStatus &&
    !booking.depositPaymentId;
  const depositPaid = booking.depositStatus === "PAID";

  return (
    <>
    <Card
      className={`
        group overflow-hidden border border-slate-200 bg-white
        transition-all duration-300
        hover:border-emerald-200 hover:shadow-xl
        ${booking.status === "CANCELLED" ? "opacity-80" : ""}
      `}
    >
      <div className="flex">
        <div className={`hidden w-1.5 shrink-0 sm:block ${status.rail}`} />

        <div className="grid flex-1 lg:grid-cols-[280px_1fr]">
          <div className="relative overflow-hidden bg-slate-100">
            <img
              src={turf.imageUrl || FALLBACK_IMAGE}
              alt={turf.name}
              className="
                h-56 w-full object-cover
                transition-transform duration-700
                group-hover:scale-105
                lg:h-full
              "
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span
                className={`
                  rounded-full border px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-md
                  ${
                    sportColors[turf.sport] ||
                    "border-slate-200 bg-white text-slate-700"
                  }
                `}
              >
                {formatSportLabel(turf.sport)}
              </span>

              <span
                className={`
                  inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-md
                  ${status.badge}
                `}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="line-clamp-1 text-2xl font-black tracking-tight text-white">
                {turf.name}
              </h2>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
                <MapPin size={15} className="shrink-0" />
                <span className="truncate">{turf.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">

            {/* Info section — clean label/value pairs, no boxes */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" /> Date
                </p>
                <p className="mt-1.5 text-sm font-bold text-slate-900">
                  {formatDate(booking.slot.startTime)}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  <Clock className="h-3.5 w-3.5" /> Time
                </p>
                <p className="mt-1.5 text-sm font-bold text-slate-900">
                  {formatTime(booking.slot.startTime)} – {formatTime(bookingEndTime)}
                </p>
                {totalSlots > 1 && (
                  <p className="text-[11px] font-semibold text-emerald-600">{totalSlots} slots</p>
                )}
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  <Clock className="h-3.5 w-3.5" /> Duration
                </p>
                <p className="mt-1.5 text-sm font-bold text-slate-900">
                  {formatDuration(booking.slot.startTime, bookingEndTime)}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  <IndianRupee className="h-3.5 w-3.5" /> Amount
                </p>
                <p className="mt-1.5 text-sm font-bold text-slate-900">
                  ₹{formatPrice(amount)}
                </p>
                <p className="text-[11px] font-medium text-slate-400">{paymentStatus ?? "Pay at venue"}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 border-t border-dashed border-slate-200" />

            {/* Bottom bar — badges left, actions right */}
            <div className="flex flex-wrap items-center gap-2">

              {/* Left: status + passive indicators */}
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.badge}`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>

              {depositPaid && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> Deposit secured
                </span>
              )}

              {booking.status === "COMPLETED" && booking.review && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {booking.review.rating}/5 stars
                </span>
              )}

              {cancelBlocked && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-400">
                  Cancellation closed
                </span>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Right: action buttons */}
              {booking.status === "COMPLETED" && !booking.review && (
                <button
                  onClick={() => setShowReview(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  <Star className="h-3.5 w-3.5" /> Leave Review
                </button>
              )}

              {depositPending && (
                <button
                  onClick={() => setShowDeposit(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Pay deposit
                </button>
              )}

              {booking.status === "CONFIRMED" && qrUrl && (
                <button
                  onClick={() => setShowQr(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <QrCode className="h-3.5 w-3.5" /> Pay via QR
                </button>
              )}

              {booking.status === "CONFIRMED" && (
                <button
                  onClick={() => setShowReceipt(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Receipt className="h-3.5 w-3.5" /> Receipt
                </button>
              )}

              {slotActive && (
                <button
                  onClick={() => setShowExtend(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
                >
                  <Zap className="h-3.5 w-3.5" /> Extend
                </button>
              )}

              {canCancel && (
                <>
                  <button
                    onClick={() => setShowReschedule(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <CalendarClock className="h-3.5 w-3.5" /> Reschedule
                  </button>
                  <button
                    onClick={() => onCancel(booking)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>

    <PaymentQrModal
      open={showQr}
      onClose={() => setShowQr(false)}
      qrUrl={qrUrl}
      ownerName={turf.owner?.businessName || turf.owner?.name}
      amount={amount}
    />

    {showDeposit && (
      <DepositPaymentModal
        booking={booking}
        onSuccess={() => { setShowDeposit(false); onDepositPaid?.(); }}
        onClose={() => setShowDeposit(false)}
      />
    )}

    {showExtend && (
      <ExtendSessionSheet
        booking={booking}
        onClose={() => setShowExtend(false)}
        onExtended={() => { onExtended?.(); }}
      />
    )}

    {showReschedule && (
      <RescheduleModal
        open={showReschedule}
        booking={booking}
        onClose={() => setShowReschedule(false)}
        onRescheduled={() => { setShowReschedule(false); onRescheduled?.(); }}
      />
    )}

    <BookingReceiptModal
      open={showReceipt}
      booking={booking}
      onClose={() => setShowReceipt(false)}
    />

    <ReviewModal
      open={showReview}
      booking={booking}
      onClose={() => setShowReview(false)}
      onReviewed={() => { setShowReview(false); onRescheduled?.(); }}
    />
  </>
  );
}

export default BookingCard;