import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock, CheckCircle2, Lock, User } from "lucide-react";

import DropdownMenu from "../../ui/DropdownMenu";
import ConfirmDialog from "../../ui/ConfirmDialog";

import { blockSlot, unblockSlot, deleteSlot } from "../../../api/slotApi";

const STATUS_STYLES = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  BOOKED: "bg-blue-50 text-blue-700 border border-blue-200",
  BLOCKED: "bg-red-50 text-red-700 border border-red-200",
};

const STATUS_LABELS = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
  BLOCKED: "Blocked",
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

function SlotRow({ slot, refreshSlots }) {
  const isBooked = slot.status === "BOOKED";
  const isBlocked = slot.status === "BLOCKED";

  const [loading, setLoading] = useState(false);

  const [dialog, setDialog] = useState({
    open: false,
    type: null,
  });

  const dialogConfig = useMemo(() => {
    switch (dialog.type) {
      case "block":
        return {
          title: "Block Slot",
          description:
            "This slot will become unavailable for booking until you unblock it.",
          confirmText: "Block Slot",
          danger: false,
        };

      case "unblock":
        return {
          title: "Unblock Slot",
          description: "This slot will become available for booking again.",
          confirmText: "Unblock Slot",
          danger: false,
        };

      case "delete":
        return {
          title: "Delete Slot",
          description:
            "This action cannot be undone. The slot will be permanently deleted.",
          confirmText: "Delete Slot",
          danger: true,
        };

      default:
        return {};
    }
  }, [dialog.type]);

  const closeDialog = () => {
    if (loading) return;

    setDialog({
      open: false,
      type: null,
    });
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      switch (dialog.type) {
        case "block":
          await blockSlot(slot.id);
          toast.success("Slot blocked successfully.");
          break;

        case "unblock":
          await unblockSlot(slot.id);
          toast.success("Slot unblocked successfully.");
          break;

        case "delete":
          await deleteSlot(slot.id);
          toast.success("Slot deleted successfully.");
          break;

        default:
          return;
      }

      closeDialog();

      await refreshSlots();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const menuItems =
    slot.status === "AVAILABLE"
      ? [
          {
            label: "Block Slot",
            onClick: () =>
              setDialog({
                open: true,
                type: "block",
              }),
          },
          {
            label: "Delete Slot",
            danger: true,
            onClick: () =>
              setDialog({
                open: true,
                type: "delete",
              }),
          },
        ]
      : slot.status === "BLOCKED"
        ? [
            {
              label: "Unblock Slot",
              onClick: () =>
                setDialog({
                  open: true,
                  type: "unblock",
                }),
            },
          ]
        : [];

  return (
    <>
      <div className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-slate-50 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-slate-100 p-3">
            <CalendarClock size={20} className="text-slate-600" />
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </h4>

            {isBooked && slot.booking?.player ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <User size={15} />
                <span>{slot.booking.player.name}</span>
              </div>
            ) : isBlocked ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Lock size={15} />
                <span>Blocked by owner</span>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 size={15} />
                <span>Ready for booking</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ${
              STATUS_STYLES[slot.status]
            }`}
          >
            {STATUS_LABELS[slot.status]}
          </div>

          {!isBooked && menuItems.length > 0 && (
            <DropdownMenu items={menuItems} disabled={loading} />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={dialog.open}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        loading={loading}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={dialogConfig.confirmText}
        danger={dialogConfig.danger}
      />
    </>
  );
}

export default SlotRow;
