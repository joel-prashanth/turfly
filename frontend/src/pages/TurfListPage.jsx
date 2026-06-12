import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getTurfs } from "../api/turfApi";

import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";

import HeroSection from "../components/sections/HeroSection";
import TurfCardSkeleton from "../components/skeletons/TurfCardSkeleton";
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
       
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Container className="pt-8 pb-20">
          <HeroSection />

          <div className="mt-16">
            <PageHeader
              title="Popular Turfs"
              subtitle="Handpicked sports venues loved by players."
            />

            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <TurfCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="pt-8 pb-20">
        <HeroSection />

        <div className="mt-16">
          <PageHeader
            title="Popular Turfs"
            subtitle="Handpicked sports venues loved by players."
          />

          {turfs.length === 0 ? (
            <EmptyState
              title="No Turfs Available"
              description="Turf owners will appear here once they create their venues."
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {turfs.map((turf) => (
                <TurfCard
                  key={turf.id}
                  turf={turf}
                  actions={
                    <Link to={`/turfs/${turf.id}`}>
                      <Button className="w-full">View Details</Button>
                    </Link>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
