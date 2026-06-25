const prisma = require("../../config/prisma");

const fmt = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const notify = (userId, type, title, body, bookingId = null) =>
  prisma.notification.create({ data: { userId, type, title, body, bookingId } });

// ── Triggers ────────────────────────────────────────────────

const notifyNewBooking = ({ ownerId, playerName, turfName, startTime, bookingId }) =>
  notify(
    ownerId,
    "NEW_BOOKING",
    "New booking",
    `${playerName} booked ${turfName} on ${fmt(startTime)}`,
    bookingId,
  );

const notifyBookingConfirmed = ({ playerId, turfName, startTime, bookingId }) =>
  notify(
    playerId,
    "BOOKING_CONFIRMED",
    "Booking confirmed",
    `You're booked at ${turfName} on ${fmt(startTime)}`,
    bookingId,
  );

const notifyPlayerCancelled = ({ ownerId, playerName, turfName, startTime, bookingId }) =>
  notify(
    ownerId,
    "BOOKING_CANCELLED_BY_PLAYER",
    "Booking cancelled",
    `${playerName} cancelled their booking at ${turfName} on ${fmt(startTime)}`,
    bookingId,
  );

const notifyOwnerCancelled = ({ playerId, turfName, startTime, bookingId }) =>
  notify(
    playerId,
    "BOOKING_CANCELLED_BY_OWNER",
    "Booking cancelled",
    `Your booking at ${turfName} on ${fmt(startTime)} was cancelled by the venue`,
    bookingId,
  );

// ── Read operations ─────────────────────────────────────────

const getNotifications = (userId) =>
  prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({ where: { userId, read: false } });
  return count;
};

const markAllRead = (userId) =>
  prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });

const markOneRead = (id, userId) =>
  prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });

const clearAll = (userId) =>
  prisma.notification.deleteMany({ where: { userId } });

module.exports = {
  notifyNewBooking,
  notifyBookingConfirmed,
  notifyPlayerCancelled,
  notifyOwnerCancelled,
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  clearAll,
};
