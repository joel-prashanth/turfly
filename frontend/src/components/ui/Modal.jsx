import { useEffect } from "react";

const Modal = ({
  open,
  title,
  children,
  footer,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => {
        if (closeOnBackdrop) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 animate-in fade-in zoom-in duration-200"
      >
        {title && (
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
        )}

        <div className="mt-4">{children}</div>

        {footer && <div className="mt-8 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
