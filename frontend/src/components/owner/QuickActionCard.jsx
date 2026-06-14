import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Card from "../ui/Card";

function QuickActionCard({ title, description, icon, to }) {
  return (
    <Link to={to} className="group block">
      <Card className="h-full border border-slate-200 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700 transition-transform duration-200 group-hover:scale-110">
            {icon}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          <div className="mt-auto flex justify-end pt-8">
            <ArrowRight
              size={20}
              className="text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-green-600"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default QuickActionCard;
