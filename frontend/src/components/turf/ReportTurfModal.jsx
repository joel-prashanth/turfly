import { useState } from "react";
import { X, Flag, AlertTriangle } from "lucide-react";
import { submitReport } from "../../api/reportApi";
import toast from "react-hot-toast";

const REASONS = [
  "Fake or stock photos",
  "Venue doesn't exist",
  "Wrong location",
  "Misleading description",
  "Other",
];

export default function ReportTurfModal({ turf, onClose }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await submitReport(turf.id, { reason, description: description.trim() || undefined });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-red-500" />
            <span className="font-semibold text-gray-900">Report listing</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-10 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Flag size={22} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Report submitted</p>
            <p className="text-sm text-gray-500">Our team will review this listing. Thank you for helping keep the platform trustworthy.</p>
            <button onClick={onClose} className="mt-5 px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
              Done
            </button>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">What's wrong with <span className="font-medium text-gray-800">{turf.name}</span>?</p>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-red-500"
                    />
                    <span className="text-sm text-gray-700">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Additional details (optional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Anything specific to help our review…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">False reports may result in account restrictions.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason || loading}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
