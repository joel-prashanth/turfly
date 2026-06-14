import { CalendarDays } from "lucide-react";

import EmptyState from "../../ui/EmptyState";
import TurfScheduleCard from "./TurfScheduleCard";

function ScheduleBoard({ schedule }) {
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
        <TurfScheduleCard
          key={turf.id}
          turf={turf}
        />
      ))}
    </div>
  );
}

export default ScheduleBoard;