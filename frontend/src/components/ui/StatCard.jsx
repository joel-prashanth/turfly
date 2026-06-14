import Card from "./Card";
import AnimatedCounter from "./AnimatedCounter";

function StatCard({ icon: Icon, value, label }) {
  return (
    <Card
      className="
        group
        h-full
        border
        border-slate-200/80
        bg-white
        p-8
        text-center
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:border-green-200
        hover:shadow-2xl
      "
    >
      <div
        className="
          mx-auto
          mb-7
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-green-50
          text-green-600
          transition-all
          duration-300
          group-hover:scale-105
          group-hover:bg-green-100
        "
      >
        <Icon size={28} />
      </div>

      <h3 className="text-5xl font-extrabold tracking-tight text-slate-900">
        <AnimatedCounter end={value} />
      </h3>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
    </Card>
  );
}

export default StatCard;
