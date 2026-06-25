import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";

import CalendarSidebar from "../components/owner/calendar/CalendarSidebar";
import CalendarDayBoard from "../components/owner/calendar/CalendarDayBoard";
import CalendarWeekBoard from "../components/owner/calendar/CalendarWeekBoard";
import CalendarMonthBoard from "../components/owner/calendar/CalendarMonthBoard";
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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatMonthHeading = (date) =>
  date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const formatSelectedDate = (date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatShortSelectedDate = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const VIEW_MODES = ["DAY", "WEEK", "MONTH"];

function OwnerCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("MONTH");

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTurfId, setSelectedTurfId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalSlot, setEditModalSlot] = useState(null);
  const [bookingModalSlot, setBookingModalSlot] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, slot: null, loading: false });

  const selectedDateString = useMemo(() => formatDateForApi(selectedDate), [selectedDate]);

  const today = new Date();
  const viewingToday = isSameDay(selectedDate, today);

  const filteredSchedule = useMemo(() =>
    schedule
      .filter((t) => selectedTurfId === "ALL" || t.id === selectedTurfId)
      .map((t) => ({
        ...t,
        slots: t.slots.filter((s) => selectedStatus === "ALL" || s.status === selectedStatus),
      }))
      .filter((t) => t.slots.length > 0),
    [schedule, selectedTurfId, selectedStatus],
  );

  const totalFilteredSlots = useMemo(
    () => filteredSchedule.reduce((n, t) => n + t.slots.length, 0),
    [filteredSchedule],
  );

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const response = await getOwnerCalendar(selectedDateString);
      setSchedule(response.data.schedule || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load calendar schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "DAY") fetchCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateString, viewMode]);

  const goToPreviousDay = () =>
    setSelectedDate((prev) => { const d = new Date(prev); d.setDate(d.getDate() - 1); return d; });

  const goToNextDay = () =>
    setSelectedDate((prev) => { const d = new Date(prev); d.setDate(d.getDate() + 1); return d; });

  const goToToday = () => setSelectedDate(new Date());

  const handleWeekDaySelect = (date) => { setSelectedDate(date); setViewMode("DAY"); };
  const handleMonthDaySelect = (date) => { setSelectedDate(date); setViewMode("DAY"); };

  const handleBlockSlot = async (slot) => {
    try {
      await blockSlot(slot.id);
      toast.success("Slot blocked.");
      fetchCalendar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block slot.");
    }
  };

  const handleUnblockSlot = async (slot) => {
    try {
      await unblockSlot(slot.id);
      toast.success("Slot unblocked.");
      fetchCalendar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock slot.");
    }
  };

  const handleDeleteSlot = (slot) => {
    setDeleteDialog({ open: true, slot, loading: false });
  };

  const confirmDeleteSlot = async () => {
    const { slot } = deleteDialog;
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await deleteSlot(slot.id);
      toast.success("Slot deleted.");
      setDeleteDialog({ open: false, slot: null, loading: false });
      fetchCalendar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete slot.");
      setDeleteDialog((d) => ({ ...d, loading: false }));
    }
  };

  const showDayNav = viewMode !== "MONTH";

  return (
    <>
      <div className="min-h-full bg-slate-50">
        <div className="grid min-h-full grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-white xl:border-b-0 xl:border-r">
            <CalendarSidebar
              viewMode={viewMode}
              selectedDate={selectedDate}
              schedule={schedule}
              selectedTurfId={selectedTurfId}
              selectedStatus={selectedStatus}
              onSelectTurf={setSelectedTurfId}
              onSelectStatus={setSelectedStatus}
              onToday={goToToday}
            />
          </aside>

          <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
                {/* Title + view toggle */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                        Calendar
                      </h1>

                      {/* View mode toggle */}
                      <div className="flex overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1">
                        {VIEW_MODES.map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setViewMode(mode)}
                            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                              viewMode === mode
                                ? "bg-green-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {mode.charAt(0) + mode.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>

                      {viewingToday && viewMode !== "MONTH" && (
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

                {/* Day navigation (hidden in month view) */}
                {showDayNav && (
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={goToToday}
                      disabled={viewingToday}
                    >
                      Today
                    </Button>

                    <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={goToPreviousDay}
                        className="p-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="min-w-36 border-x border-slate-200 px-5 py-3 text-center">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatMonthHeading(selectedDate)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatShortSelectedDate(selectedDate)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={goToNextDay}
                        className="p-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    <Button onClick={() => setCreateModalOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Add Slot
                    </Button>
                  </div>
                )}

                {viewMode === "MONTH" && (
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Slot
                  </Button>
                )}
              </div>
            </div>

            {/* Day view subheader */}
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
                    ? "Loading..."
                    : totalFilteredSlots === 0
                      ? "No slots match current filters"
                      : `${totalFilteredSlots} slot${totalFilteredSlots > 1 ? "s" : ""} shown`}
                </p>
              </div>
            )}

            {/* Board */}
            {viewMode === "DAY" ? (
              loading ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
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
            ) : viewMode === "WEEK" ? (
              <CalendarWeekBoard
                selectedDate={selectedDate}
                selectedTurfId={selectedTurfId}
                selectedStatus={selectedStatus}
                onSelectDay={handleWeekDaySelect}
              />
            ) : (
              <CalendarMonthBoard
                selectedDate={selectedDate}
                selectedTurfId={selectedTurfId}
                selectedStatus={selectedStatus}
                onSelectDay={handleMonthDaySelect}
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
        onCancelled={() => { setBookingModalSlot(null); fetchCalendar(); }}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Slot"
        description="This slot will be permanently deleted. This cannot be undone."
        confirmText="Delete"
        danger
        loading={deleteDialog.loading}
        onClose={() => !deleteDialog.loading && setDeleteDialog({ open: false, slot: null, loading: false })}
        onConfirm={confirmDeleteSlot}
      />
    </>
  );
}

export default OwnerCalendarPage;
