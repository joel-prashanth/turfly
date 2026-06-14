import Card from "./Card";
import AnimatedCounter from "./AnimatedCounter";

function StatCard({ icon: Icon, value, label }) {
  return (
    <Card
      className="
        group
        h-full
        border
        border-slate-200
        bg-white
        p-8
        text-center
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-green-200
        hover:shadow-2xl
      "
    >
      <div
        className="
          mx-auto
          mb-6
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-green-100
          text-green-600
          transition-transform
          duration-300
          group-hover:scale-110
        "
      >
        <Icon size={30} />
      </div>

      <h3 className="text-5xl font-extrabold text-slate-900">
        <AnimatedCounter end={value} />
      </h3>

      <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>
    </Card>
  );
}

export default StatCard;
