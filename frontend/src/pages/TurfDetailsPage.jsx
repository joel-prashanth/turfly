import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";

import { getTurfById } from "../api/turfApi";
import { getSlotsByTurfId } from "../api/slotApi";
import { createBooking } from "../api/bookingApi";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";

import TurfInfo from "../components/turf/TurfInfo";
import SlotCard from "../components/turf/SlotCard";

export default function TurfDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const turfData = await getTurfById(id);
        const slotData = await getSlotsByTurfId(id);

        setTurf(turfData.turf);
        setSlots(slotData.slots);
      } catch (error) {
        toast.error("Failed to load turf details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBooking = async (slotId) => {
    try {
      await createBooking(slotId);

      const slotData = await getSlotsByTurfId(id);
      setSlots(slotData.slots);

      toast.success("Booking Successful 🎉");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Booking failed");
    }
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      </Container>
    );
  }

  if (!turf) {
    return <Container className="py-20">Turf not found.</Container>;
  }

  return (
    <Container className="py-10">
      <TurfInfo turf={turf} />

      <PageHeader
        title="Available Slots"
        subtitle="Choose a convenient time for your game."
      />

      <div className="space-y-5">
        {slots.length === 0 ? (
          <p>No slots available.</p>
        ) : (
          slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              canBook={user?.role === "PLAYER"}
              onBook={handleBooking}
            />
          ))
        )}
      </div>
    </Container>
  );
}
