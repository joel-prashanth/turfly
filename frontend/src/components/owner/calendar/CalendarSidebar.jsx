import {
  Ban,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";

import Button from "../../ui/Button";

const formatSidebarDate = (date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const getSlotCounts = (schedule) => {
  const counts = {
    AVAILABLE: 0,
    BOOKED: 0,
    BLOCKED: 0,
    TOTAL: 0,
  };

  schedule.forEach((turf) => {
    turf.slots.forEach((slot) => {
      counts.TOTAL += 1;

      if (counts[slot.status] !== undefined) {
        counts[slot.status] += 1;
      }
    });
  });

  return counts;
};

const statusFilters = [
  {
    label: "All",
    value: "ALL",
    icon: Circle,
    activeClassName: "border-slate-900 bg-slate-900 text-white",
  },
  {
    label: "Available",
    value: "AVAILABLE",
    icon: CheckCircle2,
    activeClassName: "border-emerald-600 bg-emerald-600 text-white",
  },
  {
    label: "Booked",
    value: "BOOKED",
    icon: CalendarCheck,
    activeClassName: "border-blue-600 bg-blue-600 text-white",
  },
  {
    label: "Blocked",
    value: "BLOCKED",
    icon: Ban,
    activeClassName: "border-red-600 bg-red-600 text-white",
  },
];

function CalendarSidebar({
  selectedDate,
  schedule = [],
  selectedTurfId = "ALL",
  selectedStatus = "ALL",
  onSelectTurf,
  onSelectStatus,
  onAddSlot,
  onToday,
}) {
  const counts = getSlotCounts(schedule);

  const selectedTurf =
    selectedTurfId === "ALL"
      ? null
      : schedule.find((turf) => turf.id === selectedTurfId);

  const hasActiveFilters = selectedTurfId !== "ALL" || selectedStatus !== "ALL";

  return (
    <div className="h-full w-full p-4 sm:p-6 xl:w-80">
      <div className="space-y-6">
        <Button onClick={onAddSlot} className="w-full justify-center">
          <Plus className="h-4 w-4" />
          Add Slot
        </Button>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Selected Day</p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {formatSidebarDate(selectedDate)}
          </h2>

          <Button
            variant="secondary"
            onClick={onToday}
            className="mt-6 w-full justify-center"
          >
            Jump to Today
          </Button>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Filters
            </h3>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  onSelectTurf?.("ALL");
                  onSelectStatus?.("ALL");
                }}
                className="text-xs font-semibold text-green-700 transition hover:text-green-800"
              >
                Clear
              </button>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
              Status
            </p>

            <div className="grid grid-cols-2 gap-2">
              {statusFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = selectedStatus === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => onSelectStatus?.(filter.value)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? filter.activeClassName
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Showing
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {selectedTurfId === "ALL"
                  ? "All turfs"
                  : selectedTurf?.name || "Selected turf"}{" "}
                ·{" "}
                {selectedStatus === "ALL"
                  ? "All statuses"
                  : selectedStatus.toLowerCase()}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Day Summary
          </h3>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onSelectStatus?.("AVAILABLE")}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition ${
                selectedStatus === "AVAILABLE"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                Available
              </span>
              <span className="font-bold">{counts.AVAILABLE}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectStatus?.("BOOKED")}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition ${
                selectedStatus === "BOOKED"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <CalendarCheck className="h-5 w-5" />
                Booked
              </span>
              <span className="font-bold">{counts.BOOKED}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectStatus?.("BLOCKED")}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition ${
                selectedStatus === "BLOCKED"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <Ban className="h-5 w-5" />
                Blocked
              </span>
              <span className="font-bold">{counts.BLOCKED}</span>
            </button>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
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

          {schedule.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                <CalendarDays className="h-5 w-5 text-slate-400" />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No turfs scheduled
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Add slots for this day to see turfs here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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
                      <p
                        className={`truncate font-semibold ${
                          isActive ? "text-green-800" : "text-slate-900"
                        }`}
                      >
                        {turf.name}
                      </p>

                      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {turf.sport}
                      </p>
                    </div>

                    <span
                      className={`ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isActive
                          ? "bg-green-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {turf.slots.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CalendarSidebar;
