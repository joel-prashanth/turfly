export function exportBookingsCSV(bookings, filename = "turfly-payments.csv") {
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const headers = [
    "Booking Ref",
    "Player / Walk-in",
    "Turf",
    "Date",
    "Start Time",
    "End Time",
    "Amount (₹)",
    "Status",
    "Source",
  ];

  const rows = bookings.map((b) => [
    b.id.slice(0, 8).toUpperCase(),
    b.player?.name || b.walkInName || "Walk-in",
    b.slot?.turf?.name || "",
    fmtDate(b.slot?.startTime),
    fmtTime(b.slot?.startTime),
    fmtTime(b.slot?.endTime),
    Number(b.amount || 0).toFixed(2),
    b.status,
    b.source || "PLATFORM",
  ]);

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
