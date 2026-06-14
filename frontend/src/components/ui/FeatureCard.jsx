import Card from "./Card";

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
        <Icon size={32} />
      </div>

      <h3 className="text-xl font-bold text-slate-900">{title}</h3>

      <p className="mt-4 leading-7 text-slate-600">{description}</p>
    </Card>
  );
}

export default FeatureCard;
