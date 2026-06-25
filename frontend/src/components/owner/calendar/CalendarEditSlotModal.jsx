import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Clock, MapPinned } from "lucide-react";

import Modal from "../../ui/Modal";
import Button from "../../ui/Button";

import { editSlot } from "../../../api/slotApi";

const formatDateInput = (dateValue) => {
  const date = new Date(dateValue);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTimeInput = (dateValue) => {
  const date = new Date(dateValue);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const combineDateAndTime = (date, time) => {
  return new Date(`${date}T${time}:00`);
};

function CalendarEditSlotModal({ open, slot, onClose, onSuccess }) {
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (!open || !slot) return;

    setFormData({
      date: formatDateInput(slot.startTime),
      startTime: formatTimeInput(slot.startTime),
      endTime: formatTimeInput(slot.endTime),
    });
  }, [open, slot]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    if (updating) return;

    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!slot) return;

    if (!formData.date || !formData.startTime || !formData.endTime) {
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
      setUpdating(true);

      await editSlot(slot.id, {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      toast.success("Slot updated successfully.");

      onClose?.();
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update slot.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Slot"
      onClose={handleClose}
      closeOnBackdrop={!updating}
      closeOnEscape={!updating}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={updating}>
            Cancel
          </Button>

          <Button
            type="submit"
            form="calendar-edit-slot-form"
            loading={updating}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form id="calendar-edit-slot-form" onSubmit={handleSubmit}>
        <p className="mb-6 text-sm leading-6 text-slate-500">
          Update this slot timing. Booked slots cannot be edited.
        </p>

        {slot?.turfName && (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPinned className="h-4 w-4 text-slate-400" />
              {slot.turfName}
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
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
                disabled={updating}
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
                  disabled={updating}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                End
              </label>

              <div className="relative">
                <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  disabled={updating}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CalendarEditSlotModal;
