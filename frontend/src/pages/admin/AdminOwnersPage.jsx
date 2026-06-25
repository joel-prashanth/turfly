import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { listOwners } from "../../api/adminApi";
import useDebounce from "../../hooks/useDebounce";

const STATUS_TABS = [
  { key: "ALL", label: "All" },
  { key: "PENDING_REVIEW", label: "Pending Review", icon: Clock, color: "amber" },
  { key: "ACTIVE", label: "Active", icon: CheckCircle2, color: "emerald" },
  { key: "SUSPENDED", label: "Suspended", icon: AlertCircle, color: "red" },
];

const STATUS_CONFIG = {
  PENDING_REVIEW: { label: "Pending Review", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  ACTIVE: { label: "Active", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  SUSPENDED: { label: "Suspended", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

function OwnerRow({ owner, onClick }) {
  const cfg = STATUS_CONFIG[owner.ownerStatus] || STATUS_CONFIG.ACTIVE;
  return (
    <tr
      className="cursor-pointer border-b border-slate-800 transition hover:bg-slate-800/50"
      onClick={() => onClick(owner.id)}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {owner.avatarUrl ? (
            <img src={owner.avatarUrl} alt={owner.name} className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700 text-sm font-bold text-white">
              {owner.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-white">{owner.name}</p>
            <p className="text-xs text-slate-400">{owner.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-slate-300">{owner.businessName || <span className="text-slate-600">—</span>}</p>
      </td>
      <td className="px-5 py-4 text-sm text-slate-400">{owner.phone}</td>
      <td className="px-5 py-4">
        <div className="flex gap-3 text-sm text-slate-400">
          <span>{owner.activeTurfCount} <span className="text-slate-600">turfs</span></span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
          {cfg.label}
        </span>
      </td>
      <td className="px-5 py-4 text-xs text-slate-500">
        {new Date(owner.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </td>
    </tr>
  );
}

export default function AdminOwnersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [owners, setOwners] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const activeStatus = searchParams.get("status") || "ALL";

  const fetchOwners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listOwners({ status: activeStatus, search: debouncedSearch });
      setOwners(res.data.owners);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load owners.");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, debouncedSearch]);

  useEffect(() => { fetchOwners(); }, [fetchOwners]);

  const setStatus = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key === "ALL") next.delete("status");
    else next.set("status", key);
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Venue Owners</h1>
          <p className="mt-1 text-sm text-slate-400">
            Review, approve, and manage owner accounts.
          </p>
        </div>
        {pagination && (
          <p className="text-sm text-slate-500">{pagination.total} total</p>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map(({ key, label, icon: Icon, color }) => {
          const isActive = activeStatus === key;
          const activeColors = {
            amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
            emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
            red: "bg-red-500/20 text-red-300 border-red-500/30",
          };
          return (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? color ? activeColors[color] : "border-slate-600 bg-slate-700 text-white"
                  : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, email, business, phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-slate-800/50" />
            ))}
          </div>
        ) : owners.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Building2 className="h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-400">No owners found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-widest text-slate-500">
                <th className="px-5 py-3 text-left">Owner</th>
                <th className="px-5 py-3 text-left">Business</th>
                <th className="px-5 py-3 text-left">Phone</th>
                <th className="px-5 py-3 text-left">Turfs</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <OwnerRow key={owner.id} owner={owner} onClick={(id) => navigate(`/admin/owners/${id}`)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
