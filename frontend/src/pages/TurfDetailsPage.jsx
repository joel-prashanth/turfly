import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReportTurfModal from "../components/turf/ReportTurfModal";
import toast from "react-hot-toast";
import {
  AlertCircle,
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
import { getMyWaitlist } from "../api/waitlistApi";
import TurfReviews from "../components/turf/TurfReviews";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import TurfDetailsSkeleton from "../components/skeletons/TurfDetailsSkeleton";
import TurfInfo from "../components/turf/TurfInfo";
import SlotCard from "../components/turf/SlotCard";
import BookingConfirmationModal from "../components/booking/BookingConfirmationModal";
import BookingSuccessModal from "../components/booking/BookingSuccessModal";

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

  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [waitlistedSlotIds, setWaitlistedSlotIds] = useState(new Set());

  const canBook = user?.role === "PLAYER";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const fetches = [getTurfById(id), getSlotsByTurfId(id)];
        if (user?.role === "PLAYER") fetches.push(getMyWaitlist());
        const [turfData, slotData, waitlistData] = await Promise.all(fetches);

        setTurf(turfData.turf);
        setSlots(slotData.slots || []);
        if (waitlistData) {
          const ids = new Set((waitlistData.data?.waitlist || []).map((w) => w.slotId));
          setWaitlistedSlotIds(ids);
        }
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

  // Toggle a slot in/out of the selection. Rules:
  // - Only AVAILABLE future slots can be selected
  // - All selected slots must be consecutive (no gaps)
  // - Max 3 slots
  const handleSlotToggle = (slot) => {
    const prev = selectedSlots;
    const isSelected = prev.some((s) => s.id === slot.id);

    if (isSelected) {
      const idx = prev.findIndex((s) => s.id === slot.id);
      if (idx === 0 || idx === prev.length - 1) {
        setSelectedSlots(prev.filter((s) => s.id !== slot.id));
      } else {
        setSelectedSlots([slot]);
      }
      return;
    }

    if (prev.length === 0) { setSelectedSlots([slot]); return; }

    if (prev.length >= 3) {
      toast("Maximum 3 slots at a time.", { icon: "⚠️" });
      return;
    }

    const sorted = [...prev].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const appendsAfter = new Date(last.endTime).getTime() === new Date(slot.startTime).getTime();
    const prependsBefore = new Date(slot.endTime).getTime() === new Date(first.startTime).getTime();

    if (!appendsAfter && !prependsBefore) {
      toast("Pick consecutive slots only.", { icon: "⚠️" });
      return;
    }

    setSelectedSlots([...prev, slot].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
  };

  const confirmBooking = async () => {
    if (selectedSlots.length === 0) return;

    try {
      setBookingLoading(true);
      const ids = selectedSlots.map((s) => s.id);
      const result = await createBooking(ids);
      const bookedSlots = [...selectedSlots];
      setSelectedSlots([]);
      setShowConfirm(false);
      setSuccessData({ booking: result?.booking || result, slots: bookedSlots });
      await refreshSlots();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  const sortedSlots = useMemo(() => {
    const now = new Date();
    return [...slots]
      .filter((s) => new Date(s.endTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [slots]);

  const groupedSlots = useMemo(() => {
    return sortedSlots.reduce((groups, slot) => {
      const key = new Date(slot.startTime).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(slot);
      return groups;
    }, {});
  }, [sortedSlots]);

  const availableDates = useMemo(() => Object.keys(groupedSlots), [groupedSlots]);

  const visibleGroups = useMemo(() => {
    if (!selectedDate) return groupedSlots;
    return selectedDate in groupedSlots
      ? { [selectedDate]: groupedSlots[selectedDate] }
      : {};
  }, [groupedSlots, selectedDate]);

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
      <div className="min-h-screen bg-slate-50">
        <Container className="py-20">
          <TurfDetailsSkeleton />
        </Container>
      </div>
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
            <div className="min-w-0">
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

              {availableDates.length > 1 && (
                <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      !selectedDate
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    All dates
                  </button>
                  {availableDates.map((dateKey) => {
                    const d = new Date(dateKey);
                    const isActive = selectedDate === dateKey;
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => setSelectedDate(dateKey)}
                        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                        }`}
                      >
                        {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      </button>
                    );
                  })}
                </div>
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
                  {Object.entries(visibleGroups).map(([date, daySlots]) => (
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
                            onBook={handleSlotToggle}
                            pricePerHour={turf.pricePerHour}
                            isBookedByMe={slot.isBookedByMe}
                            isSelected={selectedSlots.some((s) => s.id === slot.id)}
                            isOnWaitlist={waitlistedSlotIds.has(slot.id)}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
              <TurfReviews turfId={turf?.id} />
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
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

                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                    <span className="text-slate-500">
                      {turf?.cancellationWindowHours === 0
                        ? "No cancellations allowed by this venue."
                        : `Cancel up to ${turf?.cancellationWindowHours}h before slot starts.`}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Pay at the venue on game day. Bookings are confirmed instantly.
                </p>
              </Card>

              {turf.owner && (
                <Card className="mt-4 rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                    Hosted by
                  </h3>
                  <div className="mt-4 flex items-center gap-3">
                    {turf.owner.avatarUrl ? (
                      <img
                        src={turf.owner.avatarUrl}
                        alt={turf.owner.name}
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-600">
                        {turf.owner.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {turf.owner.businessName || turf.owner.name}
                      </p>
                      {turf.owner.businessName && (
                        <p className="text-sm text-slate-500 truncate">
                          {turf.owner.name}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {canBook && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setShowReport(true)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Report this listing
                  </button>
                </div>
              )}
            </aside>
          </div>
        </Container>
      </div>

      {showReport && turf && (
        <ReportTurfModal turf={turf} onClose={() => setShowReport(false)} />
      )}

      {/* Floating selection bar */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-white px-5 py-3.5 shadow-2xl">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-slate-500">
                ₹{selectedSlots.reduce((sum, s) => {
                  const hrs = (new Date(s.endTime) - new Date(s.startTime)) / 3600000;
                  return sum + Math.round(hrs * turf.pricePerHour);
                }, 0).toLocaleString("en-IN")} total
              </p>
            </div>
            <button
              onClick={() => setSelectedSlots([])}
              className="text-xs font-medium text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      <BookingConfirmationModal
        open={showConfirm}
        turf={turf}
        slots={selectedSlots}
        loading={bookingLoading}
        onClose={() => { if (!bookingLoading) { setShowConfirm(false); } }}
        onConfirm={confirmBooking}
      />

      <BookingSuccessModal
        open={Boolean(successData)}
        booking={successData?.booking}
        turf={turf}
        slots={successData?.slots}
        onClose={() => setSuccessData(null)}
      />
    </>
  );
}
