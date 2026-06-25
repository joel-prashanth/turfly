import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock, MapPin, QrCode, ShieldCheck } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import PaymentQrModal from "../ui/PaymentQrModal";
import DepositPaymentModal from "./DepositPaymentModal";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

export default function BookingSuccessModal({ open, booking, turf, slots, onClose }) {
  const [showQr, setShowQr] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositDone, setDepositDone] = useState(false);
  if (!open || !slots?.length) return null;
  const sorted = [...slots].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const slot = sorted[0];
  const lastSlot = sorted[sorted.length - 1];

  const qrUrl = turf?.owner?.paymentQrUrl;
  const amount = booking?.amount;
  const depositAmount = Math.min(Math.max(Math.round((amount || 0) * 0.1), 99), 200);

  return (
    <>
    <Modal open={open} onClose={onClose} title="">
      <div className="flex flex-col items-center px-2 pb-2 pt-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>

        <h2 className="mt-4 text-2xl font-bold text-slate-900">Booking Confirmed!</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          See you on the turf. Pay at the venue on game day.
        </p>

        <div className="mt-6 w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left space-y-3">
          {booking?.id && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Booking ID</p>
                <p className="font-mono text-sm font-bold text-slate-800">{booking.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200">
              <MapPin className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Venue</p>
              <p className="text-sm font-bold text-slate-800">{turf?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200">
              <CalendarDays className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date</p>
              <p className="text-sm font-bold text-slate-800">{formatDate(slot.startTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200">
              <Clock className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Time</p>
              <p className="text-sm font-bold text-slate-800">
                {formatTime(slot.startTime)} – {formatTime(lastSlot.endTime)}
                {sorted.length > 1 && (
                  <span className="ml-2 text-xs font-semibold text-emerald-600">({sorted.length} slots)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Deposit CTA */}
        {depositDone ? (
          <div className="mt-5 flex w-full items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Deposit paid — slot is secured!
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeposit(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            <ShieldCheck className="h-4 w-4" />
            Pay &#8377;{depositAmount} deposit to secure slot
          </button>
        )}

        {qrUrl && (
          <button
            type="button"
            onClick={() => setShowQr(true)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <QrCode className="h-4 w-4" />
            Scan &amp; Pay Now
          </button>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Pay at the venue on game day — booking confirmed either way.
        </p>

        <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row">
          <Link to="/bookings" className="flex-1">
            <Button className="w-full">View My Bookings</Button>
          </Link>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Back to Slots
          </Button>
        </div>
      </div>
    </Modal>

    <PaymentQrModal
      open={showQr}
      onClose={() => setShowQr(false)}
      qrUrl={qrUrl}
      ownerName={turf?.owner?.businessName || turf?.owner?.name}
      amount={amount}
    />

    {showDeposit && (
      <DepositPaymentModal
        booking={booking}
        onSuccess={() => { setDepositDone(true); setShowDeposit(false); }}
        onClose={() => setShowDeposit(false)}
      />
    )}
    </>
  );
}
