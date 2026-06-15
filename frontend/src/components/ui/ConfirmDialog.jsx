import Button from "./Button";
import Modal from "./Modal";

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={loading ? undefined : onClose}>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>

          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
