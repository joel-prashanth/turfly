import { useState } from "react";
import { useParams } from "react-router-dom";
import { createSlot } from "../api/slotApi";

function CreateSlotPage() {
  const { turfId } = useParams();

  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createSlot({
        turfId,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });

      alert("Slot created successfully!");

      setFormData({
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to create slot");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Create Slot</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="border p-2"
        />

        <button type="submit" className="border p-2 rounded">
          Create Slot
        </button>
      </form>
    </div>
  );
}

export default CreateSlotPage;
