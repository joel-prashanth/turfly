import clsx from "clsx";

function Card({ children, className, hover = true, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white border border-slate-200 shadow-sm",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
