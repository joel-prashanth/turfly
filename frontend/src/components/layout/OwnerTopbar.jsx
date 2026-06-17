import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";

function OwnerTopbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "O";

  const greeting = (() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to logout.");
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">
            {greeting}, {user?.name || "Owner"} 👋
          </p>

          <h1 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
            Manage your turf business
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative hidden rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition hover:bg-slate-50 sm:block"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
        </button>

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "Owner"}
                className="h-10 w-10 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-sm font-bold text-green-700">
                {initials}
              </div>
            )}

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-bold text-slate-900">
                {user?.name || "Owner"}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {user?.role || "OWNER"}
              </p>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-14 z-40 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/owner/profile");
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-slate-500" />
                Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  toast("Settings coming soon.");
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                Settings Soon
              </button>

              <div className="my-2 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default OwnerTopbar;
