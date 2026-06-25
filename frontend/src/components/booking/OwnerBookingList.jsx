import OwnerBookingCard from "./OwnerBookingCard";
import EmptyState from "../ui/EmptyState";

import { CalendarDays } from "lucide-react";

function OwnerBookingList({
  bookings,
  onViewDetails,
  onAttendanceMarked,
}) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No bookings found"
        description="Bookings will appear here once players start reserving your turfs."
      />
    );
  }

  return (
    <div className="space-y-5">
      {bookings.map((booking) => (
        <OwnerBookingCard
          key={booking.id}
          booking={booking}
          onViewDetails={onViewDetails}
          onAttendanceMarked={onAttendanceMarked}
        />
      ))}
    </div>
  );
}

export default OwnerBookingList;