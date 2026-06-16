import { useEffect } from "react";
import { createPortal } from "react-dom";

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

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={() => closeOnBackdrop && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        {title && (
          <h2 id="modal-title" className="text-2xl font-bold text-slate-900">
            {title}
          </h2>
        )}

        <div className={title ? "mt-6" : ""}>{children}</div>

        {footer && <div className="mt-8 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
