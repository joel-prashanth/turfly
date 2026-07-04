import { useState } from "react";
import {
  BellOff,
  BellRing,
  CheckCircle2,
  Clock,
  IndianRupee,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import Card from "../ui/Card";
import { joinWaitlist, leaveWaitlist } from "../../api/waitlistApi";

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

const formatDuration = (start, end) => {
  const diffInMinutes =
    (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60;

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours && minutes) return `${hours} hr ${minutes} min`;
  if (hours) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${minutes} min`;
};

const getSlotMeta = (slot, isInProgress, hasEnded) => {
  if (slot.status === "BOOKED") {
    return {
      label: "Booked",
      helper: "This slot is already booked",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      rail: "bg-blue-500",
    };
  }

  if (slot.status === "RESERVED") {
    return {
      label: "Reserved",
      helper: "Payment is in progress",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      rail: "bg-amber-500",
    };
  }

  if (slot.status === "BLOCKED") {
    return {
      label: "Blocked",
      helper: "Owner has blocked this slot",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      rail: "bg-slate-500",
    };
  }

  if (hasEnded || slot.status === "EXPIRED") {
    return {
      label: "Unavailable",
      helper: "This slot has already ended",
      badge: "bg-slate-100 text-slate-600 border-slate-200",
      rail: "bg-slate-400",
    };
  }

  if (isInProgress || slot.status === "LIVE") {
    return {
      label: "In Progress",
      helper: "This slot is currently live",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      rail: "bg-amber-500",
    };
  }

  return {
    label: "Available",
    helper: "Ready to book",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rail: "bg-emerald-500",
  };
};

const calculateAmount = (slot, pricePerHour) => {
  if (!pricePerHour) return null;
  const durationHours =
    (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) /
    1000 /
    60 /
    60;
  return Math.round(durationHours * Number(pricePerHour));
};

function SlotCard({ slot, canBook, onBook, pricePerHour, isBookedByMe, isSelected = false, isOnWaitlist: initialOnWaitlist = false }) {
  const now = new Date();
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  const isInProgress = now >= start && now < end;
  const hasEnded = now >= end;
  const [onWaitlist, setOnWaitlist] = useState(initialOnWaitlist);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const slotMeta = getSlotMeta(slot, isInProgress, hasEnded);
  const amount = calculateAmount(slot, pricePerHour);
  const isBookable =
    slot.status === "AVAILABLE" && !hasEnded && !isInProgress && canBook;

  const canWaitlist =
    canBook &&
    !hasEnded &&
    !isInProgress &&
    (slot.status === "BOOKED" || slot.status === "RESERVED");

  const handleWaitlistToggle = async () => {
    setWaitlistLoading(true);
    try {
      if (onWaitlist) {
        await leaveWaitlist(slot.id);
        setOnWaitlist(false);
        toast("Removed from waitlist.");
      } else {
        await joinWaitlist(slot.id);
        setOnWaitlist(true);
        toast.success("Added to waitlist! We'll notify you if this slot opens up.");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update waitlist.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  const renderAction = () => {
    if (isBookable) {
      return (
        <Button
          onClick={() => onBook(slot)}
          className="w-full"
          variant={isSelected ? "secondary" : "primary"}
        >
          {isSelected ? "✓ Selected" : "Select"}
        </Button>
      );
    }

    if (slot.status === "AVAILABLE" && !hasEnded && !isInProgress && !canBook) {
      return (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600">
          <Lock className="h-4 w-4" />
          Players Only
        </div>
      );
    }

    if (canWaitlist) {
      return (
        <button
          onClick={handleWaitlistToggle}
          disabled={waitlistLoading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
            onWaitlist
              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700"
          }`}
        >
          {onWaitlist ? <BellOff className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
          {waitlistLoading ? "…" : onWaitlist ? "Leave Waitlist" : "Join Waitlist"}
        </button>
      );
    }

    return (
      <div
        className={`flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-bold ${slotMeta.badge}`}
      >
        {slotMeta.label}
      </div>
    );
  };

  return (
    <Card
      className={[
        "group overflow-hidden border bg-white transition-all duration-300 hover:shadow-lg",
        isSelected
          ? "border-emerald-400 ring-2 ring-emerald-200 hover:border-emerald-400"
          : "border-slate-200 hover:border-emerald-200",
      ].join(" ")}
    >
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${slotMeta.rail}`} />

        <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${slotMeta.badge}`}
              >
                {slot.status === "AVAILABLE" && !hasEnded && !isInProgress && (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {slotMeta.label}
              </span>

              {isBookedByMe && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Your Booking
                </span>
              )}
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <Clock className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDuration(slot.startTime, slot.endTime)} ·{" "}
                  {slotMeta.helper}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            {amount !== null && (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left sm:text-right">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:justify-end">
                  <IndianRupee className="h-3.5 w-3.5" />
                  Total
                </div>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  ₹{amount.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            <div className="w-full sm:w-32 lg:w-full">{renderAction()}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default SlotCard;
