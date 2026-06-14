import { useEffect, useState } from "react";

import { getPlatformStats } from "../../api/stats";
import { STAT_ITEMS } from "../../constants/stats";

import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import Skeleton from "../ui/Skeleton";
import StatCard from "../ui/StatCard";

function StatisticsSection() {
  const [stats, setStats] = useState({
    turfs: 0,
    owners: 0,
    players: 0,
    bookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getPlatformStats();
        setStats(stats);
      } catch (error) {
        console.error("Failed to fetch platform stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Section className="bg-slate-950">
      <SectionHeader
        centered
        light
        eyebrow="Our Impact"
        title="Turfly in Numbers"
        subtitle="Real-time platform statistics powered by our growing community."
      />

      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_ITEMS.map((item) => (
            <StatCard
              key={item.key}
              icon={item.icon}
              value={stats[item.key]}
              label={item.label}
            />
          ))}
        </div>
      )}
    </Section>
  );
}

export default StatisticsSection;
