import {
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  ReceiptText,
  XCircle,
} from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";

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

function BookingCard({ booking, onCancel }) {
  const turf = booking.slot.turf;
  const status = statusConfig[booking.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  const canCancel = booking.status === "CONFIRMED";
  const amount =
    booking.amount || calculateAmount(booking.slot, turf.pricePerHour);

  const paymentStatus = booking.payment?.status || "PAYMENT_SOON";

  return (
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

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <CalendarDays className="h-4 w-4" />
                      Date
                    </div>

                    <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
                      {formatDate(booking.slot.startTime)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>

                    <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
                      {formatTime(booking.slot.startTime)} –{" "}
                      {formatTime(booking.slot.endTime)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Clock className="h-4 w-4" />
                      Duration
                    </div>

                    <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
                      {formatDuration(
                        booking.slot.startTime,
                        booking.slot.endTime
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                    <IndianRupee className="h-4 w-4 text-emerald-600" />
                    ₹{formatPrice(amount)} total
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                    <ReceiptText className="h-4 w-4 text-slate-500" />
                    {paymentStatus === "PAYMENT_SOON"
                      ? "Payment soon"
                      : paymentStatus}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 xl:items-end">
                <span
                  className={`
                    inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold
                    ${status.badge}
                  `}
                >
                  <StatusIcon className="h-4 w-4" />
                  {status.label}
                </span>

                {canCancel && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onCancel(booking)}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default BookingCard;