import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
} from "lucide-react";

import { getTurfs } from "../api/turfApi";

import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";

import TurfFilters from "../components/filters/TurfFilters";
import TurfCardSkeleton from "../components/skeletons/TurfCardSkeleton";
import TurfCard from "../components/turf/TurfCard";

const formatSportLabel = (sport) => {
  if (!sport) return "";

  return sport
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function TurfListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchInput, 400);

  const sport = searchParams.get("sport") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "";

  const hasActiveFilters = Boolean(debouncedSearch || sport || minPrice || maxPrice || sort);

  const pageTitle = useMemo(() => {
    if (sport) {
      return `${formatSportLabel(sport)} Turfs`;
    }

    return "Browse Turfs";
  }, [sport]);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        setLoading(true);

        const data = await getTurfs({
          search: debouncedSearch,
          sport,
          minPrice,
          maxPrice,
          sort,
        });

        setTurfs(data.turfs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, [debouncedSearch, sport, minPrice, maxPrice, sort]);

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

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <Container className="py-10">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <Sparkles className="h-4 w-4" />
                Book sports venues near you
              </div>

              <PageHeader
                title={pageTitle}
                subtitle="Find football, cricket, badminton, tennis and more turfs with clear pricing and available slots."
              />

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                  <Trophy className="h-4 w-4 text-emerald-600" />
                  Verified venues
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  Local turf discovery
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                  <Search className="h-4 w-4 text-emerald-600" />
                  Fast search and filters
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3">
                  <SlidersHorizontal className="h-5 w-5 text-emerald-700" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Refine your search
                  </p>
                  <p className="text-sm text-slate-500">
                    Search by name, location or sport.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <TurfFilters
                  search={searchInput}
                  sport={sport}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  sort={sort}
                  onSearchChange={setSearchInput}
                  onSportChange={(v) => updateFilters({ sport: v })}
                  onMinPriceChange={(v) => updateFilters({ minPrice: v })}
                  onMaxPriceChange={(v) => updateFilters({ maxPrice: v })}
                  onSortChange={(v) => updateFilters({ sort: v })}
                />
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm">
                  <span className="text-slate-500">
                    {loading
                      ? "Searching turfs..."
                      : `${turfs.length} turf${
                          turfs.length === 1 ? "" : "s"
                        } found`}
                  </span>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Available Turfs
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick a venue, view slots, and confirm your booking.
            </p>
          </div>

          {!loading && turfs.length > 0 && (
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              {turfs.length} result{turfs.length === 1 ? "" : "s"}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <TurfCardSkeleton key={index} />
            ))}
          </div>
        ) : turfs.length === 0 ? (
          <EmptyState
            title="No turfs found"
            description="Try changing your search keyword, clearing the sport filter, or browsing all available turfs."
            actionText={hasActiveFilters ? "Clear Filters" : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {turfs.map((turf) => (
              <TurfCard
                key={turf.id}
                turf={turf}
                actions={
                  <div className="flex gap-2">
                    <Link to={`/turfs/${turf.id}`} className="flex-1">
                      <Button className="w-full">View Slots</Button>
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${turf.name} ${turf.location}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Get Directions"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                      <MapPin size={18} />
                    </a>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
