import { NavLink } from "react-router-dom";

function SidebarItem({
  to,
  icon: Icon,
  label,
  collapsed = false,
  disabled = false,
}) {
  const baseClasses = [
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
    collapsed ? "justify-center" : "",
  ].join(" ");

  if (disabled) {
    return (
      <div
        className={`${baseClasses} cursor-not-allowed text-slate-400`}
        title={collapsed ? `${label} coming soon` : undefined}
      >
        <Icon size={18} className="shrink-0" />

        {!collapsed && (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate">{label}</span>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              Soon
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          baseClasses,
          isActive
            ? "bg-green-50 text-green-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")
      }
    >
      <Icon size={18} className="shrink-0" />

      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default SidebarItem;
