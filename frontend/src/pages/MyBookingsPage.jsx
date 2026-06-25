import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  History,
  XCircle,
} from "lucide-react";

import { getMyBookings, cancelBooking } from "../api/bookingApi";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

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
      setBookings(data.bookings || []);
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

  const {
    upcomingBookings,
    completedBookings,
    cancelledBookings,
    totalBookings,
  } = useMemo(() => {
    const upcoming = bookings.filter(
      (booking) => booking.status === "CONFIRMED",
    );

    const completed = bookings.filter(
      (booking) => booking.status === "COMPLETED",
    );

    const cancelled = bookings.filter(
      (booking) => booking.status === "CANCELLED",
    );

    upcoming.sort(
      (a, b) => new Date(a.slot.startTime) - new Date(b.slot.startTime),
    );

    completed.sort(
      (a, b) => new Date(b.slot.startTime) - new Date(a.slot.startTime),
    );

    cancelled.sort(
      (a, b) => new Date(b.slot.startTime) - new Date(a.slot.startTime),
    );

    return {
      upcomingBookings: upcoming,
      completedBookings: completed,
      cancelledBookings: cancelled,
      totalBookings: bookings.length,
    };
  }, [bookings]);

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
        onDepositPaid={fetchBookings}
        onExtended={fetchBookings}
      />
    ));

  const renderSection = ({ title, subtitle, icon: Icon, items, emptyText }) => (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        <span className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
          {items.length} booking{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="space-y-5">{renderBookings(items)}</div>
      ) : (
        <Card className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-500">{emptyText}</p>
        </Card>
      )}
    </section>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Container className="py-10">
          <PageHeader
            title="My Bookings"
            subtitle="Manage your upcoming and past games."
          />

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="h-28 animate-pulse bg-white p-5">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-8 w-12 rounded bg-slate-200" />
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <BookingCardSkeleton key={index} />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Container className="py-10">
          <PageHeader
            title="My Bookings"
            subtitle="Track all your upcoming and past games."
          />

          <EmptyState
            title="No bookings yet"
            description="Book your first turf and it will appear here."
            actionText="Browse Turfs"
            onAction={() => {
              window.location.href = "/turfs";
            }}
          />
        </Container>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <Container className="py-10">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <PageHeader
              title="My Bookings"
              subtitle="Manage upcoming games, review completed bookings, and track cancellations."
            />

            <Link to="/turfs">
              <Button>Book Another Turf</Button>
            </Link>
          </div>

          <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Total Bookings
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {totalBookings}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <CalendarCheck2 className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border-emerald-100 bg-emerald-50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Upcoming
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-800">
                    {upcomingBookings.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <CalendarClock className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border-blue-100 bg-blue-50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    Completed
                  </p>
                  <p className="mt-2 text-3xl font-black text-blue-800">
                    {completedBookings.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border-red-100 bg-red-50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Cancelled
                  </p>
                  <p className="mt-2 text-3xl font-black text-red-800">
                    {cancelledBookings.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-red-100 p-3 text-red-700">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-12">
            {renderSection({
              title: "Upcoming Bookings",
              subtitle: "Confirmed games that are still scheduled.",
              icon: CalendarClock,
              items: upcomingBookings,
              emptyText: "You do not have any upcoming bookings.",
            })}

            {renderSection({
              title: "Completed Bookings",
              subtitle: "Games you have already played.",
              icon: History,
              items: completedBookings,
              emptyText: "Completed bookings will appear here.",
            })}

            {renderSection({
              title: "Cancelled Bookings",
              subtitle: "Bookings cancelled by you.",
              icon: XCircle,
              items: cancelledBookings,
              emptyText: "Cancelled bookings will appear here.",
            })}
          </div>
        </Container>
      </div>

      <ConfirmDialog
        open={cancelDialog.open}
        title="Cancel Booking"
        description={(() => {
          const w = cancelDialog.booking?.slot?.turf?.cancellationWindowHours;
          const policy =
            w === 0
              ? "This venue does not allow cancellations."
              : w != null
                ? `This venue requires cancellations at least ${w} hour${w === 1 ? "" : "s"} before the slot starts.`
                : "";
          return `Are you sure you want to cancel this booking? This slot will become available for other players again.${policy ? " " + policy : ""}`;
        })()}
        confirmText="Cancel Booking"
        danger
        loading={cancelLoading}
        onClose={() => {
          if (!cancelLoading) {
            setCancelDialog({
              open: false,
              booking: null,
            });
          }
        }}
        onConfirm={confirmCancelBooking}
      />
    </>
  );
}
