import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  Hash,
  IndianRupee,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import BookingStatusBadge from "./BookingStatusBadge";
import { ownerCancelBooking } from "../../api/bookingApi";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="mt-0.5 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function BookingDetailsModal({ open, booking, onClose, onCancelled }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!booking) return null;

  const { player, slot, status } = booking;
  const playerName = player?.name || booking.walkInName || "Walk-in";
  const playerPhone = player?.phone || booking.walkInPhone || "—";
  const turf = slot.turf;

  const isUpcoming = new Date(slot.endTime) > new Date();
  const canCancel = status === "CONFIRMED" && isUpcoming;

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await ownerCancelBooking(booking.id);
      toast.success("Booking cancelled.");
      setConfirmCancel(false);
      onClose();
      onCancelled?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  const handleClose = () => {
    setConfirmCancel(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Booking Details"
      size="sm"
      onClose={cancelling ? undefined : handleClose}
      closeOnBackdrop={!cancelling}
      closeOnEscape={!cancelling}
      footer={
        <div className="flex w-full items-center justify-between">
          {canCancel && !confirmCancel ? (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition hover:text-red-700"
            >
              <XCircle size={15} />
              Cancel booking
            </button>
          ) : (
            <span />
          )}
          <Button variant="secondary" onClick={handleClose} disabled={cancelling}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DetailRow icon={User} label="Player" value={playerName} />
          <DetailRow icon={Phone} label="Phone" value={playerPhone} />
          <DetailRow icon={MapPin} label="Turf" value={turf.name} />
          <DetailRow
            icon={CalendarDays}
            label="Date"
            value={new Date(slot.startTime).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
          <DetailRow
            icon={Clock3}
            label="Time"
            value={`${new Date(slot.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} – ${new Date(slot.endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
          />
          <DetailRow
            icon={IndianRupee}
            label="Amount"
            value={`₹${Number(turf.pricePerHour).toLocaleString("en-IN")}`}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">Status</span>
          <BookingStatusBadge status={status} />
        </div>

        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Booking ID
          </p>
          <p className="mt-0.5 font-mono text-xs text-slate-500 break-all">
            {booking.id}
          </p>
        </div>

        {confirmCancel && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              Cancel this booking?
            </p>
            <p className="mt-1 text-sm text-red-700">
              The slot will open back up for other players.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="danger"
                onClick={handleCancel}
                loading={cancelling}
              >
                Yes, cancel it
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setConfirmCancel(false)}
                disabled={cancelling}
              >
                Keep booking
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default BookingDetailsModal;
