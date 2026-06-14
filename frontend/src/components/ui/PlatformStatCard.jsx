import AnimatedCounter from "./AnimatedCounter";

function PlatformStatCard({ icon: Icon, value, label }) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-10
        text-center
        shadow-lg
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-green-500/40
      "
    >
      <div className="flex flex-col items-center">
        <div className="rounded-2xl bg-green-500/10 p-5">
          <Icon className="h-10 w-10 text-green-400" />
        </div>

        <h3 className="mt-8 text-6xl font-bold tracking-tight text-white">
          <AnimatedCounter end={value} suffix="+" />
        </h3>

        <p className="mt-4 text-lg text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export default PlatformStatCard;