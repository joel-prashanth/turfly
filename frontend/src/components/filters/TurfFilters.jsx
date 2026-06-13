import { Search } from "lucide-react";

import { SPORTS } from "../../constants/sports";

function TurfFilters({
  search,
  sport,
  onSearchChange,
  onSportChange,
}) {
  return (
    <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
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
            placeholder="Search by turf or location..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-green-500"
          />
        </div>

        {/* Sport */}
        <select
          value={sport}
          onChange={(e) => onSportChange(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500"
        >
          <option value="">All Sports</option>

          {SPORTS.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TurfFilters;