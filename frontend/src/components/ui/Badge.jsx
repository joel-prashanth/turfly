function Badge({ children, variant = "secondary", className = "" }) {
  const variants = {
    success: "bg-green-100 text-green-700 border border-green-200",

    danger: "bg-red-100 text-red-700 border border-red-200",

    warning: "bg-amber-100 text-amber-700 border border-amber-200",

    primary: "bg-blue-100 text-blue-700 border border-blue-200",

    secondary: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
