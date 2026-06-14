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
    ? "font-semibold text-green-400 transition-colors hover:text-green-300"
    : "font-semibold text-green-600 transition-colors hover:text-green-700";

  return (
    <div
      className={`mb-12 flex flex-col gap-6 ${
        centered
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className={centered ? "max-w-3xl" : ""}>
        {eyebrow && (
          <p
            className={`mb-3 text-sm font-semibold uppercase tracking-[0.3em] ${eyebrowClass}`}
          >
            {eyebrow}
          </p>
        )}

        <h2
          className={`text-4xl font-bold tracking-tight md:text-5xl ${titleClass}`}
        >
          {title}
        </h2>

        {subtitle && (
          <p className={`mt-3 max-w-2xl text-lg ${subtitleClass}`}>
            {subtitle}
          </p>
        )}
      </div>

      {!centered && actionLabel && actionTo && (
        <Link to={actionTo} className={actionClass}>
          {actionLabel} →
        </Link>
      )}

      {centered && actionLabel && actionTo && (
        <Link to={actionTo} className={`mt-2 ${actionClass}`}>
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}

export default SectionHeader;