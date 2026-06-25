import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Star,
  UsersRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";

const navItems = [
  {
    label: "Dashboard",
    to: "/owner/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Calendar",
    to: "/owner/calendar",
    icon: CalendarDays,
  },
  {
    label: "My Turfs",
    to: "/owner/turfs",
    icon: BarChart3,
  },
  {
    label: "Bookings",
    to: "/owner/bookings",
    icon: UsersRound,
  },
  {
    label: "Payments",
    to: "#",
    icon: CreditCard,
    disabled: true,
  },
  {
    label: "Reviews",
    to: "#",
    icon: Star,
    disabled: true,
  },
  {
    label: "Settings",
    to: "/owner/settings",
    icon: Settings,
  },
];

function OwnerSidebar({ onNavigate }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isExpanded = !collapsed || hovered;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "O";

  const handleDisabledClick = (label) => {
    toast(`${label} coming soon.`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate?.();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to logout.");
    }
  };

  const sidebarWidth = isExpanded ? "lg:w-64" : "lg:w-20";

  return (
    <aside
      onMouseEnter={() => {
        if (collapsed) {
          setHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (collapsed) {
          setHovered(false);
        }
      }}
      className={`relative flex h-full w-72 max-w-[85vw] shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:max-w-none ${sidebarWidth}`}
    >
      {/* Header */}
      <div
        className={`relative flex h-16 shrink-0 items-center border-b border-slate-200 transition-all duration-300 ${
          isExpanded ? "justify-between px-4" : "justify-center px-0"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            navigate("/owner/dashboard");
            onNavigate?.();
          }}
          className={`flex min-w-0 items-center transition-all duration-300 ${
            isExpanded ? "gap-3" : "justify-center"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-lg font-black text-white shadow-sm">
            T
          </div>

          {isExpanded && (
            <div className="min-w-0 text-left">
              <p className="truncate text-lg font-black tracking-tight text-slate-950">
                Turfly
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                Owner OS
              </p>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setCollapsed((prev) => !prev);
            setHovered(false);
          }}
          className="
            hidden
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            p-1.5
            text-slate-500
            shadow-sm
            transition
            hover:bg-slate-50
            hover:text-slate-900
            lg:absolute
            lg:-right-3
            lg:top-1/2
            lg:z-20
            lg:flex
            lg:-translate-y-1/2
          "
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleDisabledClick(item.label)}
                title={!isExpanded ? item.label : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-slate-50 ${
                  isExpanded ? "" : "lg:justify-center lg:px-0"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />

                {isExpanded && (
                  <span className="flex flex-1 items-center justify-between">
                    <span>{item.label}</span>

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Soon
                    </span>
                  </span>
                )}
              </button>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              title={!isExpanded ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                  isExpanded ? "" : "lg:justify-center lg:px-0"
                } ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />

              {isExpanded && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile + Logout */}
      <div className="shrink-0 border-t border-slate-200 p-3">
        <NavLink
          to="/owner/profile"
          onClick={onNavigate}
          title={!isExpanded ? "Profile" : undefined}
          className={({ isActive }) =>
            `mb-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
              isExpanded ? "" : "lg:justify-center lg:px-0"
            } ${
              isActive
                ? "bg-green-50 text-green-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`
          }
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || "Owner"}
              className="h-9 w-9 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-sm font-bold text-green-700">
              {initials}
            </div>
          )}

          {isExpanded && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {user?.name || "Owner"}
              </p>
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">
                Profile
              </p>
            </div>
          )}
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          title={!isExpanded ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 ${
            isExpanded ? "" : "lg:justify-center lg:px-0"
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />

          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default OwnerSidebar;

