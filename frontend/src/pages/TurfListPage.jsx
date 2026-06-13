import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getTurfs } from "../api/turfApi";

import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";

import TurfFilters from "../components/filters/TurfFilters";
import TurfCardSkeleton from "../components/skeletons/TurfCardSkeleton";
import TurfCard from "../components/turf/TurfCard";

export default function TurfListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const sport = searchParams.get("sport") || "";

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        setLoading(true);

        const data = await getTurfs({
          search,
          sport,
        });

        setTurfs(data.turfs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, [search, sport]);

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="py-10">
        <PageHeader
          title={sport ? `${sport.replace("_", " ")} Turfs` : "Browse Turfs"}
          subtitle="Find and book the perfect sports venue."
        />

        <TurfFilters
          search={search}
          sport={sport}
          onSearchChange={(value) =>
            updateFilters({
              search: value,
            })
          }
          onSportChange={(value) =>
            updateFilters({
              sport: value,
            })
          }
        />

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <TurfCardSkeleton key={index} />
            ))}
          </div>
        ) : turfs.length === 0 ? (
          <EmptyState
            title="No Turfs Found"
            description="Try changing your search or filters."
          />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {turfs.map((turf) => (
              <TurfCard
                key={turf.id}
                turf={turf}
                actions={
                  <Link to={`/turfs/${turf.id}`}>
                    <Button className="w-full">
                      View Details
                    </Button>
                  </Link>
                }
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}