import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createBooking } from "../api/bookingApi";
import { getTurfById } from "../api/turfApi";
import { getSlotsByTurfId } from "../api/slotApi";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

export default function TurfDetailsPage() {
  const { id } = useParams();

  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const turfData = await getTurfById(id);
        const slotData = await getSlotsByTurfId(id);

        setTurf(turfData.turf);
        setSlots(slotData.slots);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBooking = async (slotId) => {
    try {
      await createBooking(slotId);

      alert("Booking created successfully!");

      const slotData = await getSlotsByTurfId(id);
      setSlots(slotData.slots);
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Booking failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!turf) {
    return <div className="p-6">Turf not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold">{turf.name}</h1>

      <p className="mt-2 text-gray-600">{turf.description}</p>

      <p className="mt-2">📍 {turf.location}</p>

      <p className="mt-2 font-semibold">₹{turf.pricePerHour}/hour</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Slots</h2>

      {slots.length === 0 ? (
        <p>No slots available.</p>
      ) : (
        slots.map((slot) => (
          <div key={slot.id} className="border rounded-lg p-4 mb-4 shadow-sm">
            <p>
              <strong>Date:</strong> {formatDate(slot.startTime)}
            </p>

            <p>
              <strong>Time:</strong> {formatTime(slot.startTime)} -{" "}
              {formatTime(slot.endTime)}
            </p>

            <p>
              <strong>Status:</strong> {slot.status}
            </p>

            {slot.status === "AVAILABLE" ? (
              user?.role === "PLAYER" ? (
                <button
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleBooking(slot.id)}
                >
                  Book Slot
                </button>
              ) : (
                <p className="mt-3 text-gray-500">
                  Only players can book slots
                </p>
              )
            ) : (
              <button
                disabled
                className="mt-3 px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
              >
                Booked
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
