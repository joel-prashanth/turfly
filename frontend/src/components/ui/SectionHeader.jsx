import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionTo,
  centered = false,
  light = false,
}) {
  const eyebrowClass = light ? "text-green-400" : "text-green-600";

  const titleClass = light ? "text-white" : "text-slate-900";

  const subtitleClass = light ? "text-slate-300" : "text-slate-600";

  const actionClass = light
    ? "text-green-400 hover:text-green-300"
    : "text-green-600 hover:text-green-700";

  return (
    <div
      className={`mb-14 flex flex-col gap-8 ${
        centered
          ? "items-center text-center"
          : "sm:flex-row sm:items-center sm:justify-between"
      }`}
    >
      <div className={centered ? "max-w-3xl" : "max-w-2xl"}>
        {eyebrow && (
          <p
            className={`mb-4 text-xs font-semibold uppercase tracking-[0.35em] ${eyebrowClass}`}
          >
            {eyebrow}
          </p>
        )}

        <h2
          className={`text-3xl font-bold tracking-tight leading-tight md:text-5xl ${titleClass}`}
        >
          {title}
        </h2>

        {subtitle && (
          <p className={`mt-5 text-lg leading-8 ${subtitleClass}`}>
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className={`group inline-flex items-center gap-2 font-semibold transition-all ${actionClass}`}
        >
          {actionLabel}

          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}

export default SectionHeader;
