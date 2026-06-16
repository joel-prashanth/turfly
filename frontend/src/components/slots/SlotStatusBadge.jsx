function SlotStatusBadge({ status }) {
  const styles = {
    AVAILABLE: "bg-green-100 text-green-700",
    BOOKED: "bg-blue-100 text-blue-700",
    BLOCKED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export default SlotStatusBadge;
