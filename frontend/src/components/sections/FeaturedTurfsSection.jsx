import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getTurfs } from "../../api/turfApi";

import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import TurfCard from "../turf/TurfCard";
import TurfCardSkeleton from "../skeletons/TurfCardSkeleton";

function FeaturedTurfsSection() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTurfs = async () => {
      try {
        const response = await getTurfs({
          limit: 3,
        });

        setTurfs(response.turfs);
      } catch (error) {
        console.error("Failed to load featured turfs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTurfs();
  }, []);

  return (
    <Section className="bg-slate-50">
      <SectionHeader
        eyebrow="Featured Venues"
        title="Play at the City's Best Sports Turfs"
        subtitle="Handpicked premium venues designed for football, cricket, badminton, tennis, basketball, and more."
        actionLabel="View All Turfs"
        actionTo="/turfs"
      />

      <div className="mt-14">
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <TurfCardSkeleton />
              </div>
            ))}
          </div>
        ) : turfs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white py-16 shadow-sm">
            <EmptyState
              title="No featured turfs yet"
              description="We're curating the best venues for you. Check back soon as new premium turfs are added."
            />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {turfs.map((turf, index) => (
              <div
                key={turf.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <TurfCard
                  turf={turf}
                  actions={
                    <Link to={`/turfs/${turf.id}`}>
                      <Button className="w-full">View Details</Button>
                    </Link>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

export default FeaturedTurfsSection;
