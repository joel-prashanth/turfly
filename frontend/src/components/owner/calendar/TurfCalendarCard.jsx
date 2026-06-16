import { CalendarX2 } from "lucide-react";

import Card from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";

import CalendarSlotRow from "./CalendarSlotRow";

function TurfCalendarCard({ turf }) {
  return (
    <Card className="relative overflow-visible p-0">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {turf.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">{turf.sport}</p>
          </div>

          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {turf.slots.length} {turf.slots.length === 1 ? "slot" : "slots"}
          </div>
        </div>
      </div>

      {turf.slots.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={CalendarX2}
            title="No slots scheduled"
            description="There are no slots for this turf on the selected day."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {turf.slots.map((slot) => (
            <CalendarSlotRow key={slot.id} slot={slot} />
          ))}
        </div>
      )}
    </Card>
  );
}

export default TurfCalendarCard;
