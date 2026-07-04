const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "Turfly <onboarding@resend.dev>";

const fmt = (date) =>
  new Date(date).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const fmtTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });

const fmtINR = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

// ── Base layout ──────────────────────────────────────────────────────────────

const layout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

        <!-- Header -->
        <tr>
          <td style="background:#16a34a;padding:24px 32px;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Turfly</p>
            <p style="margin:4px 0 0;font-size:12px;color:#bbf7d0;">Book. Play. Repeat.</p>
          </td>
        </tr>

        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f1f5f9;padding:20px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
              Turfly · Hyderabad · You're receiving this because you made a booking on Turfly.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const infoRow = (label, value) => `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
      <span style="font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${label}</span>
    </td>
    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;">
      <span style="font-size:14px;color:#0f172a;font-weight:700;">${value}</span>
    </td>
  </tr>`;

const send = async ({ to, subject, html }) => {
  if (!to) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (e) {
    console.error("[email] Failed to send to", to, e?.message);
  }
};

// ── Templates ────────────────────────────────────────────────────────────────

const bookingConfirmed = async ({ playerEmail, playerName, turfName, location, startTime, endTime, amount }) => {
  if (!playerEmail) return;
  await send({
    to: playerEmail,
    subject: `Booking Confirmed — ${turfName}`,
    html: layout(`
      <h1 style="margin:0 0 4px;font-size:24px;font-weight:800;color:#0f172a;">Booking Confirmed ✅</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${playerName}, you're all set!</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#0f172a;">${turfName}</p>
        <p style="margin:0;font-size:13px;color:#64748b;">📍 ${location}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${infoRow("Date & Time", fmt(startTime))}
        ${infoRow("Ends At", fmtTime(endTime))}
        ${infoRow("Amount", `₹${fmtINR(amount)}`)}
      </table>

      <p style="margin:0;font-size:13px;color:#64748b;">Show this email at the venue if needed. See you on the field! 🏟️</p>
    `),
  });
};

const bookingCancelledByPlayer = async ({ ownerEmail, ownerName, playerName, turfName, startTime }) => {
  if (!ownerEmail) return;
  await send({
    to: ownerEmail,
    subject: `Booking Cancelled — ${playerName}, ${turfName}`,
    html: layout(`
      <h1 style="margin:0 0 4px;font-size:24px;font-weight:800;color:#0f172a;">Booking Cancelled</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${ownerName}, a player cancelled their booking.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${infoRow("Player", playerName)}
        ${infoRow("Turf", turfName)}
        ${infoRow("Slot", fmt(startTime))}
      </table>

      <p style="margin:0;font-size:13px;color:#64748b;">The slot is now available for new bookings.</p>
    `),
  });
};

const bookingCancelledByOwner = async ({ playerEmail, playerName, turfName, startTime }) => {
  if (!playerEmail) return;
  await send({
    to: playerEmail,
    subject: `Your booking at ${turfName} was cancelled`,
    html: layout(`
      <h1 style="margin:0 0 4px;font-size:24px;font-weight:800;color:#0f172a;">Booking Cancelled</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${playerName}, the venue has cancelled your booking.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${infoRow("Turf", turfName)}
        ${infoRow("Slot", fmt(startTime))}
      </table>

      <p style="margin:0;font-size:13px;color:#64748b;">We're sorry for the inconvenience. Please book another slot at your convenience.</p>
    `),
  });
};

const newBookingOwnerAlert = async ({ ownerEmail, ownerName, playerName, playerPhone, turfName, startTime, endTime, amount }) => {
  if (!ownerEmail) return;
  await send({
    to: ownerEmail,
    subject: `New Booking — ${playerName}, ${turfName}`,
    html: layout(`
      <h1 style="margin:0 0 4px;font-size:24px;font-weight:800;color:#0f172a;">New Booking 🎉</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${ownerName}, you have a new booking!</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${infoRow("Player", playerName)}
        ${infoRow("Phone", playerPhone || "—")}
        ${infoRow("Turf", turfName)}
        ${infoRow("Date & Time", fmt(startTime))}
        ${infoRow("Ends At", fmtTime(endTime))}
        ${infoRow("Amount", `₹${fmtINR(amount)}`)}
      </table>
    `),
  });
};

const bookingRescheduled = async ({ playerEmail, playerName, turfName, startTime, endTime }) => {
  if (!playerEmail) return;
  await send({
    to: playerEmail,
    subject: `Booking Rescheduled — ${turfName}`,
    html: layout(`
      <h1 style="margin:0 0 4px;font-size:24px;font-weight:800;color:#0f172a;">Booking Rescheduled 🔄</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${playerName}, your booking has been moved.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${infoRow("Turf", turfName)}
        ${infoRow("New Date & Time", fmt(startTime))}
        ${infoRow("Ends At", fmtTime(endTime))}
      </table>
    `),
  });
};

const slotAvailable = async ({ playerEmail, playerName, turfName, startTime }) => {
  if (!playerEmail) return;
  await send({
    to: playerEmail,
    subject: `Slot Available — ${turfName}`,
    html: layout(`
      <h1 style="margin:0 0 4px;font-size:24px;font-weight:800;color:#0f172a;">Slot Just Opened Up! 🟢</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${playerName}, a slot you were waitlisted for is now available.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${infoRow("Turf", turfName)}
        ${infoRow("Slot", fmt(startTime))}
      </table>

      <p style="margin:0;font-size:13px;color:#64748b;">Book quickly before it fills up again!</p>
    `),
  });
};

module.exports = {
  bookingConfirmed,
  bookingCancelledByPlayer,
  bookingCancelledByOwner,
  newBookingOwnerAlert,
  bookingRescheduled,
  slotAvailable,
};
