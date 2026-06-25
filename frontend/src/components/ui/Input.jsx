import clsx from "clsx";

function Input({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  rightElement,
  className,
  ...props
}) {
  const hasRight = RightIcon || rightElement;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <LeftIcon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          className={clsx(
            "w-full rounded-xl border border-slate-300 bg-white py-3 text-slate-900 shadow-sm transition-all duration-300",
            LeftIcon ? "pl-11 pr-4" : "px-4",
            hasRight ? "pr-11" : "",
            "placeholder:text-slate-400",
            "focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100",
            "disabled:cursor-not-allowed disabled:bg-slate-100",
            error && "border-red-400 focus:border-red-400 focus:ring-red-100",
            className,
          )}
          {...props}
        />

        {/* Non-interactive icon */}
        {RightIcon && !rightElement && (
          <RightIcon
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        {/* Interactive element (e.g. password eye button) */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default Input;
