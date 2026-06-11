import { useEffect, useState } from "react";
import { getMyBookings } from "../api/bookingApi";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getMyBookings();

        setBookings(data.bookings);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      {bookings.map((booking) => (
        <div key={booking.id} className="border p-4 rounded mb-4">
          <p>Booking ID: {booking.id}</p>

          <p>Status: {booking.status}</p>

          <p>Slot: {new Date(booking.slot.startTime).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
