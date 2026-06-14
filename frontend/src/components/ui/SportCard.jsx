import Card from "./Card";

function SportCard({ sport, onClick }) {
  return (
    <button
      onClick={() => onClick?.(sport)}
      className="group block w-full text-left"
    >
      <Card
        className="
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
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-3xl
            bg-green-50
            transition-all
            duration-300
            group-hover:scale-105
            group-hover:bg-green-100
          "
        >
          <span className="text-5xl">
            {sport.emoji}
          </span>
        </div>

        <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-900">
          {sport.name}
        </h3>
      </Card>
    </button>
  );
}

export default SportCard;