import { QrCode } from "lucide-react";
import Modal from "./Modal";

export default function PaymentQrModal({ open, onClose, qrUrl, ownerName, amount }) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Scan to Pay" size="sm">
      <div className="flex flex-col items-center pb-2 text-center">
        <p className="text-sm text-slate-500">
          Scan this QR with any UPI app to pay{" "}
          {ownerName ? (
            <span className="font-semibold text-slate-700">{ownerName}</span>
          ) : (
            "the venue"
          )}{" "}
          directly.
        </p>

        {amount && (
          <div className="mt-3 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            &#8377;{Number(amount).toLocaleString("en-IN")} payable
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <img
            src={qrUrl}
            alt="Payment QR Code"
            className="h-56 w-56 rounded-xl object-contain"
          />
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
          <QrCode className="h-3.5 w-3.5" />
          Works with GPay, PhonePe, Paytm, and all UPI apps
        </p>

        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          Your booking is already confirmed. Payment is optional now — you can also pay at the venue.
        </p>
      </div>
    </Modal>
  );
}
