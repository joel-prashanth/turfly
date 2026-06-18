import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

import { getTurfById } from "../api/turfApi";
import { getSlotsByTurfId } from "../api/slotApi";
import { createBooking } from "../api/bookingApi";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
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

const isFutureSlot = (slot) => new Date(slot.startTime).getTime() > Date.now();

export default function TurfDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const canBook = user?.role === "PLAYER";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [turfData, slotData] = await Promise.all([
          getTurfById(id),
          getSlotsByTurfId(id),
        ]);

        setTurf(turfData.turf);
        setSlots(slotData.slots || []);
      } catch (error) {
        console.error(error);
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
      setSlots(slotData.slots || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh slots.");
    }
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return;

    try {
      setBookingLoading(true);

      await createBooking(selectedSlot.id);

      toast.success("Booking successful 🎉");
      setSelectedSlot(null);

      await refreshSlots();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  const sortedSlots = useMemo(() => {
    return [...slots].sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime),
    );
  }, [slots]);

  const groupedSlots = useMemo(() => {
    return sortedSlots.reduce((groups, slot) => {
      const key = new Date(slot.startTime).toDateString();

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(slot);

      return groups;
    }, {});
  }, [sortedSlots]);

  const slotSummary = useMemo(() => {
    const upcomingAvailable = slots.filter(
      (slot) => slot.status === "AVAILABLE" && isFutureSlot(slot),
    ).length;

    const booked = slots.filter((slot) => slot.status === "BOOKED").length;
    const blocked = slots.filter((slot) => slot.status === "BLOCKED").length;

    return {
      total: slots.length,
      upcomingAvailable,
      booked,
      blocked,
    };
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
          <h2 className="text-2xl font-bold text-slate-900">Turf not found</h2>

          <p className="mt-3 text-slate-500">
            The turf you're looking for doesn't exist or has been removed.
          </p>

          <Link to="/turfs" className="mt-6 inline-block">
            <Button>Browse Turfs</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <Container className="py-10">
          <TurfInfo turf={turf} />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <PageHeader
                title="Choose Your Slot"
                subtitle="Pick a convenient time and confirm your booking in a few clicks."
              />

              {!user && (
                <Card className="mb-6 border-amber-200 bg-amber-50 p-5">
                  <div className="flex gap-4">
                    <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                      <Lock className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-amber-900">
                        Login required to book
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        You can browse slots now. Login as a player to confirm a
                        booking.
                      </p>

                      <Link to="/login" className="mt-3 inline-block">
                        <Button size="sm">Login to Book</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )}

              {user?.role === "OWNER" && (
                <Card className="mb-6 border-blue-200 bg-blue-50 p-5">
                  <div className="flex gap-4">
                    <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-blue-900">
                        Owner preview mode
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-blue-800">
                        Owners can view player-facing slots, but bookings are
                        allowed only for player accounts.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {slots.length === 0 ? (
                <Card className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <CalendarDays className="h-7 w-7 text-slate-500" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    No slots available
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-slate-500">
                    This turf doesn't have any listed slots yet. Please check
                    back later.
                  </p>
                </Card>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedSlots).map(([date, daySlots]) => (
                    <section key={date}>
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">
                            {formatGroupDate(daySlots[0].startTime)}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {daySlots.length} slot
                            {daySlots.length === 1 ? "" : "s"} listed for this
                            day
                          </p>
                        </div>

                        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                          {
                            daySlots.filter(
                              (slot) =>
                                slot.status === "AVAILABLE" &&
                                isFutureSlot(slot),
                            ).length
                          }{" "}
                          available
                        </div>
                      </div>

                      <div className="space-y-4">
                        {daySlots.map((slot) => (
                          <SlotCard
                            key={slot.id}
                            slot={slot}
                            canBook={canBook}
                            onBook={setSelectedSlot}
                            pricePerHour={turf.pricePerHour}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900">
                  Booking Summary
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Live slot availability for this turf.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Total
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {slotSummary.total}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Available
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                      {slotSummary.upcomingAvailable}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Booked
                    </p>
                    <p className="mt-1 text-2xl font-bold text-blue-700">
                      {slotSummary.booked}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Blocked
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {slotSummary.blocked}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Instant booking confirmation
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    Clear slot timing
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    Venue details available above
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Payments will be added soon. For now, bookings are confirmed
                  directly.
                </p>
              </Card>
            </aside>
          </div>
        </Container>
      </div>

      <BookingConfirmationModal
        open={Boolean(selectedSlot)}
        turf={turf}
        slot={selectedSlot}
        loading={bookingLoading}
        onClose={() => {
          if (!bookingLoading) {
            setSelectedSlot(null);
          }
        }}
        onConfirm={confirmBooking}
      />
    </>
  );
}
