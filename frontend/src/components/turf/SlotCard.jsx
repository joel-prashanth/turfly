import Button from "../ui/Button";
import Card from "../ui/Card";
import { CalendarDays, Clock } from "lucide-react";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

function SlotCard({ slot, canBook, onBook }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-700">
            <CalendarDays size={18} />

            {formatDate(slot.startTime)}
          </div>

          <div className="mt-2 flex items-center gap-2 text-slate-600">
            <Clock size={18} />

            {formatTime(slot.startTime)}
            {" - "}
            {formatTime(slot.endTime)}
          </div>
        </div>

        {slot.status === "AVAILABLE" ? (
          canBook ? (
            <Button onClick={() => onBook(slot.id)}>Book Now</Button>
          ) : (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm">
              Players Only
            </span>
          )
        ) : (
          <span className="rounded-full bg-red-100 px-4 py-2 text-red-600 text-sm">
            Booked
          </span>
        )}
      </div>
    </Card>
  );
}

export default SlotCard;
