import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

import CalendarBoard from "../components/owner/calendar/CalendarBoard";
import CalendarBoardSkeleton from "../components/skeletons/CalendarBoardSkeleton";

import { getOwnerCalendar } from "../api/slotApi";

const formatDateForApi = (date) => {
  return date.toISOString().split("T")[0];
};

const formatHeading = (date) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function OwnerCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const heading = useMemo(() => formatHeading(selectedDate), [selectedDate]);

  const fetchSchedule = useCallback(
    async (showSkeleton = false) => {
      try {
        if (showSkeleton) {
          setLoading(true);
        }

        const response = await getOwnerCalendar(formatDateForApi(selectedDate));

        setSchedule(response.data.schedule);
      } catch (error) {
        console.error(error);

        toast.error(error.response?.data?.message || "Failed to load schedule");
      } finally {
        if (showSkeleton) {
          setLoading(false);
        }
      }
    },
    [selectedDate],
  );

  useEffect(() => {
    fetchSchedule(true);
  }, [fetchSchedule]);

  const previousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date);
  };

  const nextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date);
  };

  const today = () => {
    setSelectedDate(new Date());
  };

  return (
    <Container className="py-10">
      <PageHeader
        title="Calendar"
        subtitle="View and manage your daily operations."
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm text-slate-500">Selected Date</p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {heading}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={previousDay}>
            <ChevronLeft size={18} />
          </Button>

          <Button variant="secondary" onClick={today}>
            Today
          </Button>

          <Button variant="secondary" onClick={nextDay}>
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {loading ? (
        <CalendarBoardSkeleton />
      ) : (
        <CalendarBoard schedule={schedule} />
      )}
    </Container>
  );
}

export default OwnerCalendarPage;
