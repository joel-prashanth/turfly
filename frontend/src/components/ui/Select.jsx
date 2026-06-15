function Select({
  label,
  name,
  value,
  onChange,
  children,
  error,
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition
        ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-slate-300 focus:border-green-500"
        }`}
      >
        {children}
      </select>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default Select;
