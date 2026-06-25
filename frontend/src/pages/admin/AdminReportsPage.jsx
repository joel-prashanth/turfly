import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, CheckCircle, ExternalLink } from "lucide-react";
import { listReports, dismissReport } from "../../api/reportApi";
import toast from "react-hot-toast";

const STATUS_LABELS = {
  PENDING: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  DISMISSED: { label: "Dismissed", cls: "bg-gray-100 text-gray-500" },
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dismissingId, setDismissingId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await listReports({ status: statusFilter, page, limit: 20 });
      setReports(data.reports);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [statusFilter, page]);

  const handleDismiss = async (id) => {
    setDismissingId(id);
    try {
      await dismissReport(id);
      toast.success("Report dismissed.");
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dismiss.");
    } finally {
      setDismissingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turf Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Player-submitted reports about fake or misleading listings</p>
        </div>
        <div className="flex gap-2">
          {["PENDING", "DISMISSED", "ALL"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "ALL" ? "All" : s === "PENDING" ? "Pending" : "Dismissed"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Flag size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const s = STATUS_LABELS[r.status] || STATUS_LABELS.DISMISSED;
            return (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {r.turf?.imageUrl && (
                        <img src={r.turf.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.turf?.name}</p>
                        <p className="text-xs text-gray-500">{r.turf?.location}</p>
                      </div>
                      <Link
                        to={`/admin/owners/${r.turf?.owner?.id}`}
                        className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        View owner <ExternalLink size={11} />
                      </Link>
                    </div>

                    <p className="text-sm text-gray-800 font-medium">{r.reason}</p>
                    {r.description && (
                      <p className="text-sm text-gray-500 mt-0.5">"{r.description}"</p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      Reported by <span className="text-gray-600">{r.reporter?.name}</span> ({r.reporter?.email})
                    </p>
                    {r.turf?.owner && (
                      <p className="text-xs text-gray-400">
                        Owner: <span className="text-gray-600">{r.turf.owner.name}</span> — status{" "}
                        <span className={r.turf.owner.ownerStatus === "ACTIVE" ? "text-green-600" : "text-amber-600"}>
                          {r.turf.owner.ownerStatus}
                        </span>
                      </p>
                    )}
                  </div>

                  {r.status === "PENDING" && (
                    <button
                      onClick={() => handleDismiss(r.id)}
                      disabled={dismissingId === r.id}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <CheckCircle size={13} />
                      {dismissingId === r.id ? "…" : "Dismiss"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-500">
            {page} / {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
