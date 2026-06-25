import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Flag,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { getPlatformStats } from "../../api/adminApi";
import Card from "../../components/ui/Card";

function StatCard({ label, value, sub, color = "slate", icon: Icon }) {
  const colors = {
    slate: "bg-slate-800 text-slate-300 border-slate-700",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium opacity-80">{label}</p>
        {Icon && <Icon className="h-4 w-4 opacity-60" />}
      </div>
      <p className="mt-3 text-3xl font-black text-white">{value ?? "—"}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats()
      .then((r) => setStats(r.data))
      .catch(() => toast.error("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="mt-1 text-sm text-slate-400">
          Live snapshot of Turfly activity.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-800" />
          ))}
        </div>
      ) : (
        <>
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Venue Owners
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Owners" value={stats?.owners.total} icon={Building2} />
              <StatCard label="Pending Review" value={stats?.owners.pending} color="amber" icon={Clock} />
              <StatCard label="Active" value={stats?.owners.active} color="emerald" icon={CheckCircle2} />
              <StatCard label="Suspended" value={stats?.owners.suspended} color="red" icon={AlertCircle} />
            </div>
          </section>

          <section className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Platform Activity
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Players" value={stats?.players.total} icon={Users} />
              <StatCard label="Active Turfs" value={stats?.turfs.active} color="emerald" icon={Building2} />
              <StatCard label="Confirmed Bookings" value={stats?.bookings.confirmed} color="blue" icon={CheckCircle2} />
              <StatCard label="Cancelled Bookings" value={stats?.bookings.cancelled} color="red" icon={AlertCircle} />
              <StatCard label="Pending Reports" value={stats?.reports?.pending ?? 0} color={stats?.reports?.pending > 0 ? "red" : "slate"} icon={Flag} />
            </div>
          </section>

          {stats?.reports?.pending > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <Flag className="h-5 w-5 text-red-400" />
                <p className="text-sm font-semibold text-red-300">
                  {stats.reports.pending} pending turf report{stats.reports.pending === 1 ? "" : "s"}
                </p>
              </div>
              <Link
                to="/admin/reports"
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-400"
              >
                Review Reports
              </Link>
            </div>
          )}

          {stats?.owners.pending > 0 && (
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-400" />
                <p className="text-sm font-semibold text-amber-300">
                  {stats.owners.pending} owner{stats.owners.pending === 1 ? "" : "s"} waiting for approval
                </p>
              </div>
              <Link
                to="/admin/owners?status=PENDING_REVIEW"
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-400"
              >
                Review Now
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
