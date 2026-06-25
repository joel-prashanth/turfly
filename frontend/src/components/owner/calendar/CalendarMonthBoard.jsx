import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { getOwnerCalendar } from "../../../api/slotApi";

const pad = (n) => String(n).padStart(2, "0");
const toApiDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = (firstDay.getDay() + 6) % 7; // Monday-first

  const total = Math.ceil((startPad + daysInMonth) / 7) * 7;
  return Array.from({ length: total }, (_, i) => new Date(year, month, 1 - startPad + i));
}

function CalendarMonthBoard({ selectedDate, onSelectDay, selectedTurfId, selectedStatus }) {
  const [viewMonth, setViewMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const [dayData, setDayData] = useState({});
  const [loading, setLoading] = useState(true);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const grid = useMemo(() => buildGrid(year, month), [year, month]);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = viewMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    let cancelled = false;

    const fetchMonth = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month, i + 1);
            const key = toApiDate(date);
            return getOwnerCalendar(key).then((res) => {
              if (cancelled) return null;
              const schedule = (res.data.schedule || [])
                .filter((t) => selectedTurfId === "ALL" || t.id === selectedTurfId)
                .map((t) => ({
                  ...t,
                  slots: t.slots.filter(
                    (s) => selectedStatus === "ALL" || s.status === selectedStatus,
                  ),
                }))
                .filter((t) => t.slots.length > 0);

              let available = 0, booked = 0, blocked = 0;
              schedule.forEach((t) =>
                t.slots.forEach((s) => {
                  if (s.status === "AVAILABLE") available++;
                  else if (s.status === "BOOKED") booked++;
                  else if (s.status === "BLOCKED") blocked++;
                }),
              );
              return [key, { available, booked, blocked }];
            });
          }),
        );

        if (!cancelled) {
          setDayData(Object.fromEntries(results.filter(Boolean)));
        }
      } catch {
        if (!cancelled) toast.error("Failed to load month data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMonth();
    return () => { cancelled = true; };
  }, [year, month, daysInMonth, selectedTurfId, selectedStatus]);

  const today = new Date();

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      {/* Month navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-slate-900">{monthLabel}</h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>

        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-xs font-bold uppercase tracking-wide text-slate-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {grid.map((date, i) => {
          const inMonth = date.getMonth() === month;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const key = toApiDate(date);
          const counts = dayData[key] || { available: 0, booked: 0, blocked: 0 };
          const total = counts.available + counts.booked + counts.blocked;
          const isLastRow = i >= grid.length - 7;

          return (
            <button
              key={i}
              type="button"
              onClick={() => inMonth && onSelectDay(date)}
              disabled={!inMonth}
              className={`
                relative min-h-[90px] p-2 text-left transition
                border-b border-r border-slate-100
                ${isLastRow ? "border-b-0" : ""}
                ${(i + 1) % 7 === 0 ? "border-r-0" : ""}
                ${!inMonth ? "cursor-default bg-slate-50/60" : "cursor-pointer hover:bg-slate-50"}
                ${isSelected && inMonth ? "bg-green-50" : ""}
              `}
            >
              {/* Day number */}
              <span
                className={`
                  inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold
                  ${isToday ? "bg-green-600 text-white" : ""}
                  ${isSelected && inMonth && !isToday ? "bg-green-100 text-green-800" : ""}
                  ${!isToday && !isSelected && inMonth ? "text-slate-900" : ""}
                  ${!inMonth ? "text-slate-300" : ""}
                `}
              >
                {date.getDate()}
              </span>

              {/* Slot indicators */}
              {inMonth && total > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {counts.booked > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      <span className="truncate text-xs font-semibold text-blue-600">
                        {counts.booked} booked
                      </span>
                    </div>
                  )}
                  {counts.available > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span className="truncate text-xs font-semibold text-emerald-600">
                        {counts.available} open
                      </span>
                    </div>
                  )}
                  {counts.blocked > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span className="truncate text-xs font-semibold text-slate-400">
                        {counts.blocked} blocked
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 border-t border-slate-100 px-5 py-3">
        <span className="text-xs font-medium text-slate-400">Click any day to manage slots</span>
        <div className="ml-auto flex items-center gap-3">
          {[
            { color: "bg-blue-500", label: "Booked" },
            { color: "bg-emerald-500", label: "Open" },
            { color: "bg-slate-400", label: "Blocked" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${color}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarMonthBoard;
