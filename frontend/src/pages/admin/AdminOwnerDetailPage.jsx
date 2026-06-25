import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Hash,
  MapPin,
  Phone,
  QrCode,
  ShieldX,
  User,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  approveOwner,
  getOwnerDetail,
  reactivateOwner,
  rejectOwner,
  suspendOwner,
} from "../../api/adminApi";
import Button from "../../components/ui/Button";

const STATUS_CONFIG = {
  PENDING_REVIEW: { label: "Pending Review", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
  ACTIVE: { label: "Active", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  SUSPENDED: { label: "Suspended", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

const BOOKING_STATUS_COLORS = {
  CONFIRMED: "text-emerald-400",
  CANCELLED: "text-red-400",
  COMPLETED: "text-blue-400",
  PENDING: "text-amber-400",
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-200">{value || <span className="text-slate-600">—</span>}</p>
      </div>
    </div>
  );
}

function ActionModal({ open, title, placeholder, danger, loading, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <textarea
          rows={3}
          placeholder={placeholder}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
        />
        <div className="mt-4 flex gap-3">
          <Button
            size="sm"
            variant={danger ? "danger" : "primary"}
            loading={loading}
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
          >
            Confirm
          </Button>
          <Button size="sm" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOwnerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'reject' | 'suspend' | null

  const load = () => {
    setLoading(true);
    getOwnerDetail(id)
      .then((r) => setOwner(r.data))
      .catch(() => toast.error("Failed to load owner."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const runAction = async (fn, successMsg) => {
    try {
      setActionLoading(true);
      await fn();
      toast.success(successMsg);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!owner) return null;

  const cfg = STATUS_CONFIG[owner.ownerStatus] || STATUS_CONFIG.ACTIVE;
  const StatusIcon = cfg.icon;

  return (
    <>
      <div className="min-h-screen bg-slate-950 p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/owners")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              {owner.avatarUrl ? (
                <img src={owner.avatarUrl} alt={owner.name} className="h-12 w-12 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700 text-lg font-bold text-white">
                  {owner.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{owner.name}</h1>
                <p className="text-sm text-slate-400">{owner.email}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {cfg.label}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {owner.ownerStatus === "PENDING_REVIEW" && (
              <>
                <Button
                  size="sm"
                  onClick={() => runAction(() => approveOwner(id), "Owner approved.")}
                  loading={actionLoading}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setModal("reject")}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            {owner.ownerStatus === "ACTIVE" && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setModal("suspend")}
                disabled={actionLoading}
              >
                <AlertCircle className="h-4 w-4" />
                Suspend
              </Button>
            )}
            {owner.ownerStatus === "SUSPENDED" && (
              <Button
                size="sm"
                onClick={() => runAction(() => reactivateOwner(id), "Owner reactivated.")}
                loading={actionLoading}
              >
                <CheckCircle2 className="h-4 w-4" />
                Reactivate
              </Button>
            )}
          </div>
        </div>

        {owner.ownerStatusReason && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-400">Status Reason</p>
              <p className="mt-0.5 text-sm text-red-300">{owner.ownerStatusReason}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {/* Profile */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-slate-500">Profile</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoRow icon={User} label="Full Name" value={owner.name} />
                <InfoRow icon={Phone} label="Phone" value={owner.phone} />
                <InfoRow icon={Building2} label="Business Name" value={owner.businessName} />
                <InfoRow icon={Hash} label="GST Number" value={owner.gstNumber} />
                <InfoRow icon={CreditCard} label="UPI ID" value={owner.upiId} />
                <InfoRow
                  icon={CalendarDays}
                  label="Joined"
                  value={new Date(owner.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                />
              </div>
              {owner.paymentQrUrl && (
                <div className="mt-5 border-t border-slate-800 pt-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <QrCode className="h-3.5 w-3.5" />
                    Payment QR
                  </div>
                  <img
                    src={owner.paymentQrUrl}
                    alt="Payment QR"
                    className="mt-3 h-32 w-32 rounded-xl border border-slate-700 object-contain"
                  />
                </div>
              )}

              {/* Verification Document */}
              <div className="mt-5 border-t border-slate-800 pt-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <FileText className="h-3.5 w-3.5" />
                  Verification Document
                </div>
                {owner.verificationDocUrl ? (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                    <FileText className="h-6 w-6 shrink-0 text-blue-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{owner.verificationDocType || "Document"}</p>
                      <p className="text-xs text-slate-400">Uploaded by owner</p>
                    </div>
                    <a
                      href={owner.verificationDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </a>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                    <ShieldX className="h-5 w-5 shrink-0 text-amber-400" />
                    <p className="text-sm text-amber-300">No verification document uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Turfs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-slate-500">
                Turfs ({owner.turfs.length})
              </h2>
              {owner.turfs.length === 0 ? (
                <p className="text-sm text-slate-600">No turfs listed yet.</p>
              ) : (
                <div className="space-y-3">
                  {owner.turfs.map((turf) => (
                    <div key={turf.id} className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                      {turf.imageUrl && (
                        <img src={turf.imageUrl} alt={turf.name} className="h-12 w-16 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">{turf.name}</p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {turf.location}
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-slate-400">
                        <p>{turf.slotCount} slots</p>
                        <p className="text-emerald-400">{turf.confirmedBookings} bookings</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${turf.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                        {turf.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — stats + recent bookings */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-slate-500">Stats</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-800 p-4 text-center">
                  <p className="text-2xl font-black text-white">{owner.turfs.length}</p>
                  <p className="mt-1 text-xs text-slate-400">Turfs</p>
                </div>
                <div className="rounded-xl bg-slate-800 p-4 text-center">
                  <p className="text-2xl font-black text-white">{owner.stats.totalBookings}</p>
                  <p className="mt-1 text-xs text-slate-400">Total Bookings</p>
                </div>
                <div className="col-span-2 rounded-xl bg-emerald-500/10 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-400">{owner.stats.confirmedBookings}</p>
                  <p className="mt-1 text-xs text-emerald-600">Confirmed</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-slate-500">Recent Bookings</h2>
              {owner.recentBookings.length === 0 ? (
                <p className="text-sm text-slate-600">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {owner.recentBookings.map((b) => (
                    <div key={b.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{b.player?.name || b.walkInName || "Walk-in"}</p>
                        <span className={`text-xs font-semibold ${BOOKING_STATUS_COLORS[b.status]}`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{b.slot.turf.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(b.slot.startTime).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short",
                        })}{" "}
                        &middot;{" "}
                        {new Date(b.slot.startTime).toLocaleTimeString("en-IN", {
                          hour: "numeric", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ActionModal
        open={modal === "reject"}
        title="Reject Owner"
        placeholder="Reason for rejection (visible to owner)..."
        danger
        loading={actionLoading}
        onConfirm={(reason) => runAction(() => rejectOwner(id, reason), "Owner rejected.")}
        onClose={() => setModal(null)}
      />

      <ActionModal
        open={modal === "suspend"}
        title="Suspend Owner"
        placeholder="Reason for suspension (visible to owner)..."
        danger
        loading={actionLoading}
        onConfirm={(reason) => runAction(() => suspendOwner(id, reason), "Owner suspended.")}
        onClose={() => setModal(null)}
      />
    </>
  );
}
