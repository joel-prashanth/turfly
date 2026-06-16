import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Info } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

import { createSlot } from "../../../api/slotApi";

function SlotForm({ turfId, mode = "create", initialValues = {}, onSuccess }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
  });

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

      await createSlot({
        turfId,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });

      toast.success("Slot created successfully!");

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/owner/turfs");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Slot Details</h2>

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
              Players can only book available slots. Make sure your timings
              don't overlap with existing slots.
            </p>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Create Slot
        </Button>
      </form>
    </Card>
  );
}

export default SlotForm;
