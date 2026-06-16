import { CheckCircle2, CalendarCheck, Ban, MapPinned } from "lucide-react";

import KPICard from "../../ui/KPICard";

function CalendarSummary({ schedule }) {
  const stats = schedule.reduce(
    (acc, turf) => {
      acc.turfs += 1;

      turf.slots.forEach((slot) => {
        switch (slot.status) {
          case "AVAILABLE":
            acc.available += 1;
            break;

          case "BOOKED":
            acc.booked += 1;
            break;

          case "BLOCKED":
            acc.blocked += 1;
            break;

          default:
            break;
        }
      });

      return acc;
    },
    {
      turfs: 0,
      available: 0,
      booked: 0,
      blocked: 0,
    },
  );

  const cards = [
    {
      label: "Available Slots",
      value: stats.available,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Booked Today",
      value: stats.booked,
      icon: CalendarCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Blocked Slots",
      value: stats.blocked,
      icon: Ban,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Active Turfs",
      value: stats.turfs,
      icon: MapPinned,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KPICard
          key={card.label}
          title={card.label}
          value={card.value}
          icon={card.icon}
          color={card.color}
          bg={card.bg}
        />
      ))}
    </div>
  );
}

export default CalendarSummary;
