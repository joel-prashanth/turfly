import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FileText,
  IndianRupee,
  Info,
  TrendingUp,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import { getOwnerBookings } from "../api/bookingApi";
import { getRevenueAnalytics } from "../api/analytics";
import { getOwnerDashboardStats } from "../api/dashboard";
import { exportBookingsCSV } from "../utils/exportCSV";
import { useAuth } from "../hooks/useAuth";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import GSTInvoiceModal from "../components/owner/GSTInvoiceModal";

const fmtINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const STATUS_STYLE = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
};

function StatCard({ icon: Icon, label, value, sub, accent = "slate", trend }) {
  const colors = {
    green:  { bg: "bg-green-50",  text: "text-green-700",  icon: "bg-green-100 text-green-600"  },
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   icon: "bg-blue-100 text-blue-600"    },
    amber:  { bg: "bg-amber-50",  text: "text-amber-700",  icon: "bg-amber-100 text-amber-600"  },
    slate:  { bg: "bg-slate-50",  text: "text-slate-700",  icon: "bg-slate-100 text-slate-600"  },
  }[accent];

  return (
    <Card className={`p-5 ${colors.bg} border-transparent`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-semibold ${colors.text}`}>{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">₹{fmtINR(value)}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`rounded-2xl p-3 ${colors.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </Card>
  );
}

function MiniChart({ data }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex h-16 items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="group relative flex flex-1 flex-col items-center">
          <div
            className="w-full rounded-t bg-green-500 opacity-80 transition-all group-hover:opacity-100"
            style={{ height: `${Math.max((d.amount / max) * 100, 4)}%` }}
          />
          <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-slate-800 px-2 py-1 text-[10px] text-white group-hover:block whitespace-nowrap">
            {d.date}: ₹{fmtINR(d.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OwnerPaymentsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [invoiceBooking, setInvoiceBooking] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, aRes, sRes] = await Promise.all([
        getOwnerBookings({ limit: 50, status: "ALL" }),
        getRevenueAnalytics(period),
        getOwnerDashboardStats(),
      ]);
      setBookings(bRes.data?.bookings || bRes.bookings || []);
      setAnalytics(aRes.revenue || []);
      setStats(sRes);
    } catch {
      toast.error("Failed to load payments data.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const { totalRevenue, thisMonth, thisWeek, pendingCount } = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);

    const confirmed = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED");
    const total = confirmed.reduce((s, b) => s + Number(b.amount || 0), 0);
    const month = confirmed
      .filter((b) => new Date(b.slot.startTime) >= monthStart)
      .reduce((s, b) => s + Number(b.amount || 0), 0);
    const week = confirmed
      .filter((b) => new Date(b.slot.startTime) >= weekStart)
      .reduce((s, b) => s + Number(b.amount || 0), 0);
    const pending = bookings.filter((b) => b.status === "PENDING").length;

    return { totalRevenue: total, thisMonth: month, thisWeek: week, pendingCount: pending };
  }, [bookings]);

  const commission = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const ownerJoinedAt = user?.createdAt ? new Date(user.createdAt) : now;
    const daysSinceJoined = (now - ownerJoinedAt) / (1000 * 60 * 60 * 24);
    const inFreePeriod = daysSinceJoined < 90;

    const active = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED");
    const platform = active.filter((b) => b.source === "PLATFORM");
    const manual   = active.filter((b) => b.source === "OWNER_MANUAL");

    const platformRevenue = platform.reduce((s, b) => s + Number(b.amount || 0), 0);
    const manualRevenue   = manual.reduce((s, b) => s + Number(b.amount || 0), 0);

    // This month's platform booking count determines the rate tier
    const monthlyPlatformCount = platform.filter(
      (b) => new Date(b.createdAt) >= monthStart
    ).length;

    let rate = 0;
    if (!inFreePeriod) {
      if (monthlyPlatformCount <= 50)       rate = 0.04;
      else if (monthlyPlatformCount <= 150)  rate = 0.03;
      else                                   rate = 0.02;
    }

    const commissionOwed = platform
      .filter((b) => new Date(b.createdAt) >= monthStart)
      .reduce((s, b) => s + Number(b.amount || 0) * rate, 0);

    return {
      inFreePeriod,
      daysSinceJoined: Math.floor(daysSinceJoined),
      rate,
      rateLabel: inFreePeriod ? "0% (free period)" : `${(rate * 100).toFixed(0)}%`,
      platformRevenue,
      manualRevenue,
      platformCount: platform.length,
      manualCount: manual.length,
      monthlyPlatformCount,
      commissionOwed,
    };
  }, [bookings, user]);

  const chartData = analytics.slice(-period);

  const revenueBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "COMPLETED" || b.status === "CANCELLED"
  );

  return (
    <Container className="py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Payments"
          subtitle="Track revenue, bookings, and transaction history."
        />
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                period === d
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-green-300"
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={() => {
              if (revenueBookings.length === 0) { toast("No transactions to export."); return; }
              exportBookingsCSV(revenueBookings, `turfly-payments-${new Date().toISOString().slice(0,10)}.csv`);
              toast.success("CSV downloaded.");
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-green-300 hover:text-green-700"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} label="Total Revenue" value={totalRevenue} sub="All time (confirmed)" accent="green" />
        <StatCard icon={TrendingUp}  label="This Month"    value={thisMonth}    sub={new Date().toLocaleString("en-IN", { month: "long" })} accent="blue" />
        <StatCard icon={Wallet}      label="This Week"     value={thisWeek}     sub="Last 7 days" accent="amber" />
        <Card className="p-5 bg-slate-50 border-transparent">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">Avg per Booking</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                ₹{revenueBookings.length > 0 ? fmtINR(totalRevenue / revenueBookings.length) : "0"}
              </p>
              <p className="mt-1 text-xs text-slate-500">{revenueBookings.length} transactions</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue chart */}
      {chartData.length > 0 && (
        <Card className="mt-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Trend</h3>
              <p className="text-xs text-slate-400">Last {period} days</p>
            </div>
            <p className="text-lg font-black text-slate-900">
              ₹{fmtINR(chartData.reduce((s, d) => s + d.amount, 0))}
            </p>
          </div>
          <MiniChart data={chartData} />
          <div className="mt-2 flex justify-between text-[11px] text-slate-400">
            <span>{chartData[0]?.date}</span>
            <span>{chartData[chartData.length - 1]?.date}</span>
          </div>
        </Card>
      )}

      {/* Commission breakdown */}
      <Card className="mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Commission Summary</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Commission applies only to platform-originated bookings
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
            commission.inFreePeriod
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-blue-200 bg-blue-50 text-blue-700"
          }`}>
            {commission.inFreePeriod
              ? `Free period · ${90 - commission.daysSinceJoined}d left`
              : `${commission.rateLabel} this month`}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Platform bookings */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Platform bookings</p>
            <p className="mt-2 text-2xl font-black text-slate-900">₹{fmtINR(commission.platformRevenue)}</p>
            <p className="mt-1 text-xs text-slate-500">{commission.platformCount} bookings · commissionable</p>
          </div>

          {/* Manual / walk-in */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Walk-in / manual</p>
            <p className="mt-2 text-2xl font-black text-slate-900">₹{fmtINR(commission.manualRevenue)}</p>
            <p className="mt-1 text-xs text-slate-500">{commission.manualCount} bookings · not commissionable</p>
          </div>

          {/* Commission owed */}
          <div className={`rounded-2xl border p-4 ${
            commission.inFreePeriod
              ? "border-emerald-100 bg-emerald-50"
              : "border-amber-100 bg-amber-50"
          }`}>
            <p className={`text-xs font-semibold uppercase tracking-widest ${
              commission.inFreePeriod ? "text-emerald-400" : "text-amber-400"
            }`}>Commission this month</p>
            <p className="mt-2 text-2xl font-black text-slate-900">₹{fmtINR(commission.commissionOwed)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {commission.inFreePeriod
                ? "₹0 — you're in the free period"
                : `${commission.monthlyPlatformCount} platform bookings → ${commission.rateLabel} rate`}
            </p>
          </div>
        </div>

        {/* Tier guide */}
        {!commission.inFreePeriod && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>
              Rate tiers: <strong>0–50 bookings/mo → 4%</strong> · <strong>51–150 → 3%</strong> · <strong>150+ → 2%</strong>.
              Your rate drops as volume grows.
            </span>
          </div>
        )}
      </Card>

      {/* Transaction list */}
      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-900">Transactions</h3>
          <p className="mt-0.5 text-xs text-slate-400">{revenueBookings.length} bookings</p>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-3.5">
                <div className="h-8 w-8 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-slate-100" />
                  <div className="h-3 w-24 rounded bg-slate-50" />
                </div>
                <div className="h-3.5 w-16 rounded bg-slate-100" />
                <div className="h-6 w-20 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : revenueBookings.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No transactions yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {revenueBookings.map((b) => {
              const name = b.player?.name || b.walkInName || "Walk-in";
              const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
              const style = STATUS_STYLE[b.status] || STATUS_STYLE.PENDING;

              return (
                <div key={b.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {b.slot?.turf?.name} · {fmtDate(b.slot?.startTime)} {fmtTime(b.slot?.startTime)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-800">
                    {b.status === "CANCELLED" ? (
                      <span className="text-red-400 line-through">₹{fmtINR(b.amount)}</span>
                    ) : (
                      <>₹{fmtINR(b.amount)}</>
                    )}
                  </p>
                  <span className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold sm:inline-flex ${style}`}>
                    {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                  </span>
                  <span className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold xl:inline-flex ${
                    b.source === "OWNER_MANUAL"
                      ? "border-slate-200 bg-slate-50 text-slate-500"
                      : "border-blue-200 bg-blue-50 text-blue-600"
                  }`}>
                    {b.source === "OWNER_MANUAL" ? "Manual" : "Platform"}
                  </span>
                  {b.status !== "CANCELLED" && (
                    <button
                      onClick={() => setInvoiceBooking(b)}
                      className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:border-green-300 hover:text-green-600"
                      title="GST Invoice"
                    >
                      <FileText size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <GSTInvoiceModal
        open={!!invoiceBooking}
        booking={invoiceBooking}
        ownerProfile={user}
        onClose={() => setInvoiceBooking(null)}
      />
    </Container>
  );
}
