import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import Button from "../components/ui/Button";

import CalendarSidebar from "../components/owner/calendar/CalendarSidebar";
import CalendarDayBoard from "../components/owner/calendar/CalendarDayBoard";
import CalendarWeekBoard from "../components/owner/calendar/CalendarWeekBoard";
import CalendarCreateSlotModal from "../components/owner/calendar/CalendarCreateSlotModal";
import CalendarEditSlotModal from "../components/owner/calendar/CalendarEditSlotModal";
import CalendarBookingModal from "../components/owner/calendar/CalendarBookingModal";

import {
  blockSlot,
  deleteSlot,
  getOwnerCalendar,
  unblockSlot,
} from "../api/slotApi";

const formatDateForApi = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatMonthHeading = (date) =>
  date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

const formatSelectedDate = (date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatShortSelectedDate = (date) =>
  date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

function OwnerCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("DAY");

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTurfId, setSelectedTurfId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalSlot, setEditModalSlot] = useState(null);
  const [bookingModalSlot, setBookingModalSlot] = useState(null);

  const selectedDateString = useMemo(
    () => formatDateForApi(selectedDate),
    [selectedDate],
  );

  const today = new Date();
  const viewingToday = isSameDay(selectedDate, today);

  const filteredSchedule = useMemo(() => {
    return schedule
      .filter((turf) => selectedTurfId === "ALL" || turf.id === selectedTurfId)
      .map((turf) => ({
        ...turf,
        slots: turf.slots.filter(
          (slot) => selectedStatus === "ALL" || slot.status === selectedStatus,
        ),
      }))
      .filter((turf) => turf.slots.length > 0);
  }, [schedule, selectedTurfId, selectedStatus]);

  const totalFilteredSlots = useMemo(() => {
    return filteredSchedule.reduce(
      (total, turf) => total + turf.slots.length,
      0,
    );
  }, [filteredSchedule]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);

      const response = await getOwnerCalendar(selectedDateString);

      setSchedule(response.data.schedule || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load calendar schedule.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateString]);

  const goToPreviousDay = () => {
    setSelectedDate((prev) => {
      const date = new Date(prev);
      date.setDate(date.getDate() - 1);
      return date;
    });
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const date = new Date(prev);
      date.setDate(date.getDate() + 1);
      return date;
    });
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleWeekDaySelect = (date) => {
    setSelectedDate(date);
    setViewMode("DAY");
  };

  const handleBlockSlot = async (slot) => {
    try {
      await blockSlot(slot.id);
      toast.success("Slot blocked successfully.");
      fetchCalendar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block slot.");
    }
  };

  const handleUnblockSlot = async (slot) => {
    try {
      await unblockSlot(slot.id);
      toast.success("Slot unblocked successfully.");
      fetchCalendar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock slot.");
    }
  };

  const handleDeleteSlot = async (slot) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this slot?",
    );

    if (!confirmed) return;

    try {
      await deleteSlot(slot.id);
      toast.success("Slot deleted successfully.");
      fetchCalendar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete slot.");
    }
  };

  return (
    <>
      <div className="min-h-full bg-slate-50">
        <div className="grid min-h-full grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-white xl:border-b-0 xl:border-r">
            <CalendarSidebar
              selectedDate={selectedDate}
              schedule={schedule}
              selectedTurfId={selectedTurfId}
              selectedStatus={selectedStatus}
              onSelectTurf={setSelectedTurfId}
              onSelectStatus={setSelectedStatus}
              onAddSlot={() => setCreateModalOpen(true)}
              onToday={goToToday}
            />
          </aside>

          <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                      <CalendarDays className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                          Calendar
                        </h1>

                        <div className="flex overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => setViewMode("DAY")}
                            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                              viewMode === "DAY"
                                ? "bg-green-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Day
                          </button>

                          <button
                            type="button"
                            onClick={() => setViewMode("WEEK")}
                            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                              viewMode === "WEEK"
                                ? "bg-green-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Week
                          </button>
                        </div>

                        {viewingToday && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Today
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        Manage slots, bookings, and turf availability.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] 2xl:flex 2xl:items-center">
                  <Button
                    variant="secondary"
                    onClick={goToToday}
                    disabled={viewingToday}
                    className="justify-center"
                  >
                    Today
                  </Button>

                  <div className="flex min-w-0 items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={goToPreviousDay}
                      className="shrink-0 p-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                      aria-label="Previous day"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="min-w-0 flex-1 border-x border-slate-200 px-5 py-3 text-center sm:min-w-44">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {formatMonthHeading(selectedDate)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatShortSelectedDate(selectedDate)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={goToNextDay}
                      className="shrink-0 p-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                      aria-label="Next day"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="justify-center sm:col-span-2 2xl:col-span-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Slot
                  </Button>
                </div>
              </div>
            </div>

            {viewMode === "DAY" && (
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Selected Day
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    {formatSelectedDate(selectedDate)}
                  </h2>
                </div>

                <p className="text-sm text-slate-500">
                  {loading
                    ? "Loading schedule..."
                    : totalFilteredSlots === 0
                      ? "No slots match current filters"
                      : `${totalFilteredSlots} slot${
                          totalFilteredSlots > 1 ? "s" : ""
                        } shown`}
                </p>
              </div>
            )}

            {viewMode === "DAY" ? (
              loading ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="space-y-3">
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                </div>
              ) : (
                <CalendarDayBoard
                  schedule={filteredSchedule}
                  onEditSlot={(slot) => setEditModalSlot(slot)}
                  onBlockSlot={handleBlockSlot}
                  onUnblockSlot={handleUnblockSlot}
                  onDeleteSlot={handleDeleteSlot}
                  onViewBooking={(slot) => setBookingModalSlot(slot)}
                />
              )
            ) : (
              <CalendarWeekBoard
                selectedDate={selectedDate}
                selectedTurfId={selectedTurfId}
                selectedStatus={selectedStatus}
                onSelectDay={handleWeekDaySelect}
              />
            )}
          </main>
        </div>
      </div>

      <CalendarCreateSlotModal
        open={createModalOpen}
        selectedDate={selectedDate}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchCalendar}
      />

      <CalendarEditSlotModal
        open={!!editModalSlot}
        slot={editModalSlot}
        onClose={() => setEditModalSlot(null)}
        onSuccess={fetchCalendar}
      />

      <CalendarBookingModal
        open={!!bookingModalSlot}
        slot={bookingModalSlot}
        onClose={() => setBookingModalSlot(null)}
      />
    </>
  );
}

export default OwnerCalendarPage;
