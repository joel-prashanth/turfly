import Card from "../ui/Card";

function StatCard({ title, value, icon }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
        </div>

        <div className="rounded-xl bg-green-100 p-3">{icon}</div>
      </div>
    </Card>
  );
}

export default StatCard;
