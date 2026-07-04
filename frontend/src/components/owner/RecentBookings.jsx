import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

import { getOwnerRecentBookings } from "../../api/dashboard";
import EmptyState from "../ui/EmptyState";
import BookingActivitySkeleton from "../skeletons/BookingActivitySkeleton";

const STATUS = {
  CONFIRMED: { label: "Confirmed", bar: "bg-green-500",  dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
  PENDING:   { label: "Pending",   bar: "bg-amber-400",  dot: "bg-amber-400",  text: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
  CANCELLED: { label: "Cancelled", bar: "bg-red-400",    dot: "bg-red-400",    text: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"   },
  COMPLETED: { label: "Completed", bar: "bg-slate-300",  dot: "bg-slate-400",  text: "text-slate-500",  bg: "bg-slate-50",  border: "border-slate-200" },
};

const SPORT_EMOJI = {
  FOOTBALL: "⚽", CRICKET: "🏏", BADMINTON: "🏸",
  TENNIS: "🎾", BASKETBALL: "🏀", VOLLEYBALL: "🏐",
};

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function BookingRow({ booking }) {
  const { player, slot, status, amount, walkInName } = booking;
  const cfg = STATUS[status] || STATUS.PENDING;
  const name = player?.name || walkInName || "Walk-in";
  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  const sport = slot?.turf?.sport;

  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/70">
      {/* Status bar */}
      <div className={`h-8 w-1 shrink-0 rounded-full ${cfg.bar}`} />

      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
        {initials}
      </div>

      {/* Name + turf */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-400">
          {sport && <span className="mr-1">{SPORT_EMOJI[sport]}</span>}
          {slot.turf.name}
        </p>
      </div>

      {/* Date + time — hidden on xs */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs font-semibold text-slate-700">{fmtDate(slot.startTime)}</p>
        <p className="text-xs text-slate-400">{fmtTime(slot.startTime)}–{fmtTime(slot.endTime)}</p>
      </div>

      {/* Status badge */}
      <span className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold md:inline-flex ${cfg.bg} ${cfg.border} ${cfg.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>

      {/* Amount */}
      {amount ? (
        <span className="hidden shrink-0 text-sm font-bold text-slate-800 sm:block">
          ₹{Number(amount).toLocaleString("en-IN")}
        </span>
      ) : null}

      {/* Arrow — appears on hover */}
      <Link
        to="/owner/bookings"
        className="shrink-0 text-slate-300 transition-colors hover:text-green-600 opacity-0 group-hover:opacity-100"
        title="View bookings"
      >
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function RecentBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerRecentBookings()
      .then(r => setBookings(r.data.bookings))
      .catch(() => toast.error("Failed to load recent bookings"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mt-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Bookings</h2>
            {!loading && bookings.length > 0 && (
              <p className="mt-0.5 text-xs text-slate-400">{bookings.length} latest</p>
            )}
          </div>
          <Link
            to="/owner/bookings"
            className="flex items-center gap-1 text-xs font-semibold text-green-600 transition hover:text-green-500"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {/* Body */}
        {loading ? (
          <div className="p-5"><BookingActivitySkeleton /></div>
        ) : bookings.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={ClipboardList}
              title="No bookings yet"
              description="Customer bookings will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}

      </div>
    </section>
  );
}

export default RecentBookings;
