import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { getOwnerCalendar } from "../../../api/slotApi";

const pad = (n) => String(n).padStart(2, "0");
const toApiDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const SLOT_COLORS = {
  BOOKED: { bar: "bg-blue-500", pill: "bg-blue-100 text-blue-700 border-blue-200" },
  AVAILABLE: { bar: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  BLOCKED: { bar: "bg-slate-300", pill: "bg-slate-100 text-slate-500 border-slate-200" },
};

function WeekDayColumn({ day, isToday, isSelected, onSelectDay }) {
  const { date, slots, counts } = day;
  const total = counts.booked + counts.available + counts.blocked;
  const bookedRatio = total > 0 ? counts.booked / total : 0;
  const availRatio = total > 0 ? counts.available / total : 0;

  const dayLabel = date.toLocaleDateString("en-IN", { weekday: "short" });
  const dateNum = date.getDate();
  const monthLabel = date.toLocaleDateString("en-IN", { month: "short" });

  return (
    <button
      type="button"
      onClick={() => onSelectDay(date)}
      className={`
        group flex flex-col rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md
        ${isSelected ? "border-green-300 bg-green-50 shadow-sm" : "border-slate-200 bg-white hover:border-green-200"}
      `}
    >
      {/* Day header */}
      <div className="flex items-start justify-between gap-1">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wide ${isSelected ? "text-green-600" : "text-slate-400"}`}>
            {dayLabel}
          </p>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className={`text-2xl font-black leading-none ${isToday ? "text-green-600" : "text-slate-900"}`}>
              {dateNum}
            </span>
            <span className="text-xs font-semibold text-slate-400">{monthLabel}</span>
          </div>
        </div>

        {isToday && (
          <span className="rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            Today
          </span>
        )}
      </div>

      {/* Booking fill bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        {total > 0 && (
          <div className="flex h-full">
            <div className="bg-blue-500 transition-all" style={{ width: `${bookedRatio * 100}%` }} />
            <div className="bg-emerald-400 transition-all" style={{ width: `${availRatio * 100}%` }} />
          </div>
        )}
      </div>

      {/* Counts */}
      {total > 0 ? (
        <div className="mt-2 flex items-center gap-2.5 text-xs">
          {counts.booked > 0 && (
            <span className="flex items-center gap-1 font-semibold text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {counts.booked}
            </span>
          )}
          {counts.available > 0 && (
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {counts.available}
            </span>
          )}
          {counts.blocked > 0 && (
            <span className="flex items-center gap-1 font-semibold text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              {counts.blocked}
            </span>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-300">No slots</p>
      )}

      {/* Slot pills */}
      {slots.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          {slots.slice(0, 4).map((slot) => {
            const colors = SLOT_COLORS[slot.status] || SLOT_COLORS.AVAILABLE;
            return (
              <div
                key={slot.id}
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold ${colors.pill}`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.bar}`} />
                <span className="truncate">
                  {formatTime(slot.startTime)}
                  {slot.status === "BOOKED" && (slot.booking?.player?.name || slot.booking?.walkInName)
                    ? ` · ${(slot.booking.player?.name || slot.booking.walkInName).split(" ")[0]}`
                    : ""}
                </span>
              </div>
            );
          })}
          {slots.length > 4 && (
            <p className="pl-1 text-xs text-slate-400">+{slots.length - 4} more</p>
          )}
        </div>
      )}
    </button>
  );
}

function CalendarWeekBoard({ selectedDate, onSelectDay, selectedTurfId = "ALL", selectedStatus = "ALL" }) {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(() => {
    const start = getStartOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const weekRangeLabel = useMemo(() => {
    const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${fmt(weekDays[0])} – ${fmt(weekDays[6])}`;
  }, [weekDays]);

  useEffect(() => {
    let cancelled = false;

    const fetchWeek = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          weekDays.map(async (date) => {
            const dateStr = toApiDate(date);
            const res = await getOwnerCalendar(dateStr);
            if (cancelled) return null;

            const schedule = (res.data.schedule || [])
              .filter((t) => selectedTurfId === "ALL" || t.id === selectedTurfId)
              .map((t) => ({
                ...t,
                slots: t.slots.filter((s) => selectedStatus === "ALL" || s.status === selectedStatus),
              }))
              .filter((t) => t.slots.length > 0);

            const slots = schedule
              .flatMap((t) => t.slots.map((s) => ({ ...s, turfName: t.name })))
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            const counts = { booked: 0, available: 0, blocked: 0 };
            slots.forEach((s) => {
              if (s.status === "BOOKED") counts.booked++;
              else if (s.status === "AVAILABLE") counts.available++;
              else if (s.status === "BLOCKED") counts.blocked++;
            });

            return { date, slots, counts };
          }),
        );

        if (!cancelled) setWeekData(results.filter(Boolean));
      } catch {
        if (!cancelled) toast.error("Failed to load week schedule.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWeek();
    return () => { cancelled = true; };
  }, [weekDays, selectedTurfId, selectedStatus]);

  const today = new Date();

  const totalBooked = weekData.reduce((n, d) => n + d.counts.booked, 0);
  const totalAvail = weekData.reduce((n, d) => n + d.counts.available, 0);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Week View</p>
          <h2 className="mt-0.5 text-lg font-bold text-slate-900">{weekRangeLabel}</h2>
        </div>

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <div className="flex items-center gap-3 text-sm">
            {totalBooked > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {totalBooked} booked
              </span>
            )}
            {totalAvail > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {totalAvail} open
              </span>
            )}
          </div>
        )}
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 xl:grid-cols-7">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            ))
          : weekData.map((day) => (
              <WeekDayColumn
                key={toApiDate(day.date)}
                day={day}
                isToday={isSameDay(day.date, today)}
                isSelected={isSameDay(day.date, selectedDate)}
                onSelectDay={onSelectDay}
              />
            ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 border-t border-slate-100 px-5 py-3">
        <span className="text-xs text-slate-400">Click any day to manage slots</span>
        <div className="ml-auto flex items-center gap-3">
          {[
            { color: "bg-blue-500", label: "Booked" },
            { color: "bg-emerald-500", label: "Open" },
            { color: "bg-slate-300", label: "Blocked" },
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

export default CalendarWeekBoard;
