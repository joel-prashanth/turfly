import { AlertTriangle } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const DeleteConfirmationModal = ({
  open,
  loading,
  itemName = "item",
  warning,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={open}
      title={`Delete ${itemName}`}
      onClose={loading ? undefined : onClose}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    >
      <p className="text-gray-600 leading-6">
        Are you sure you want to delete {itemName}?
      </p>

      {warning && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm leading-5 text-amber-800">{warning}</p>
        </div>
      )}

      <p className="mt-3 text-sm text-red-600">This action cannot be undone.</p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
