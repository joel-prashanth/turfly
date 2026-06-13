function SportCard({ sport, onClick }) {
  return (
    <button
      onClick={() => onClick?.(sport)}
      className="group flex w-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-500 hover:shadow-xl"
    >
      <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
        {sport.emoji}
      </span>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {sport.name}
      </h3>
    </button>
  );
}

export default SportCard;
