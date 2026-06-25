import { useState } from "react";
import { ShieldCheck, X, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { createDepositOrder, verifyDepositPayment } from "../../api/depositApi";
import Button from "../ui/Button";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function DepositPaymentModal({ booking, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);

  const depositAmount = booking?.depositAmount
    ? booking.depositAmount
    : Math.min(Math.max(Math.round((booking?.amount || 0) * 0.1), 99), 200);

  const handlePay = async () => {
    setLoading(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) {
        toast.error("Could not load payment gateway. Please try again.");
        return;
      }

      const { data } = await createDepositOrder(booking.id);

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "Turfly",
          description: `Booking deposit — ${data.turf?.name || ""}`,
          order_id: data.order.id,
          theme: { color: "#10b981" },
          handler: async (response) => {
            try {
              await verifyDepositPayment({
                bookingId: booking.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              toast.success("Deposit paid! Your slot is secured.");
              onSuccess?.();
              resolve();
            } catch (err) {
              toast.error(err.response?.data?.message || "Deposit verification failed.");
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("dismissed")) },
        });
        rzp.open();
      });
    } catch (err) {
      if (err?.message !== "dismissed") {
        toast.error(err.response?.data?.message || "Payment failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Secure your slot</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 transition hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
            <p className="text-sm font-semibold text-emerald-400">
              &#8377;{depositAmount} refundable deposit
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Show up &rarr; deposit is refunded. No-show &rarr; venue keeps it.
              The rest (&#8377;{Math.max(0, (booking?.amount || 0) - depositAmount)}) is paid at the turf.
            </p>
          </div>

          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              Confirms your slot instantly — no risk of it going to someone else
            </li>
            <li className="flex items-start gap-2">
              <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              Deposit is automatically refunded after you play
            </li>
            <li className="flex items-start gap-2">
              <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              Only &#8377;{depositAmount} now — pay the rest at the venue
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-800 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 transition hover:border-slate-600 hover:text-white"
          >
            Skip for now
          </button>
          <Button onClick={handlePay} loading={loading} className="flex-1">
            Pay &#8377;{depositAmount} deposit
          </Button>
        </div>
      </div>
    </div>
  );
}
