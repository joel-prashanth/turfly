import { useState } from "react";
import {
  Ban,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Circle,
} from "lucide-react";

import Button from "../../ui/Button";

const formatSidebarDate = (date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const getSlotCounts = (schedule) => {
  const counts = { AVAILABLE: 0, BOOKED: 0, BLOCKED: 0 };
  schedule.forEach((turf) =>
    turf.slots.forEach((slot) => {
      if (counts[slot.status] !== undefined) counts[slot.status]++;
    }),
  );
  return counts;
};

const statusFilters = [
  { label: "All", value: "ALL", icon: Circle, activeClassName: "border-slate-900 bg-slate-900 text-white" },
  { label: "Available", value: "AVAILABLE", icon: CheckCircle2, activeClassName: "border-emerald-600 bg-emerald-600 text-white" },
  { label: "Booked", value: "BOOKED", icon: CalendarCheck, activeClassName: "border-blue-600 bg-blue-600 text-white" },
  { label: "Blocked", value: "BLOCKED", icon: Ban, activeClassName: "border-red-600 bg-red-600 text-white" },
];

function CalendarSidebar({
  viewMode = "MONTH",
  selectedDate,
  schedule = [],
  selectedTurfId = "ALL",
  selectedStatus = "ALL",
  onSelectTurf,
  onSelectStatus,
  onToday,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const counts = getSlotCounts(schedule);
  const isDayView = viewMode === "DAY";
  const hasActiveFilters = selectedTurfId !== "ALL" || selectedStatus !== "ALL";

  return (
    <div className="h-full w-full p-4 sm:p-6 xl:w-80">
      <div className="space-y-4">

        {/* Selected day panel — day view only */}
        {isDayView && (
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Selected Day</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {formatSidebarDate(selectedDate)}
            </h2>
            <Button
              variant="secondary"
              onClick={onToday}
              className="mt-4 w-full justify-center"
            >
              Jump to Today
            </Button>
          </section>
        )}

        {/* Collapsible filters */}
        <section className="rounded-3xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-3xl px-5 py-4 text-left transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Filters
              </span>
              {hasActiveFilters && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTurf?.("ALL");
                    onSelectStatus?.("ALL");
                  }}
                  className="text-xs font-semibold text-green-700 transition hover:text-green-800"
                >
                  Clear
                </button>
              )}
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {filtersOpen && (
            <div className="border-t border-slate-100 px-5 pb-5 pt-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                Status
              </p>
              <div className="grid grid-cols-2 gap-2">
                {statusFilters.map(({ label, value, icon: Icon, activeClassName }) => {
                  const isActive = selectedStatus === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onSelectStatus?.(value)}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                        isActive ? activeClassName : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Day summary — day view only */}
        {isDayView && (
          <section className="space-y-2">
            <h3 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-500">
              Day Summary
            </h3>
            {[
              { status: "AVAILABLE", label: "Available", active: "bg-emerald-600 text-white", idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100", icon: CheckCircle2 },
              { status: "BOOKED", label: "Booked", active: "bg-blue-600 text-white", idle: "bg-blue-50 text-blue-700 hover:bg-blue-100", icon: CalendarCheck },
              { status: "BLOCKED", label: "Blocked", active: "bg-red-600 text-white", idle: "bg-red-50 text-red-700 hover:bg-red-100", icon: Ban },
            ].map(({ status, label, active, idle, icon: Icon }) => (
              <button
                key={status}
                type="button"
                onClick={() => onSelectStatus?.(status)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition ${
                  selectedStatus === status ? active : idle
                }`}
              >
                <span className="flex items-center gap-3 font-semibold">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <span className="font-bold">{counts[status]}</span>
              </button>
            ))}
          </section>
        )}

        {/* Turfs list — day view only (data comes from day schedule) */}
        {isDayView && schedule.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Turfs
              </h3>
              <button
                type="button"
                onClick={() => onSelectTurf?.("ALL")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  selectedTurfId === "ALL"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                All
              </button>
            </div>

            <div className="space-y-2">
              {schedule.map((turf) => {
                const isActive = selectedTurfId === turf.id;
                return (
                  <button
                    key={turf.id}
                    type="button"
                    onClick={() => onSelectTurf?.(turf.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-green-300 bg-green-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-green-200 hover:bg-green-50/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`truncate font-semibold ${isActive ? "text-green-800" : "text-slate-900"}`}>
                        {turf.name}
                      </p>
                      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {turf.sport}
                      </p>
                    </div>
                    <span className={`ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isActive ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {turf.slots.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

export default CalendarSidebar;
