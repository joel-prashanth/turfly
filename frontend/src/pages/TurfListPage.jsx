import { useEffect, useState } from "react";

import { getTurfs } from "../api/turfApi";

import Container from "../components/ui/Container";
import PageHeader from "../components/ui/PageHeader";

import HeroSection from "../components/sections/HeroSection";
import TurfCard from "../components/turf/TurfCard";

export default function TurfListPage() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const data = await getTurfs();
        setTurfs(data.turfs);
      } catch (error) {
        console.error("Failed to fetch turfs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Container className="py-10">
          <div className="animate-pulse space-y-10">
            {/* Hero Skeleton */}
            <div className="h-96 rounded-[32px] bg-slate-200" />

            {/* Header Skeleton */}
            <div className="space-y-3">
              <div className="h-10 w-72 rounded bg-slate-200" />
              <div className="h-5 w-96 rounded bg-slate-200" />
            </div>

            {/* Card Skeletons */}
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm"
                >
                  <div className="h-56 bg-slate-200" />

                  <div className="space-y-4 p-6">
                    <div className="h-6 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-12 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <Container className="pt-8 pb-16">
        <HeroSection />
      </Container>

      {/* Featured Turfs */}
      <Container className="pb-20">
        <PageHeader
          title="Popular Turfs"
          subtitle="Handpicked sports venues loved by players."
        />

        {turfs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <h3 className="text-2xl font-semibold text-slate-800">
              No Turfs Available
            </h3>

            <p className="mt-3 text-slate-500">
              Turf owners will appear here once they create their venues.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {turfs.map((turf) => (
              <TurfCard key={turf.id} turf={turf} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
