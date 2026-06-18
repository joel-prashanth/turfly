import { Search, Trophy } from "lucide-react";

import { SPORTS } from "../../constants/sports";

function TurfFilters({ search, sport, onSearchChange, onSportChange }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by turf name or location..."
            className="
              w-full rounded-2xl border border-slate-200 bg-white
              py-3.5 pl-11 pr-4 text-sm text-slate-900
              outline-none transition
              placeholder:text-slate-400
              focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
            "
          />
        </div>

        {/* Sport Select */}
        <div className="relative">
          <Trophy
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={sport}
            onChange={(e) => onSportChange(e.target.value)}
            className="
              w-full appearance-none rounded-2xl border border-slate-200 bg-white
              py-3.5 pl-11 pr-10 text-sm font-medium text-slate-700
              outline-none transition
              focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
            "
          >
            <option value="">All Sports</option>

            {SPORTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.name}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            ▼
          </span>
        </div>
      </div>

      {/* Sport Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onSportChange("")}
          className={`
            shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition
            ${
              !sport
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
            }
          `}
        >
          All
        </button>

        {SPORTS.map((item) => {
          const isActive = sport === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onSportChange(item.value)}
              className={`
                shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition
                ${
                  isActive
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                }
              `}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TurfFilters;
