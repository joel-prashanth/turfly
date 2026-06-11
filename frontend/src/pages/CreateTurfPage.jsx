import { useState } from "react";
import { createTurf } from "../api/turfApi";

function CreateTurfPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    pricePerHour: "",
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
      await createTurf({
        ...formData,
        pricePerHour: Number(formData.pricePerHour),
      });

      alert("Turf created successfully!");

      setFormData({
        name: "",
        description: "",
        location: "",
        pricePerHour: "",
      });
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to create turf");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Turf</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
        <input
          name="name"
          placeholder="Turf Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="pricePerHour"
          placeholder="Price Per Hour"
          value={formData.pricePerHour}
          onChange={handleChange}
          className="border p-2"
        />

        <button type="submit" className="border p-2">
          Create Turf
        </button>
      </form>
    </div>
  );
}

export default CreateTurfPage;
