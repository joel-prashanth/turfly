import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

import { getOwnerRecentBookings } from "../../api/dashboard";

import PageHeader from "../ui/PageHeader";
import EmptyState from "../ui/EmptyState";

import BookingActivityCard from "./BookingActivityCard";
import BookingActivitySkeleton from "../skeletons/BookingActivitySkeleton";

function RecentBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const response = await getOwnerRecentBookings();

        setBookings(response.data.bookings);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message || "Failed to load recent bookings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBookings();
  }, []);

  return (
    <section className="mt-14">
      <PageHeader
        title="Recent Bookings"
        subtitle="Stay updated with the latest activity across your venues."
      />

      {loading ? (
        <BookingActivitySkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No bookings yet"
          description="Bookings made by your customers will appear here."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingActivityCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentBookings;
