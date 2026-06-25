import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { bulkGenerateSlots } from "../../api/slotApi";

const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dateInNDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function computePreview({ days, startDate, endDate, openTime, closeTime, durationMinutes }) {
  if (!days.length || !startDate || !endDate || !openTime || !closeTime || !durationMinutes)
    return null;

  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  if (closeMins <= openMins) return null;

  const slotsPerDay = Math.floor((closeMins - openMins) / durationMinutes);
  if (slotsPerDay <= 0) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < start) return null;

  let matchingDays = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (days.includes(cursor.getDay())) matchingDays++;
    cursor.setDate(cursor.getDate() + 1);
  }

  return { slots: matchingDays * slotsPerDay, days: matchingDays };
}

function BulkGenerateModal({ open, turfId, onClose, onSuccess }) {
  const [days, setDays] = useState([1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(dateInNDays(27));
  const [openTime, setOpenTime] = useState("06:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);

  const toggleDay = (val) =>
    setDays((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val],
    );

  const preview = useMemo(
    () =>
      computePreview({
        days,
        startDate,
        endDate,
        openTime,
        closeTime,
        durationMinutes: duration,
      }),
    [days, startDate, endDate, openTime, closeTime, duration],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!days.length) {
      toast.error("Select at least one day.");
      return;
    }
    setLoading(true);
    try {
      const res = await bulkGenerateSlots({
        turfId,
        days,
        startDate,
        endDate,
        openTime,
        closeTime,
        durationMinutes: duration,
      });
      const { created, skipped } = res.data;
      if (created === 0) {
        toast("No new slots created — all slots already exist.", { icon: "ℹ️" });
      } else {
        toast.success(
          `${created} slot${created !== 1 ? "s" : ""} created${skipped > 0 ? ` · ${skipped} skipped (overlap)` : ""}.`,
        );
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate slots.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} title="Generate Slots" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Days of week */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Days of week
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const active = days.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`rounded-xl px-3.5 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-green-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:text-green-700"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              From
            </label>
            <input
              type="date"
              value={startDate}
              min={todayStr()}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              To
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || todayStr()}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Operating hours */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Opens at
            </label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Closes at
            </label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Slot duration */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Slot duration
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDuration(d.value)}
                className={`rounded-xl px-3.5 py-1.5 text-sm font-semibold transition ${
                  duration === d.value
                    ? "bg-green-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:text-green-700"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div
          className={`rounded-2xl px-5 py-4 text-sm font-medium transition ${
            preview
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-slate-100 bg-slate-50 text-slate-400"
          }`}
        >
          {preview ? (
            <>
              <span className="font-bold">{preview.slots}</span> slot
              {preview.slots !== 1 ? "s" : ""} across{" "}
              <span className="font-bold">{preview.days}</span> day
              {preview.days !== 1 ? "s" : ""} — overlaps will be skipped
              automatically.
            </>
          ) : (
            "Fill in the form to see a preview."
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!preview || !days.length}>
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default BulkGenerateModal;
