import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Clock, MapPinned } from "lucide-react";

import Modal from "../../ui/Modal";
import Button from "../../ui/Button";

import { getMyTurfs } from "../../../api/turfApi";
import { createSlot } from "../../../api/slotApi";

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const combineDateAndTime = (date, time) => {
  return new Date(`${date}T${time}:00`);
};

function CalendarCreateSlotModal({ open, selectedDate, onClose, onSuccess }) {
  const [turfs, setTurfs] = useState([]);
  const [loadingTurfs, setLoadingTurfs] = useState(false);
  const [creating, setCreating] = useState(false);

  const defaultDate = useMemo(() => {
    return formatDateInput(selectedDate || new Date());
  }, [selectedDate]);

  const [formData, setFormData] = useState({
    turfId: "",
    date: defaultDate,
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (!open) return;

    setFormData((prev) => ({
      ...prev,
      date: defaultDate,
    }));
  }, [open, defaultDate]);

  useEffect(() => {
    if (!open) return;

    const fetchTurfs = async () => {
      try {
        setLoadingTurfs(true);

        const response = await getMyTurfs();

        setTurfs(response.data?.turfs || response.turfs || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load turfs.");
      } finally {
        setLoadingTurfs(false);
      }
    };

    fetchTurfs();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      turfId: "",
      date: defaultDate,
      startTime: "",
      endTime: "",
    });
  };

  const handleClose = () => {
    if (creating) return;

    resetForm();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.turfId ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error("Please fill all slot details.");
      return;
    }

    const startDateTime = combineDateAndTime(formData.date, formData.startTime);
    const endDateTime = combineDateAndTime(formData.date, formData.endTime);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time.");
      return;
    }

    try {
      setCreating(true);

      await createSlot({
        turfId: formData.turfId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      toast.success("Slot created successfully.");

      await onSuccess?.();

      resetForm();
      onClose?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create slot.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Create Slot"
      onClose={handleClose}
      closeOnBackdrop={!creating}
      closeOnEscape={!creating}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={creating}>
            Cancel
          </Button>

          <Button
            type="submit"
            form="calendar-create-slot-form"
            loading={creating}
          >
            Create Slot
          </Button>
        </>
      }
    >
      <form id="calendar-create-slot-form" onSubmit={handleSubmit}>
        <p className="mb-6 text-sm leading-6 text-slate-500">
          Add a new slot for one of your turfs. Once created, it will appear in
          the calendar for the selected day.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Turf
            </label>

            <div className="relative">
              <MapPinned className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                name="turfId"
                value={formData.turfId}
                onChange={handleChange}
                disabled={loadingTurfs || creating}
                className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {loadingTurfs ? "Loading turfs..." : "Select turf"}
                </option>

                {turfs.map((turf) => (
                  <option key={turf.id} value={turf.id}>
                    {turf.name} — {turf.sport}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Date
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={creating}
                className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Start
              </label>

              <div className="relative">
                <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  disabled={creating}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                End
              </label>

              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                disabled={creating}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {turfs.length === 0 && !loadingTurfs && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            You need to create a turf before adding slots.
          </div>
        )}
      </form>
    </Modal>
  );
}

export default CalendarCreateSlotModal;
