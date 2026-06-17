import { CalendarX } from "lucide-react";

import CalendarSlotCard from "./CalendarSlotCard";

function CalendarDayBoard({
  schedule = [],
  onEditSlot,
  onBlockSlot,
  onUnblockSlot,
  onDeleteSlot,
  onViewBooking,
}) {
  const slots = schedule
    .flatMap((turf) =>
      turf.slots.map((slot) => ({
        ...slot,
        turfId: turf.id,
        turfName: turf.name,
        sport: turf.sport,
      })),
    )
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  if (slots.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <div className="rounded-3xl bg-slate-100 p-5">
          <CalendarX className="h-10 w-10 text-slate-400" />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-900">
          No slots for this day
        </h3>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          Add slots for this date to make your turf available for bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="space-y-3">
        {slots.map((slot) => (
          <CalendarSlotCard
            key={slot.id}
            slot={slot}
            onEdit={onEditSlot}
            onBlock={onBlockSlot}
            onUnblock={onUnblockSlot}
            onDelete={onDeleteSlot}
            onViewBooking={onViewBooking}
          />
        ))}
      </div>
    </div>
  );
}

export default CalendarDayBoard;
