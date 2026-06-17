function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-base text-slate-500 lg:text-lg">
              {subtitle}
            </p>
          )}
        </div>

        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
