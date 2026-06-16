import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Info } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

import { createSlot, editSlot } from "../../../api/slotApi";

const formatDateTimeLocal = (date) => {
  if (!date) return "";

  const d = new Date(date);

  const offset = d.getTimezoneOffset();

  const local = new Date(d.getTime() - offset * 60000);

  return local.toISOString().slice(0, 16);
};

function SlotForm({
  turfId,
  mode = "create",
  initialValues = {},
  onSuccess,
  embedded = false,
}) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    startTime: formatDateTimeLocal(initialValues.startTime),
    endTime: formatDateTimeLocal(initialValues.endTime),
  });

  useEffect(() => {
    setFormData({
      startTime: formatDateTimeLocal(initialValues.startTime),
      endTime: formatDateTimeLocal(initialValues.endTime),
    });
  }, [initialValues?.id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.startTime || !formData.endTime) {
      toast.error("Please select both start and end time.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        await createSlot({
          turfId,
          startTime: formData.startTime,
          endTime: formData.endTime,
        });

        toast.success("Slot created successfully!");
      } else {
        await editSlot(initialValues.id, {
          startTime: formData.startTime,
          endTime: formData.endTime,
        });

        toast.success("Slot updated successfully!");
      }

      if (onSuccess) {
        await onSuccess();
      } else {
        navigate("/owner/turfs");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save slot.");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          {mode === "create" ? "Slot Details" : "Edit Slot"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose the start and end time for this booking slot.
        </p>
      </div>

      <Input
        label="Start Time"
        type="datetime-local"
        name="startTime"
        value={formData.startTime}
        onChange={handleChange}
        required
      />

      <Input
        label="End Time"
        type="datetime-local"
        name="endTime"
        value={formData.endTime}
        onChange={handleChange}
        required
      />

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 text-blue-600" />

        <div>
          <p className="font-medium text-blue-900">Scheduling Tip</p>

          <p className="mt-1 text-sm text-blue-700">
            Players can only book available slots. Make sure your timings don't
            overlap with existing slots.
          </p>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {mode === "create" ? "Create Slot" : "Save Changes"}
      </Button>
    </form>
  );

  if (embedded) {
    return formContent;
  }

  return <Card className="mx-auto max-w-2xl p-8">{formContent}</Card>;
}

export default SlotForm;
