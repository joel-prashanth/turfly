import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Ban,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { getOwnerCalendar } from "../../../api/slotApi";

const formatDateForApi = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date) => {
  const newDate = new Date(date);
  const day = newDate.getDay();

  // Monday-first week
  const diff = day === 0 ? -6 : 1 - day;

  newDate.setDate(newDate.getDate() + diff);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
};

const getWeekDays = (selectedDate) => {
  const startOfWeek = getStartOfWeek(selectedDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return date;
  });
};

const formatDayLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "short",
  });

const formatDateLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const getCounts = (schedule = []) => {
  const counts = {
    total: 0,
    available: 0,
    booked: 0,
    blocked: 0,
    turfs: schedule.length,
  };

  schedule.forEach((turf) => {
    turf.slots.forEach((slot) => {
      counts.total += 1;

      if (slot.status === "AVAILABLE") counts.available += 1;
      if (slot.status === "BOOKED") counts.booked += 1;
      if (slot.status === "BLOCKED") counts.blocked += 1;
    });
  });

  return counts;
};

function CalendarWeekBoard({
  selectedDate,
  onSelectDay,
  selectedTurfId = "ALL",
  selectedStatus = "ALL",
}) {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const weekRangeLabel = useMemo(() => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];

    return `${formatDateLabel(firstDay)} - ${formatDateLabel(lastDay)}`;
  }, [weekDays]);

  useEffect(() => {
    const fetchWeekSchedule = async () => {
      try {
        setLoading(true);

        const results = await Promise.all(
          weekDays.map(async (date) => {
            const dateString = formatDateForApi(date);
            const response = await getOwnerCalendar(dateString);

            const schedule = response.data.schedule || [];

            const filteredSchedule = schedule
              .filter(
                (turf) =>
                  selectedTurfId === "ALL" || turf.id === selectedTurfId,
              )
              .map((turf) => ({
                ...turf,
                slots: turf.slots.filter(
                  (slot) =>
                    selectedStatus === "ALL" || slot.status === selectedStatus,
                ),
              }))
              .filter((turf) => turf.slots.length > 0);

            return {
              date,
              dateString,
              schedule: filteredSchedule,
              counts: getCounts(filteredSchedule),
            };
          }),
        );

        setWeekData(results);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load week schedule.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWeekSchedule();
  }, [weekDays, selectedTurfId, selectedStatus]);

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm font-medium">Loading week view...</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Week View
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {weekRangeLabel}
          </h2>
        </div>

        <p className="text-sm text-slate-500">
          Click any day to manage slots in Day View.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {weekData.map((day) => {
          const today = isSameDay(day.date, new Date());
          const selected = isSameDay(day.date, selectedDate);
          const hasSlots = day.counts.total > 0;

          return (
            <button
              key={day.dateString}
              type="button"
              onClick={() => onSelectDay?.(day.date)}
              className={`group rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                selected
                  ? "border-green-300 bg-green-50"
                  : "border-slate-200 bg-white hover:border-green-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={`text-sm font-bold uppercase tracking-wide ${
                      selected ? "text-green-700" : "text-slate-400"
                    }`}
                  >
                    {formatDayLabel(day.date)}
                  </p>

                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    {formatDateLabel(day.date)}
                  </h3>
                </div>

                {today && (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    Today
                  </span>
                )}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <CalendarDays className="h-4 w-4" />
                    Total
                  </span>

                  <span className="text-lg font-black text-slate-950">
                    {day.counts.total}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Available
                    </span>
                    <span className="font-bold text-emerald-700">
                      {day.counts.available}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-blue-700">
                      <CalendarCheck className="h-4 w-4" />
                      Booked
                    </span>
                    <span className="font-bold text-blue-700">
                      {day.counts.booked}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-red-700">
                      <Ban className="h-4 w-4" />
                      Blocked
                    </span>
                    <span className="font-bold text-red-700">
                      {day.counts.blocked}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {day.counts.turfs} turf{day.counts.turfs !== 1 ? "s" : ""}
                </p>

                <span
                  className={`text-xs font-bold ${
                    hasSlots ? "text-green-700" : "text-slate-400"
                  }`}
                >
                  {hasSlots ? "Manage day" : "No slots"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarWeekBoard;
