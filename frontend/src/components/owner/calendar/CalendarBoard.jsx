import { CalendarDays } from "lucide-react";

import EmptyState from "../../ui/EmptyState";
import TurfCalendarCard from "./TurfCalendarCard";

function CalendarBoard({ schedule }) {
  const hasSlots = schedule.some((turf) => turf.slots.length > 0);

  if (!schedule.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No turfs found"
        description="Create a turf to start managing your schedule."
      />
    );
  }

  if (!hasSlots) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No slots scheduled"
        description="There are no slots for the selected day."
      />
    );
  }

  return (
    <div className="space-y-8">
      {schedule.map((turf) => (
        <TurfCalendarCard key={turf.id} turf={turf} />
      ))}
    </div>
  );
}

export default CalendarBoard;
