import { useMemo, useState } from "react";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getInitials(name = "") {
  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 0) return "U";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function DashboardHeader({
  title = "Dashboard",
  description = "Here's what's happening with your turf business today.",
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);

  const initials = useMemo(() => {
    return getInitials(user?.name);
  }, [user?.name]);

  const handleProfileClick = () => {
    setOpen(false);
    navigate("/profile");
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await logout();

      toast.success("Logged out successfully.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed.");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-6 px-8 py-6">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            {greeting}, {user?.name || "Owner"} 👋
          </h1>

          <p className="mt-2 text-base text-slate-500">{description}</p>
        </div>

        <div className="relative flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
            title="Notifications coming soon"
          >
            <Bell className="h-5 w-5" />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" />
          </button>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-green-200 hover:bg-green-50"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-green-100 text-sm font-bold text-green-700">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {user?.role || "OWNER"}
              </p>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-16 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <button
                type="button"
                onClick={handleProfileClick}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <User className="h-4 w-4 text-slate-500" />
                Profile
              </button>

              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400"
              >
                <Settings className="h-4 w-4" />
                Settings
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                  Soon
                </span>
              </button>

              <div className="my-2 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {logoutLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
