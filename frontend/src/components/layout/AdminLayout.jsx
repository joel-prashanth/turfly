import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../api/authApi";

const navItems = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/owners", label: "Owners", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: Flag },
];

export default function AdminLayout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/login");
    } catch {
      toast.error("Logout failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`relative flex shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 transition hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Logo */}
        <div
          className={`flex items-center gap-2.5 border-b border-slate-800 px-4 py-5 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-white">Turfly Admin</p>
              <p className="text-xs text-slate-400">Control Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-3">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">Admin</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? "Sign out" : undefined}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
