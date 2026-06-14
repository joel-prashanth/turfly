import { Link } from "react-router-dom";
import { ArrowRight, Clock3 } from "lucide-react";

import Card from "../ui/Card";

function QuickActionCard({
  title,
  description,
  icon,
  to,
  disabled = false,
  badge,
}) {
  const content = (
    <Card
      className={`h-full border border-slate-200 p-6 transition-all duration-200 ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : "hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              disabled
                ? "bg-slate-100 text-slate-500"
                : "bg-green-100 text-green-700 transition-transform duration-200 group-hover:scale-110"
            }`}
          >
            {icon}
          </div>

          {badge && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              <Clock3 size={12} className="mr-1" />
              {badge}
            </span>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div className="mt-auto flex justify-end pt-8">
          <ArrowRight
            size={20}
            className={`transition-transform duration-200 ${
              disabled
                ? "text-slate-300"
                : "text-slate-400 group-hover:translate-x-1 group-hover:text-green-600"
            }`}
          />
        </div>
      </div>
    </Card>
  );

  if (disabled) {
    return <div>{content}</div>;
  }

  return (
    <Link to={to} className="group block">
      {content}
    </Link>
  );
}

export default QuickActionCard;
