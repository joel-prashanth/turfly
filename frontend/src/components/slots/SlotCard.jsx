import SlotStatusBadge from "./SlotStatusBadge";

function SlotCard({ slot }) {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">
            {start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" - "}
            {end.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {start.toLocaleDateString()}
          </p>
        </div>

        <SlotStatusBadge status={slot.status} />
      </div>
    </div>
  );
}

export default SlotCard;
