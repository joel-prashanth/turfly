function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-lg text-slate-500">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

export default PageHeader;
