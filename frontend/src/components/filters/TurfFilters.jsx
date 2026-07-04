import { ArrowUpDown, IndianRupee, MapPin, Search } from "lucide-react";

import { SPORTS } from "../../constants/sports";

const SORT_OPTIONS = [
  { value: "", label: "Newest first" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
];

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

function TurfFilters({
  search,
  sport,
  city,
  cities = [],
  minPrice,
  maxPrice,
  sort,
  onSearchChange,
  onSportChange,
  onCityChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
}) {
  return (
    <div className="space-y-4">
      {/* Row 1: search + sort */}
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or location…"
            className={`${inputCls} pl-11 pr-4`}
          />
        </div>

        <div className="relative">
          <ArrowUpDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className={`${inputCls} appearance-none pl-10 pr-8 font-medium text-slate-700`}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">▼</span>
        </div>
      </div>

      {/* Row 2: price range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <IndianRupee size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="number"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="Min price"
            min={0}
            className={`${inputCls} pl-10 pr-4`}
          />
        </div>
        <div className="relative">
          <IndianRupee size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="Max price"
            min={0}
            className={`${inputCls} pl-10 pr-4`}
          />
        </div>
      </div>

      {/* City chips */}
      {cities.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ value: "", label: "All Cities" }, ...cities.map((c) => ({ value: c, label: c }))].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onCityChange(item.value)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                city === item.value
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              {item.value && <MapPin size={12} />}
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Sport chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ value: "", name: "All" }, ...SPORTS].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onSportChange(item.value)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              sport === item.value
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TurfFilters;
