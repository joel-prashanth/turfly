import BookingCardSkeleton from "./BookingCardSkeleton";

function OwnerBookingListSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <BookingCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default OwnerBookingListSkeleton;
