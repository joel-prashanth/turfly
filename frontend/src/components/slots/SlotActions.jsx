import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import DropdownMenu from "../ui/DropdownMenu";
import ConfirmDialog from "../ui/ConfirmDialog";

import { blockSlot, unblockSlot, deleteSlot } from "../../api/slotApi";

function SlotActions({ slot, refreshSlots, onEdit }) {
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

  let menuItems = [];

  if (slot.status === "AVAILABLE") {
    menuItems = [
      {
        label: "Edit Slot",
        onClick: () => onEdit?.(slot),
      },
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
    ];
  } else if (slot.status === "BLOCKED") {
    menuItems = [
      {
        label: "Edit Slot",
        onClick: () => onEdit?.(slot),
      },
      {
        label: "Unblock Slot",
        onClick: () =>
          setDialog({
            open: true,
            type: "unblock",
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
    ];
  }

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu items={menuItems} disabled={loading} />

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

export default SlotActions;
