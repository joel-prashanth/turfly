const prisma = require("../../config/prisma");
const notif = require("../notifications/notification.service");
const email = require("../email/email.service");

const joinWaitlist = async (playerId, slotId) => {
  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: { turf: { select: { name: true } } },
  });
  if (!slot) throw new Error("Slot not found.");
  if (slot.status === "AVAILABLE") throw new Error("Slot is already available — book it directly.");

  const existing = await prisma.waitlist.findUnique({
    where: { playerId_slotId: { playerId, slotId } },
  });
  if (existing) throw new Error("You are already on the waitlist for this slot.");

  await prisma.waitlist.create({ data: { playerId, slotId } });
  return { message: "Added to waitlist. We'll notify you if this slot opens up." };
};

const leaveWaitlist = async (playerId, slotId) => {
  const entry = await prisma.waitlist.findUnique({
    where: { playerId_slotId: { playerId, slotId } },
  });
  if (!entry) throw new Error("You are not on the waitlist for this slot.");
  await prisma.waitlist.delete({ where: { playerId_slotId: { playerId, slotId } } });
  return { message: "Removed from waitlist." };
};

const getMyWaitlist = async (playerId) => {
  return prisma.waitlist.findMany({
    where: { playerId },
    orderBy: { createdAt: "asc" },
    include: {
      slot: {
        include: { turf: { select: { id: true, name: true, location: true, sport: true } } },
      },
    },
  });
};

// Called by booking.service when a booking is cancelled — notifies waitlisted players
const notifyWaitlist = async (slotId) => {
  const entries = await prisma.waitlist.findMany({
    where: { slotId },
    include: {
      player: { select: { email: true, name: true } },
      slot: { include: { turf: { select: { name: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const entry of entries) {
    const slotTime = new Date(entry.slot.startTime).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
    });
    await notif.notify(
      entry.playerId,
      "SLOT_AVAILABLE",
      "Slot just opened up!",
      `A slot at ${entry.slot.turf.name} on ${slotTime} is now available. Book before it fills up.`,
      null,
    ).catch(() => {});

    email.slotAvailable({
      playerEmail: entry.player?.email,
      playerName: entry.player?.name,
      turfName: entry.slot.turf.name,
      startTime: entry.slot.startTime,
    }).catch(() => {});

    // Remove from waitlist once notified so they don't get re-notified
    await prisma.waitlist.delete({
      where: { playerId_slotId: { playerId: entry.playerId, slotId } },
    }).catch(() => {});
  }
};

module.exports = { joinWaitlist, leaveWaitlist, getMyWaitlist, notifyWaitlist };
