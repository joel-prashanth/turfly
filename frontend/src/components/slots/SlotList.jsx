import EmptyState from "../ui/EmptyState";
import SlotRow from "./SlotRow";

function SlotList({ slots, pricePerHour, refreshSlots, onEdit, onWalkIn }) {
  if (slots.length === 0) {
    return (
      <EmptyState
        title="No slots found"
        description="Create your first slot to start accepting bookings."
      />
    );
  }

  return (
    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {slots.map((slot) => (
        <SlotRow
          key={slot.id}
          slot={slot}
          pricePerHour={pricePerHour}
          refreshSlots={refreshSlots}
          onEdit={onEdit}
          onWalkIn={onWalkIn}
        />
      ))}
    </div>
  );
}

export default SlotList;
