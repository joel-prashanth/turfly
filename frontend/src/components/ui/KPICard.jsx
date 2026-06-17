function KPICard({
  title,
  value,
  icon: Icon,
  color = "text-slate-700",
  bg = "bg-slate-100",
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div className={`inline-flex rounded-xl p-3 ${bg}`}>
        <Icon className={color} size={18} />
      </div>

      <h3 className={`mt-5 text-4xl font-bold ${color}`}>{value}</h3>

      <p className="mt-2 text-sm font-medium text-slate-500">{title}</p>
    </div>
  );
}

export default KPICard;
