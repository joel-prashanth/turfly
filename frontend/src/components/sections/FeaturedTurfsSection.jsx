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
        title="Featured Turfs"
        subtitle="Discover premium sports venues loved by players across the city."
        actionLabel="View All"
        actionTo="/turfs"
      />

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <TurfCardSkeleton key={index} />
          ))}
        </div>
      ) : turfs.length === 0 ? (
        <EmptyState
          title="No turfs available"
          description="Featured turfs will appear here once they're added."
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
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
    </Section>
  );
}

export default FeaturedTurfsSection;
