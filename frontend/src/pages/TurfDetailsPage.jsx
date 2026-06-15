import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";

import { getTurfById } from "../api/turfApi";
import { getSlotsByTurfId } from "../api/slotApi";
import { createBooking } from "../api/bookingApi";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import TurfDetailsSkeleton from "../components/skeletons/TurfDetailsSkeleton";
import TurfInfo from "../components/turf/TurfInfo";
import SlotCard from "../components/turf/SlotCard";
import BookingConfirmationModal from "../components/booking/BookingConfirmationModal";

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

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [turfData, slotData] = await Promise.all([
          getTurfById(id),
          getSlotsByTurfId(id),
        ]);

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

  const refreshSlots = async () => {
    try {
      const slotData = await getSlotsByTurfId(id);
      setSlots(slotData.slots);
    } catch {
      toast.error("Failed to refresh slots.");
    }
  };

 const confirmBooking = async () => {
  if (!selectedSlot) return;

  try {
    setBookingLoading(true);

    await createBooking(selectedSlot.id);

    toast.success("Booking successful 🎉");
  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Booking failed."
    );
  } finally {
    // Always close the modal.
    setSelectedSlot(null);

    // Always refresh slots.
    await refreshSlots();

    setBookingLoading(false);
  }
};

  const groupedSlots = useMemo(() => {
    return slots.reduce((groups, slot) => {
      const key = new Date(slot.startTime).toDateString();

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(slot);

      return groups;
    }, {});
  }, [slots]);

  if (loading) {
    return (
      <Container className="py-20">
        <TurfDetailsSkeleton />
      </Container>
    );
  }

  if (!turf) {
    return (
      <Container className="py-20">
        <Card className="p-10 text-center">
          <h2 className="text-2xl font-bold">Turf Not Found</h2>

          <p className="mt-3 text-slate-500">
            The turf you're looking for doesn't exist or has been removed.
          </p>
        </Card>
      </Container>
    );
  }

  return (
    <>
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
                      onBook={setSelectedSlot}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>

      <BookingConfirmationModal
        open={Boolean(selectedSlot)}
        turf={turf}
        slot={selectedSlot}
        loading={bookingLoading}
        onClose={() => setSelectedSlot(null)}
        onConfirm={confirmBooking}
      />
    </>
  );
}