import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function SlotActionsMenu({
  slot,
  onEdit,
  onBlock,
  onUnblock,
  onDelete,
  onViewBooking,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg p-2 transition hover:bg-slate-100"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {slot.status === "AVAILABLE" && (
            <>
              <button
                onClick={() => {
                  closeMenu();
                  onEdit(slot);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
              >
                Edit Slot
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  onBlock(slot);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
              >
                Block Slot
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  onDelete(slot);
                }}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Delete Slot
              </button>
            </>
          )}

          {slot.status === "BLOCKED" && (
            <button
              onClick={() => {
                closeMenu();
                onUnblock(slot);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
            >
              Unblock Slot
            </button>
          )}

          {slot.status === "BOOKED" && (
            <button
              onClick={() => {
                closeMenu();
                onViewBooking(slot);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
            >
              View Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SlotActionsMenu;