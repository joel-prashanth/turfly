import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { createReview } from "../../api/reviewApi";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export default function ReviewModal({ open, booking, onClose, onReviewed }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const turf = booking.slot.turf;

  const handleSubmit = async () => {
    if (!rating) { toast.error("Pick a star rating first."); return; }
    setLoading(true);
    try {
      await createReview(booking.id, rating, comment);
      toast.success("Review submitted!");
      onReviewed?.();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const active = hovered || rating;

  return (
    <Modal open={open} onClose={onClose} title="Leave a Review" size="sm">
      <div className="space-y-5 pb-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm font-bold text-slate-900">{turf.name}</p>
          <p className="text-xs text-slate-400">{turf.location}</p>
        </div>

        {/* Star picker */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex gap-2"
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                className="p-1"
              >
                <Star
                  size={36}
                  className={`transition-colors duration-100 ${
                    n <= active
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              </button>
            ))}
          </div>
          {active > 0 && (
            <p className="text-sm font-semibold text-slate-600">{LABELS[active]}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Comment <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was your experience? Anything the owner should know?"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
            maxLength={500}
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{comment.length}/500</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading || !rating}>
            {loading ? "Submitting…" : "Submit Review"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
