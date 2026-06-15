import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getMyBookings, cancelBooking } from "../api/bookingApi";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";

import BookingCard from "../components/booking/BookingCard";
import BookingCardSkeleton from "../components/skeletons/BookingCardSkeleton";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    booking: null,
  });

  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data.bookings);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load bookings.");
    }
  };

  useEffect(() => {
    let intervalId;

    const loadBookings = async () => {
      await fetchBookings();
      setLoading(false);

      intervalId = setInterval(fetchBookings, 60000);
    };

    loadBookings();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const confirmCancelBooking = async () => {
    if (!cancelDialog.booking) {
      return;
    }

    try {
      setCancelLoading(true);

      await cancelBooking(cancelDialog.booking.id);

      toast.success("Booking cancelled successfully.");

      setCancelDialog({
        open: false,
        booking: null,
      });

      await fetchBookings();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to cancel booking.",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const upcoming = bookings.filter(
      (booking) => booking.status === "CONFIRMED",
    );

    const past = bookings.filter(
      (booking) =>
        booking.status === "COMPLETED" || booking.status === "CANCELLED",
    );

    upcoming.sort(
      (a, b) => new Date(a.slot.startTime) - new Date(b.slot.startTime),
    );

    past.sort(
      (a, b) => new Date(b.slot.startTime) - new Date(a.slot.startTime),
    );

    return {
      upcomingBookings: upcoming,
      pastBookings: past,
    };
  }, [bookings]);

  if (loading) {
    return (
      <Container className="py-10">
        <PageHeader
          title="My Bookings"
          subtitle="Manage your upcoming and past games."
        />

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <BookingCardSkeleton key={index} />
          ))}
        </div>
      </Container>
    );
  }

  if (bookings.length === 0) {
    return (
      <Container className="py-10">
        <PageHeader
          title="My Bookings"
          subtitle="Track all your upcoming and past games."
        />

        <EmptyState
          title="No Bookings Yet"
          description="Book your first turf and it will appear here."
        />
      </Container>
    );
  }

  const renderBookings = (items) =>
    items.map((booking) => (
      <BookingCard
        key={booking.id}
        booking={booking}
        onCancel={(booking) =>
          setCancelDialog({
            open: true,
            booking,
          })
        }
      />
    ));

  return (
    <>
      <Container className="py-10">
        <PageHeader
          title="My Bookings"
          subtitle="Manage your upcoming and past games."
        />

        <div className="space-y-12">
          {upcomingBookings.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                Upcoming Bookings
              </h2>

              <div className="space-y-6">
                {renderBookings(upcomingBookings)}
              </div>
            </section>
          )}

          {pastBookings.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                Past Bookings
              </h2>

              <div className="space-y-6">{renderBookings(pastBookings)}</div>
            </section>
          )}
        </div>
      </Container>

      <ConfirmDialog
        open={cancelDialog.open}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking?"
        confirmText="Cancel Booking"
        danger
        loading={cancelLoading}
        onClose={() =>
          setCancelDialog({
            open: false,
            booking: null,
          })
        }
        onConfirm={confirmCancelBooking}
      />
    </>
  );
}
