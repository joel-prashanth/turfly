const Spinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`
        inline-block
        rounded-full
        border-slate-200
        border-t-current
        animate-spin
        ${sizes[size]}
        ${className}
      `}
    />
  );
};

export default Spinner;
