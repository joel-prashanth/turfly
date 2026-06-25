import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";

import OwnerBookingFilters from "../components/booking/OwnerBookingFilters";
import OwnerBookingList from "../components/booking/OwnerBookingList";

import { getOwnerBookings } from "../api/bookingApi";

import useDebounce from "../hooks/useDebounce";
import OwnerBookingListSkeleton from "../components/skeletons/OwnerBookingListSkeleton";
import BookingDetailsModal from "../components/booking/BookingDetailsModal";

function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const [status, setStatus] = useState("ALL");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getOwnerBookings({
        search: debouncedSearch,
        status,
      });

      setBookings(response.data.bookings);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <Container className="py-8">

      <OwnerBookingFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {loading ? (
        <OwnerBookingListSkeleton />
      ) : (
        <OwnerBookingList
          bookings={bookings}
          onViewDetails={(booking) => {
            setSelectedBooking(booking);
            setIsDetailsOpen(true);
          }}
          onAttendanceMarked={fetchBookings}
        />
      )}
      <BookingDetailsModal
        open={isDetailsOpen}
        booking={selectedBooking}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedBooking(null);
        }}
        onCancelled={() => {
          setIsDetailsOpen(false);
          setSelectedBooking(null);
          fetchBookings();
        }}
      />
    </Container>
  );
}

export default OwnerBookingsPage;
