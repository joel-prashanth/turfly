import Card from "./Card";

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card
      className="
        group
        h-full
        border
        border-slate-200/80
        bg-white
        p-8
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:border-green-200
        hover:shadow-2xl
      "
    >
      <div
        className="
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
        <Icon size={30} />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-4 leading-8 text-slate-600">{description}</p>
    </Card>
  );
}

export default FeatureCard;
