import { useCallback, useEffect, useState } from "react";
import { MessageSquareReply, Star } from "lucide-react";
import toast from "react-hot-toast";

import { getOwnerReviews, replyToReview } from "../api/reviewApi";
import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </div>
  );
}

function ReplyModal({ review, onClose, onReplied }) {
  const [text, setText] = useState(review?.ownerReply || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) { toast.error("Reply cannot be empty."); return; }
    setLoading(true);
    try {
      await replyToReview(review.id, text);
      toast.success("Reply posted!");
      onReplied();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to post reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!review} onClose={onClose} title="Reply to Review" size="sm">
      <div className="space-y-4 pb-2">
        {/* The review being replied to */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{review?.player?.name}</p>
            <StarRow rating={review?.rating} />
          </div>
          {review?.comment && (
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{review.comment}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Your reply</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Thank the player, address any concerns, or invite them back…"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
            maxLength={500}
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{text.length}/500</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading || !text.trim()}>
            {loading ? "Posting…" : "Post Reply"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOwnerReviews({ limit: 50 });
      setReviews(res.data.reviews || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return (
    <Container className="py-8">
      <div className="mb-8 flex flex-col gap-1">
        <PageHeader
          title="Reviews"
          subtitle="See what players say about your turfs and reply to their feedback."
        />
        {avgRating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((n) => (
                <Star key={n} size={16} className={n <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-700">{avgRating}</span>
            <span className="text-sm text-slate-400">· {total} review{total !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="py-20 text-center">
          <Star size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-500">No reviews yet</p>
          <p className="mt-1 text-xs text-slate-400">Reviews will appear here after players complete bookings.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const initials = r.player.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-start gap-3">
                  {r.player.avatarUrl ? (
                    <img src={r.player.avatarUrl} alt={r.player.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{r.player.name}</p>
                      <StarRow rating={r.rating} />
                      <span className="text-xs text-slate-400">{fmtDate(r.createdAt)}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{r.turf?.name}</span>
                    </div>
                    {r.comment && (
                      <p className="mt-1.5 text-sm leading-6 text-slate-700">{r.comment}</p>
                    )}
                    {r.ownerReply ? (
                      <div className="mt-3 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5">
                        <p className="text-xs font-semibold text-green-700">Your reply</p>
                        <p className="mt-1 text-sm leading-5 text-green-800">{r.ownerReply}</p>
                        <button
                          onClick={() => setReplyTarget(r)}
                          className="mt-1.5 text-xs text-green-600 underline underline-offset-2 hover:text-green-800"
                        >
                          Edit reply
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3"
                        onClick={() => setReplyTarget(r)}
                      >
                        <MessageSquareReply size={13} />
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {replyTarget && (
        <ReplyModal
          review={replyTarget}
          onClose={() => setReplyTarget(null)}
          onReplied={() => { setReplyTarget(null); load(); }}
        />
      )}
    </Container>
  );
}
