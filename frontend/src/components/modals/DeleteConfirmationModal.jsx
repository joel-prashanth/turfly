import Button from "../ui/Button";
import Modal from "../ui/Modal";

const DeleteConfirmationModal = ({
  open,
  loading,
  itemName = "item",
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

      <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
