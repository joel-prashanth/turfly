import { useEffect } from "react";
import { createPortal } from "react-dom";

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

const Modal = ({
  open,
  title,
  children,
  footer,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  size = "xl",
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
        className={`flex w-full flex-col ${sizeClass[size] ?? sizeClass.xl} max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl`}
      >
        {title && (
          <div className="shrink-0 border-b border-slate-100 px-6 py-4">
            <h2 id="modal-title" className="text-xl font-bold text-slate-900">
              {title}
            </h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-slate-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
