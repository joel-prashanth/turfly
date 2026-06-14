import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Card from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import RevenueChartSkeleton from "../../skeletons/RevenueChartSkeleton";

import { getRevenueAnalytics } from "../../../api/analytics";

function RevenueChart() {
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await getRevenueAnalytics();

        setRevenue(response.data.revenue);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message || "Failed to load revenue analytics",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  const totalRevenue = useMemo(
    () => revenue.reduce((sum, day) => sum + day.amount, 0),
    [revenue],
  );

  const maxRevenue = Math.max(...revenue.map((d) => d.amount), 1);

  if (loading) {
    return <RevenueChartSkeleton />;
  }

  if (totalRevenue === 0) {
    return (
      <section className="mt-14">
        <Card className="p-10">
          <EmptyState
            title="No revenue yet"
            description="Create slots and receive bookings to start viewing analytics."
          />
        </Card>
      </section>
    );
  }

  return (
    <section className="mt-14">
      <Card className="p-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Revenue</h2>

          <p className="mt-1 text-sm text-slate-500">Last 7 days</p>

          <p className="mt-6 text-4xl font-bold tracking-tight text-slate-900">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="mt-10 flex h-60 items-end justify-between gap-3">
          {revenue.map((day) => {
            const height = (day.amount / maxRevenue) * 180 + 16;

            return (
              <div key={day.date} className="flex flex-1 flex-col items-center">
                <div
                  title={`₹${day.amount}`}
                  className="w-full rounded-xl bg-green-600 transition-all duration-300 hover:scale-y-105"
                  style={{
                    height: `${height}px`,
                  }}
                />

                <span className="mt-3 text-xs font-medium text-slate-500">
                  {day.date.slice(8)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

export default RevenueChart;
