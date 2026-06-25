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
      <div className="relative flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-500">{label}</p>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <h2 className="relative mt-3 truncate text-3xl font-bold tracking-tight text-slate-950">
        <AnimatedCounter end={value} prefix={prefix} />
      </h2>

      {helper && (
        <p className="relative mt-1.5 text-xs font-medium text-slate-400">{helper}</p>
      )}
    </Card>
  );
}

export default StatCard;
