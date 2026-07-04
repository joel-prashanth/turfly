import { useRef } from "react";
import { Printer, X } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const GST_RATE = 0.18;
const HSN_CODE = "996331"; // short-term accommodation / sports facility rental

const fmtINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

export default function GSTInvoiceModal({ open, booking, ownerProfile, onClose }) {
  const printRef = useRef(null);

  if (!booking) return null;

  const turf = booking.slot?.turf;
  const extraSlots = booking.extraSlots ?? [];
  const endTime = extraSlots.length > 0
    ? extraSlots[extraSlots.length - 1].slot.endTime
    : booking.slot?.endTime;

  const totalAmount = Number(booking.amount || 0);
  // Work backwards: total is inclusive of GST
  const baseAmount = totalAmount / (1 + GST_RATE);
  const gstAmount = totalAmount - baseAmount;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const invoiceNo = `TF-${booking.id.slice(0, 8).toUpperCase()}`;
  const playerName = booking.player?.name || booking.walkInName || "Walk-in Customer";
  const playerPhone = booking.player?.phone || booking.walkInPhone || "—";

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=800,height=900");
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; font-size: 13px; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: 900; color: #16a34a; letter-spacing: -1px; }
            .invoice-title { font-size: 22px; font-weight: 800; color: #0f172a; }
            .invoice-meta { font-size: 12px; color: #64748b; margin-top: 4px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
            .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 6px; }
            .section-value { font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
            td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
            .totals { margin-left: auto; width: 280px; }
            .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; border-bottom: 1px solid #f1f5f9; }
            .total-row.grand { font-size: 15px; font-weight: 800; color: #0f172a; border-bottom: none; padding-top: 10px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
            .gst-note { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 24px; font-size: 12px; color: #166534; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <Modal open={open} onClose={onClose} title="GST Invoice" size="lg">
      <div className="flex justify-end gap-2 pb-3">
        <Button onClick={handlePrint} className="gap-2">
          <Printer size={15} />
          Print / Download PDF
        </Button>
      </div>

      {/* Printable content */}
      <div
        ref={printRef}
        className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-800"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-green-500 pb-5">
          <div>
            <p className="text-3xl font-black tracking-tight text-green-600">Turfly</p>
            <p className="mt-1 text-xs text-slate-500">Sports Turf Booking Platform</p>
            {ownerProfile?.gstNumber && (
              <p className="mt-1 text-xs font-semibold text-slate-700">
                GSTIN: {ownerProfile.gstNumber}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900">TAX INVOICE</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">{invoiceNo}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Issued: {fmtDate(booking.createdAt || new Date())}
            </p>
          </div>
        </div>

        {/* Billed from / to */}
        <div className="mt-5 grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Billed From</p>
            <p className="mt-1.5 font-bold text-slate-900">
              {ownerProfile?.businessName || turf?.owner?.name || "Venue Owner"}
            </p>
            {turf && (
              <>
                <p className="text-slate-600">{turf.name}</p>
                <p className="text-slate-500">{turf.location}</p>
              </>
            )}
            {ownerProfile?.gstNumber && (
              <p className="mt-1 text-xs text-slate-500">GSTIN: {ownerProfile.gstNumber}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Billed To</p>
            <p className="mt-1.5 font-bold text-slate-900">{playerName}</p>
            <p className="text-slate-500">{playerPhone}</p>
          </div>
        </div>

        {/* Line items */}
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</th>
              <th className="py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">HSN</th>
              <th className="py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</th>
              <th className="py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3">
                <p className="font-semibold text-slate-900">{turf?.name} — Slot Booking</p>
                <p className="text-xs text-slate-500">
                  {fmtDate(booking.slot?.startTime)} · {fmtTime(booking.slot?.startTime)} – {fmtTime(endTime)}
                </p>
              </td>
              <td className="py-3 text-slate-500">{HSN_CODE}</td>
              <td className="py-3 text-right text-slate-700">
                {Math.round((new Date(endTime) - new Date(booking.slot?.startTime)) / 3600000 * 10) / 10}h
              </td>
              <td className="py-3 text-right font-semibold text-slate-900">₹{fmtINR(baseAmount)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto w-64 space-y-1.5 border-t border-slate-200 pt-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal (excl. GST)</span>
            <span>₹{fmtINR(baseAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>CGST @ 9%</span>
            <span>₹{fmtINR(cgst)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>SGST @ 9%</span>
            <span>₹{fmtINR(sgst)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-black text-slate-900">
            <span>Total</span>
            <span>₹{fmtINR(totalAmount)}</span>
          </div>
        </div>

        {/* GST note */}
        <div className="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-xs text-green-800">
          GST is applicable at 18% (CGST 9% + SGST 9%) on sports facility rental services under SAC code {HSN_CODE}.
          {ownerProfile?.gstNumber
            ? ` Vendor GSTIN: ${ownerProfile.gstNumber}.`
            : " Owner GSTIN not configured — add it in Profile settings."}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          This is a computer-generated invoice. Thank you for booking with Turfly.
        </p>
      </div>
    </Modal>
  );
}
