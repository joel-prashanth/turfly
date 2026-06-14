import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";

import { getTurfById } from "../api/turfApi";
import { getSlotsByTurfId } from "../api/slotApi";
import { createBooking } from "../api/bookingApi";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import Card from "../components/ui/Card";

import TurfInfo from "../components/turf/TurfInfo";
import SlotCard from "../components/turf/SlotCard";

const formatGroupDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

  const groupedSlots = useMemo(() => {
    return slots.reduce((groups, slot) => {
      const dateKey = new Date(slot.startTime).toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(slot);

      return groups;
    }, {});
  }, [slots]);

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

      {slots.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <h3 className="text-xl font-semibold text-slate-900">
            No Slots Available
          </h3>

          <p className="mt-2 text-slate-500">
            This turf doesn't have any available slots yet. Please check back
            later.
          </p>
        </Card>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedSlots).map(([date, daySlots]) => (
            <section key={date}>
              <div className="mb-5 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <h2 className="whitespace-nowrap text-lg font-semibold text-slate-800">
                  {formatGroupDate(daySlots[0].startTime)}
                </h2>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-4">
                {daySlots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    canBook={user?.role === "PLAYER"}
                    onBook={handleBooking}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Container>
  );
}
