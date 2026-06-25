import { useEffect, useRef, useState } from "react";
import { Bell, BookCheck, X } from "lucide-react";
import { getNotifications, markAllRead, markOneRead, clearAll } from "../../api/notificationApi";

const TYPE_ICON = {
  NEW_BOOKING:                 "🎉",
  BOOKING_CONFIRMED:           "✅",
  BOOKING_CANCELLED_BY_PLAYER: "❌",
  BOOKING_CANCELLED_BY_OWNER:  "❌",
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationBell({ light = false }) {
  const [open, setOpen]       = useState(false);
  const [items, setItems]     = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      await markAllRead().catch(() => {});
    }
  };

  const handleMarkOne = async (id) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await markOneRead(id).catch(() => {});
  };

  const handleClearAll = async () => {
    setItems([]);
    setUnread(0);
    await clearAll().catch(() => {});
  };

  return (
    <div ref={ref} className="relative">

      {/* Bell button — adapts to background */}
      <button
        onClick={handleOpen}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition ${
          light
            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }`}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown — always white */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs font-medium text-slate-400 transition hover:text-red-500"
                >
                  Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 transition hover:text-slate-700">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">Loading…</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <BookCheck size={28} className="text-slate-300" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkOne(n.id)}
                  className={[
                    "flex gap-3 border-b border-slate-100 px-4 py-3.5 transition",
                    !n.read ? "cursor-pointer bg-green-50 hover:bg-green-100" : "hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className="mt-0.5 shrink-0 text-base">{TYPE_ICON[n.type] ?? "🔔"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-700">{n.body}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
