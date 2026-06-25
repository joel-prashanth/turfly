import { useEffect, useState } from "react";
import { Clock, IndianRupee, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { createManualBooking } from "../../api/bookingApi";

const toLocalDateStr = (d) => {
  const dt = d ? new Date(d) : new Date();
  return dt.toISOString().slice(0, 10); // YYYY-MM-DD
};

const toLocalTimeStr = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toTimeString().slice(0, 5); // HH:MM
};

const buildISO = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
};

const calcAmount = (dateStr, startTime, endTime, pricePerHour) => {
  if (!dateStr || !startTime || !endTime || !pricePerHour) return null;
  const start = new Date(`${dateStr}T${startTime}:00`);
  const end = new Date(`${dateStr}T${endTime}:00`);
  if (end <= start) return null;
  const hours = (end - start) / 3600000;
  return Math.round(hours * Number(pricePerHour));
};

function WalkInModal({ open, onClose, onSuccess, turfId, pricePerHour, prefillSlot }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(toLocalDateStr());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill from a clicked slot
  useEffect(() => {
    if (prefillSlot) {
      setDate(toLocalDateStr(prefillSlot.startTime));
      setStartTime(toLocalTimeStr(prefillSlot.startTime));
      setEndTime(toLocalTimeStr(prefillSlot.endTime));
    }
  }, [prefillSlot]);

  const amount = calcAmount(date, startTime, endTime, pricePerHour);

  const handleClose = () => {
    if (loading) return;
    setName(""); setPhone("");
    setDate(toLocalDateStr()); setStartTime(""); setEndTime("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Player name is required"); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { toast.error("Enter a valid 10-digit phone number"); return; }
    if (!date || !startTime || !endTime) { toast.error("Date and time are required"); return; }

    const start = buildISO(date, startTime);
    const end = buildISO(date, endTime);
    if (!start || !end || new Date(end) <= new Date(start)) {
      toast.error("End time must be after start time"); return;
    }

    try {
      setLoading(true);
      await createManualBooking({ turfId, walkInName: name, walkInPhone: phone, startTime: start, endTime: end });
      toast.success("Walk-in booking added.");
      handleClose();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Walk-in Booking">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Amount preview */}
        {amount !== null && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
            <Clock size={14} className="text-emerald-600" />
            <span className="text-sm text-emerald-700">
              Duration:{" "}
              <span className="font-semibold">
                {(() => {
                  const mins = (new Date(`${date}T${endTime}`) - new Date(`${date}T${startTime}`)) / 60000;
                  const h = Math.floor(mins / 60), m = mins % 60;
                  return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
                })()}
              </span>
            </span>
            <span className="ml-auto flex items-center gap-0.5 font-bold text-emerald-700">
              <IndianRupee size={13} />
              {amount.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <Input
          label="Player Name"
          placeholder="e.g. Rahul Kumar"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Phone Number"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
        />

        <p className="text-xs text-slate-400">
          Overlapping slots will be automatically blocked. Cancelling this booking restores them.
        </p>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading}>
            Confirm Walk-in
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default WalkInModal;
