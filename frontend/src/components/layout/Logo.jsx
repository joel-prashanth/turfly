import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="rounded-xl bg-green-600 p-2 text-white shadow-md">
        <Trophy size={22} />
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Turfly
        </h1>

        <p className="text-xs text-slate-500">Play More.</p>
      </div>
    </Link>
  );
}

export default Logo;
