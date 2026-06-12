import Button from "./Button";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
      {Icon && (
        <div className="mb-6 rounded-full bg-slate-100 p-4">
          <Icon className="h-10 w-10 text-slate-500" />
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>

      <p className="mt-3 max-w-md text-slate-500">{description}</p>

      {actionText && onAction && (
        <div className="mt-8">
          <Button onClick={onAction}>{actionText}</Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
