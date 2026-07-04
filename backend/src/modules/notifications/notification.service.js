const prisma = require("../../config/prisma");

const fmt = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const PREF_MAP = {
  NEW_BOOKING:                 "notifyNewBooking",
  BOOKING_CONFIRMED:           "notifyNewBooking",
  BOOKING_RESCHEDULED:         "notifyNewBooking",
  BOOKING_CANCELLED:           "notifyCancellation",
  BOOKING_CANCELLED_BY_PLAYER: "notifyCancellation",
  BOOKING_CANCELLED_BY_OWNER:  "notifyCancellation",
  SLOT_AVAILABLE:              "notifyNewBooking",
};

const notify = async (userId, type, title, body, bookingId = null) => {
  const prefKey = PREF_MAP[type];
  if (prefKey) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { [prefKey]: true },
    });
    if (!user || user[prefKey] === false) return;
  }
  return prisma.notification.create({ data: { userId, type, title, body, bookingId } });
};

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
    "Booking cancelled by venue",
    `Your booking at ${turfName} on ${fmt(startTime)} was cancelled by the venue`,
    bookingId,
  );

const notifyBookingCancelled = ({ playerId, turfName, startTime, bookingId }) =>
  notify(
    playerId,
    "BOOKING_CANCELLED",
    "Booking cancelled",
    `Your booking at ${turfName} on ${fmt(startTime)} has been cancelled`,
    bookingId,
  );

const notifyBookingRescheduled = ({ playerId, turfName, startTime, bookingId }) =>
  notify(
    playerId,
    "BOOKING_RESCHEDULED",
    "Booking rescheduled",
    `Your booking at ${turfName} has been moved to ${fmt(startTime)}`,
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
  notifyBookingCancelled,
  notifyBookingRescheduled,
  notifyPlayerCancelled,
  notifyOwnerCancelled,
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  clearAll,
};
