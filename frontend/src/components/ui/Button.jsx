import clsx from "clsx";
import Spinner from "./Spinner";

function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  loading = false,
  type = "button",
  ...props
}) {
  const baseClasses = clsx(
    "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    !loading && "active:scale-[0.98]",
  );

  const variants = {
    primary:
      "bg-green-600 text-white shadow-sm hover:bg-green-700 hover:shadow-lg",

    secondary:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",

    white: "bg-white text-slate-900 shadow-sm hover:bg-slate-100",

    danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-lg",

    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
