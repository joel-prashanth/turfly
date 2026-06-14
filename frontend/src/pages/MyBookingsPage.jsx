import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, IndianRupee, MapPin } from "lucide-react";

import { getMyBookings } from "../api/bookingApi";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Card from "../components/ui/Card";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200";

const sportColors = {
  FOOTBALL: "bg-green-100 text-green-700",
  CRICKET: "bg-blue-100 text-blue-700",
  BADMINTON: "bg-yellow-100 text-yellow-700",
  TENNIS: "bg-purple-100 text-purple-700",
  BASKETBALL: "bg-orange-100 text-orange-700",
  VOLLEYBALL: "bg-pink-100 text-pink-700",
};

const statusColors = {
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  PENDING: "bg-yellow-100 text-yellow-700",
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data.bookings);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const now = new Date();

    const upcoming = [];
    const past = [];

    bookings.forEach((booking) => {
      const start = new Date(booking.slot.startTime);

      if (start >= now) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    });

    return {
      upcomingBookings: upcoming,
      pastBookings: past,
    };
  }, [bookings]);

  if (loading) {
    return (
      <Container className="py-20">
        <div className="flex justify-center">
          <Spinner size="lg" />
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
    items.map((booking) => {
      const turf = booking.slot.turf;

      return (
        <Card
          key={booking.id}
          className="overflow-hidden border border-slate-200 transition-all duration-300 hover:border-green-200 hover:shadow-xl"
        >
          <div className="grid lg:grid-cols-[280px_1fr]">
            <img
              src={turf.imageUrl || FALLBACK_IMAGE}
              alt={turf.name}
              className="h-60 w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            <div className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      sportColors[turf.sport]
                    }`}
                  >
                    {turf.sport}
                  </span>

                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    {turf.name}
                  </h2>

                  <div className="mt-5 space-y-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      {turf.location}
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays size={18} />
                      {formatDate(booking.slot.startTime)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      {formatTime(booking.slot.startTime)} –{" "}
                      {formatTime(booking.slot.endTime)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-5 lg:items-end">
                  <div className="flex items-center text-3xl font-bold text-green-700">
                    <IndianRupee size={26} />
                    {turf.pricePerHour}
                    <span className="ml-1 text-sm text-slate-500">/ hour</span>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      statusColors[booking.status]
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    });

  return (
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

            <div className="space-y-6">{renderBookings(upcomingBookings)}</div>
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
  );
}
