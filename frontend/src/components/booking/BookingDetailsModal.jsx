import {
  CalendarDays,
  Clock3,
  IndianRupee,
  MapPin,
  Phone,
  User,
  Hash,
} from "lucide-react";

import Modal from "../ui/Modal";
import BookingStatusBadge from "./BookingStatusBadge";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="mt-0.5 text-slate-500" />

      <div>
        <p className="text-sm text-slate-500">{label}</p>

        <p className="font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function BookingDetailsModal({ open, booking, onClose }) {
  if (!booking) return null;

  const { player, slot, status } = booking;

  const turf = slot.turf;

  return (
    <Modal open={open} title="Booking Details" onClose={onClose}>
      <div className="space-y-6">
        <DetailRow icon={User} label="Player" value={player.name} />

        <DetailRow icon={Phone} label="Phone" value={player.phone} />

        <DetailRow icon={MapPin} label="Turf" value={turf.name} />

        <DetailRow
          icon={CalendarDays}
          label="Date"
          value={new Date(slot.startTime).toLocaleDateString()}
        />

        <DetailRow
          icon={Clock3}
          label="Time"
          value={`${new Date(slot.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${new Date(slot.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`}
        />

        <DetailRow
          icon={IndianRupee}
          label="Amount"
          value={`₹${turf.pricePerHour}`}
        />

        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <span className="font-medium text-slate-700">Status</span>

          <BookingStatusBadge status={status} />
        </div>

        <DetailRow icon={Hash} label="Booking ID" value={booking.id} />
      </div>
    </Modal>
  );
}

export default BookingDetailsModal;
