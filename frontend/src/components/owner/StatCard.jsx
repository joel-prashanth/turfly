import AnimatedCounter from "../ui/AnimatedCounter";
import Card from "../ui/Card";

function StatCard({ label, value, icon: Icon, prefix = "", helper }) {
  return (
    <Card
      className="
        relative
        overflow-hidden
        p-5
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-green-200
        hover:shadow-md
      "
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-50" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>

          <h2 className="mt-3 truncate text-3xl font-bold tracking-tight text-slate-950">
            <AnimatedCounter end={value} prefix={prefix} />
          </h2>

          {helper && (
            <p className="mt-2 text-xs font-medium text-slate-400">{helper}</p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export default StatCard;
