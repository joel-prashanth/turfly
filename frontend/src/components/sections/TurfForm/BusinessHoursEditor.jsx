const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export const DEFAULT_BUSINESS_HOURS = Object.fromEntries(
  DAYS.map(({ key }) => [key, { open: "06:00", close: "22:00", closed: false }])
);

function BusinessHoursEditor({ value, onChange }) {
  const hours = value || DEFAULT_BUSINESS_HOURS;

  const update = (day, field, val) => {
    onChange({ ...hours, [day]: { ...hours[day], [field]: val } });
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">Business Hours</h3>
      <p className="text-sm text-slate-500 mb-4">
        Typical operating hours shown to players. Does not affect slot availability.
      </p>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
        {DAYS.map(({ key, label }) => {
          const day = hours[key] || { open: "06:00", close: "22:00", closed: false };
          return (
            <div
              key={key}
              className="flex items-center gap-4 px-4 py-3 bg-white"
            >
              <span className="w-10 shrink-0 text-sm font-medium text-slate-700">
                {label}
              </span>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!day.closed}
                  onChange={(e) => update(key, "closed", !e.target.checked)}
                  className="accent-green-600 w-4 h-4"
                />
                <span className="text-sm text-slate-600">Open</span>
              </label>

              {!day.closed ? (
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => update(key, "open", e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-slate-400 text-sm">–</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => update(key, "close", e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ) : (
                <span className="ml-auto text-sm text-slate-400 italic">Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BusinessHoursEditor;
