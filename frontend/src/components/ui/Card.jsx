import clsx from "clsx";

function Card({ children, className, hover = true, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        hover &&
          "relative z-0 transition-all duration-300 hover:z-20 hover:-translate-y-1 hover:shadow-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
