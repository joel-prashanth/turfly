import Card from "../ui/Card";

function BookingActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="animate-pulse p-5">
          <div className="h-5 w-40 rounded bg-slate-200" />

          <div className="mt-3 h-4 w-56 rounded bg-slate-200" />

          <div className="mt-2 h-4 w-28 rounded bg-slate-200" />

          <div className="mt-4 h-4 w-44 rounded bg-slate-200" />
        </Card>
      ))}
    </div>
  );
}

export default BookingActivitySkeleton;
