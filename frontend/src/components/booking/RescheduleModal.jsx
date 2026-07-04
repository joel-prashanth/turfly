import { useEffect, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import toast from "react-hot-toast";

import { getSlotsByTurfId } from "../../api/slotApi";
import { rescheduleBooking } from "../../api/bookingApi";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const fmtPrice = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const slotAmount = (slot, pricePerHour) => {
  const hrs = (new Date(slot.endTime) - new Date(slot.startTime)) / 3600000;
  return Math.round(hrs * Number(pricePerHour || 0));
};

function groupByDate(slots) {
  const map = {};
  for (const slot of slots) {
    const key = new Date(slot.startTime).toDateString();
    if (!map[key]) map[key] = [];
    map[key].push(slot);
  }
  return Object.entries(map).map(([dateStr, slots]) => ({ dateStr, slots }));
}

function RescheduleModal({ open, booking, onClose, onRescheduled }) {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const turf = booking?.slot?.turf;

  useEffect(() => {
    if (!open || !turf?.id) return;
    setLoadingSlots(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    getSlotsByTurfId(turf.id)
      .then((data) => {
        const available = (data.slots || []).filter(
          (s) => s.status === "AVAILABLE" && new Date(s.startTime) > new Date(),
        );
        setSlots(available);
        const groups = groupByDate(available);
        if (groups.length) setSelectedDate(groups[0].dateStr);
      })
      .catch(() => toast.error("Failed to load slots"))
      .finally(() => setLoadingSlots(false));
  }, [open, turf?.id]);

  const groups = groupByDate(slots);
  const slotsForDate = groups.find((g) => g.dateStr === selectedDate)?.slots ?? [];

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      await rescheduleBooking(booking.id, selectedSlot.id);
      toast.success("Booking rescheduled!");
      onRescheduled?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reschedule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title="Reschedule Booking"
      size="md"
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedSlot} loading={submitting}>
            Confirm Reschedule
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Current slot summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current slot</p>
          <p className="mt-1 font-semibold text-slate-700">
            {fmt(booking?.slot?.startTime)} · {fmtTime(booking?.slot?.startTime)}–{fmtTime(booking?.slot?.endTime)}
          </p>
        </div>

        {loadingSlots ? (
          <div className="space-y-3 animate-pulse">
            <div className="flex gap-2">
              {[1,2,3].map(i => <div key={i} className="h-9 w-24 rounded-xl bg-slate-100" />)}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100" />)}
            </div>
          </div>
        ) : slots.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No available slots at {turf?.name} right now.
          </p>
        ) : (
          <>
            {/* Date tabs */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <CalendarDays size={13} /> Pick a date
              </p>
              <div className="flex flex-wrap gap-2">
                {groups.map(({ dateStr }) => (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      selectedDate === dateStr
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-green-300"
                    }`}
                  >
                    {fmt(new Date(dateStr))}
                  </button>
                ))}
              </div>
            </div>

            {/* Slot grid */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Clock size={13} /> Pick a slot
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slotsForDate.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const price = slotAmount(slot, turf?.pricePerHour);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "border-green-600 bg-green-50 ring-1 ring-green-500"
                          : "border-slate-200 bg-white hover:border-green-300"
                      }`}
                    >
                      <p className={`text-xs font-bold ${isSelected ? "text-green-700" : "text-slate-800"}`}>
                        {fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}
                      </p>
                      <p className={`mt-0.5 text-xs ${isSelected ? "text-green-600" : "text-slate-400"}`}>
                        ₹{fmtPrice(price)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default RescheduleModal;
