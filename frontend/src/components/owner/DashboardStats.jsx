import { useEffect, useState } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  MapPinned,
  Users,
  Layers3,
} from "lucide-react";
import toast from "react-hot-toast";

import { getOwnerDashboardStats } from "../../api/dashboard";

import StatCard from "./StatCard";
import DashboardStatsSkeleton from "../skeletons/DashboardStatsSkeleton";

function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await getOwnerDashboardStats();

        setStats(response.data.stats);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load dashboard statistics",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <DashboardStatsSkeleton />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Active Turfs"
        value={stats.activeTurfs}
        icon={<MapPinned className="text-green-700" />}
      />

      <StatCard
        label="Today's Bookings"
        value={stats.todayBookings}
        icon={<CalendarDays className="text-green-700" />}
      />

      <StatCard
        label="Upcoming Slots"
        value={stats.upcomingSlots}
        icon={<Layers3 className="text-green-700" />}
      />

      <StatCard
        label="Players"
        value={stats.players}
        icon={<Users className="text-green-700" />}
      />

      <StatCard
        label="Revenue"
        value={stats.revenue}
        prefix="₹"
        icon={<CircleDollarSign className="text-green-700" />}
      />
    </div>
  );
}

export default DashboardStats;
