import { Link } from "react-router-dom";

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionTo,
  centered = false,
}) {
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
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-green-600">
            {eyebrow}
          </p>
        )}

        <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            {subtitle}
          </p>
        )}
      </div>

      {!centered && actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="font-semibold text-green-600 transition-colors hover:text-green-700"
        >
          {actionLabel} →
        </Link>
      )}

      {centered && actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-2 font-semibold text-green-600 transition-colors hover:text-green-700"
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}

export default SectionHeader;