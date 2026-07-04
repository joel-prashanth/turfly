const { Prisma } = require("@prisma/client");
const prisma = require("../../config/prisma");
const { releaseExpiredBookings } = require("./bookingLifecycle.service");
const notif = require("../notifications/notification.service");
const waitlistService = require("../waitlist/waitlist.service");
const email = require("../email/email.service");

const PAYMENT_HOLD_MINUTES = 10;

const calculateSlotAmount = (startTime, endTime, pricePerHour) => {
  const durationHours =
    (new Date(endTime).getTime() - new Date(startTime).getTime()) /
    1000 /
    60 /
    60;

  return Math.round(durationHours * Number(pricePerHour || 0));
};

const getPaymentHoldExpiry = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - PAYMENT_HOLD_MINUTES);
  return date;
};

const releaseExpiredPendingBookings = async () => {
  const expiredBefore = getPaymentHoldExpiry();

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: expiredBefore,
      },
      slot: {
        status: "RESERVED",
      },
      payment: {
        status: "PENDING",
      },
    },
    select: {
      id: true,
      slotId: true,
    },
  });

  if (expiredBookings.length === 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const booking of expiredBookings) {
      await tx.payment.updateMany({
        where: {
          bookingId: booking.id,
          status: "PENDING",
        },
        data: {
          status: "FAILED",
          failureReason: "Payment hold expired",
        },
      });

      await tx.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          status: "CANCELLED",
        },
      });

      await tx.slot.update({
        where: {
          id: booking.slotId,
        },
        data: {
          status: "AVAILABLE",
        },
      });
    }
  });
};

const createBooking = async (slotIds, playerId) => {
  if (!slotIds || (Array.isArray(slotIds) && slotIds.length === 0)) {
    throw new Error("At least one slot is required");
  }
  // Accept both a single id (legacy) and an array
  const ids = Array.isArray(slotIds) ? slotIds : [slotIds];
  if (ids.length > 3) throw new Error("You can book at most 3 slots at a time");

  await releaseExpiredBookings();
  await releaseExpiredPendingBookings();

  const player = await prisma.user.findUnique({ where: { id: playerId } });
  if (!player) throw new Error("Player not found");
  if (player.role !== "PLAYER") throw new Error("Only players can book slots");

  if (player.cooldownUntil && player.cooldownUntil > new Date()) {
    const until = new Date(player.cooldownUntil).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
    const reason = player.cooldownReason === "NO_SHOW"
      ? "repeated no-shows" : "repeated late cancellations";
    throw new Error(
      `Your account is on a booking cooldown due to ${reason}. You can book again after ${until}.`,
    );
  }

  const bookingId = await prisma.$transaction(
    async (tx) => {
      // Fetch all requested slots
      const slots = await tx.slot.findMany({
        where: { id: { in: ids } },
        include: { turf: { select: { id: true, name: true, pricePerHour: true, ownerId: true } } },
        orderBy: { startTime: "asc" },
      });

      if (slots.length !== ids.length) throw new Error("One or more slots not found");

      // All must belong to the same turf
      const turfIds = [...new Set(slots.map((s) => s.turfId))];
      if (turfIds.length > 1) throw new Error("All slots must be from the same turf");

      // Validate each slot
      const now = new Date();
      for (const slot of slots) {
        if (slot.startTime <= now) throw new Error("Bookings close once a slot begins");
        if (slot.status === "BLOCKED") throw new Error(`Slot ${formatTime(slot.startTime)} has been blocked by the venue`);
        if (slot.status === "BOOKED") throw new Error(`Slot ${formatTime(slot.startTime)} is already booked`);

        const activeCount = await tx.booking.count({
          where: { slotId: slot.id, status: { in: ["PENDING", "CONFIRMED"] } },
        });
        if (activeCount >= 1) throw new Error(`Slot ${formatTime(slot.startTime)} is already taken`);

        const alreadyBooked = await tx.booking.findFirst({
          where: { slotId: slot.id, playerId, status: { in: ["PENDING", "CONFIRMED"] } },
        });
        if (alreadyBooked) throw new Error("You have already booked one of these slots");
      }

      // Slots must be consecutive (endTime[i] === startTime[i+1])
      for (let i = 0; i < slots.length - 1; i++) {
        if (slots[i].endTime.getTime() !== slots[i + 1].startTime.getTime()) {
          throw new Error("Selected slots must be consecutive");
        }
      }

      const turf = slots[0].turf;
      const primarySlot = slots[0];
      const extraSlots = slots.slice(1);

      const totalAmount = slots.reduce((sum, s) =>
        sum + calculateSlotAmount(s.startTime, s.endTime, turf.pricePerHour), 0,
      );

      const newBooking = await tx.booking.create({
        data: {
          slotId: primarySlot.id,
          playerId,
          status: "CONFIRMED",
          amount: totalAmount,
        },
      });

      // Store extra slots in the join table
      if (extraSlots.length > 0) {
        await tx.bookingSlot.createMany({
          data: extraSlots.map((s) => ({
            bookingId: newBooking.id,
            slotId: s.id,
            amount: calculateSlotAmount(s.startTime, s.endTime, turf.pricePerHour),
          })),
        });
      }

      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          status: "PENDING",
          provider: "RAZORPAY",
          amount: totalAmount * 100,
          currency: "INR",
        },
      });

      // Mark all slots as BOOKED
      await tx.slot.updateMany({
        where: { id: { in: ids } },
        data: { status: "BOOKED" },
      });

      return newBooking.id;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 10000 },
  );

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payment: true,
      player: { select: { id: true, name: true, email: true, phone: true } },
      extraSlots: { include: { slot: true }, orderBy: { slot: { startTime: "asc" } } },
      slot: {
        include: {
          turf: { include: { owner: { select: { id: true, name: true, email: true } } } },
        },
      },
    },
  });

  const endTime = booking.extraSlots.length > 0
    ? booking.extraSlots[booking.extraSlots.length - 1].slot.endTime
    : booking.slot.endTime;

  notif.notifyBookingConfirmed({
    playerId: booking.player.id,
    turfName: booking.slot.turf.name,
    startTime: booking.slot.startTime,
    bookingId: booking.id,
  }).catch(() => {});

  notif.notifyNewBooking({
    ownerId: booking.slot.turf.owner.id,
    playerName: booking.player.name,
    turfName: booking.slot.turf.name,
    startTime: booking.slot.startTime,
    bookingId: booking.id,
  }).catch(() => {});

  // Emails (non-blocking)
  email.bookingConfirmed({
    playerEmail: booking.player.email,
    playerName: booking.player.name,
    turfName: booking.slot.turf.name,
    location: booking.slot.turf.location,
    startTime: booking.slot.startTime,
    endTime,
    amount: booking.amount,
  }).catch(() => {});

  email.newBookingOwnerAlert({
    ownerEmail: booking.slot.turf.owner.email,
    ownerName: booking.slot.turf.owner.name,
    playerName: booking.player.name,
    playerPhone: booking.player.phone,
    turfName: booking.slot.turf.name,
    startTime: booking.slot.startTime,
    endTime,
    amount: booking.amount,
  }).catch(() => {});

  return booking;
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const getMyBookings = async (playerId) => {
  await releaseExpiredBookings();
  await releaseExpiredPendingBookings();

  return prisma.booking.findMany({
    where: {
      playerId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      payment: true,
      review: { select: { id: true, rating: true } },
      extraSlots: {
        include: { slot: { select: { id: true, startTime: true, endTime: true } } },
        orderBy: { slot: { startTime: "asc" } },
      },
      slot: {
        include: {
          turf: {
            select: {
              id: true,
              name: true,
              description: true,
              location: true,
              sport: true,
              pricePerHour: true,
              imageUrl: true,
              isActive: true,
              owner: {
                select: { id: true, name: true, phone: true, paymentQrUrl: true },
              },
              cancellationWindowHours: true,
            },
          },
        },
      },
    },
  });
};

const cancelBooking = async (bookingId, playerId) => {
  await releaseExpiredBookings();
  await releaseExpiredPendingBookings();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      player: { select: { name: true, email: true } },
      extraSlots: { select: { slotId: true } },
      slot: {
        include: {
          turf: {
            select: {
              cancellationWindowHours: true,
              name: true,
              owner: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.playerId !== playerId) {
    throw new Error("You are not authorized to cancel this booking");
  }

  if (booking.status === "CANCELLED") {
    throw new Error("Booking is already cancelled");
  }

  if (booking.status === "COMPLETED") {
    throw new Error("Completed bookings cannot be cancelled");
  }

  const windowHours = booking.slot.turf.cancellationWindowHours;
  const windowMs = windowHours * 60 * 60 * 1000;
  const now = new Date();
  const isLateCancellation =
    now.getTime() + windowMs > new Date(booking.slot.startTime).getTime();

  if (isLateCancellation) {
    throw new Error(
      `Cancellations must be made at least ${windowHours} hour${windowHours === 1 ? "" : "s"} before the slot starts.`,
    );
  }

  // Determine if this is a "late-ish" cancellation for cooldown tracking:
  // within 24h of slot start counts as a strike regardless of the venue window.
  const LATE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
  const isStrikeCancellation =
    now.getTime() + LATE_THRESHOLD_MS >
    new Date(booking.slot.startTime).getTime();

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", cancelledAt: now },
    });

    if (booking.payment?.status === "PENDING") {
      await tx.payment.update({
        where: { bookingId },
        data: { status: "FAILED", failureReason: "Booking cancelled by player" },
      });
    }

    // Release all slots (primary + extras)
    const extraSlotIds = booking.extraSlots?.map((e) => e.slotId) ?? [];
    const allSlotIds = [booking.slotId, ...extraSlotIds];
    await tx.slot.updateMany({
      where: { id: { in: allSlotIds } },
      data: { status: "AVAILABLE" },
    });

    if (isStrikeCancellation) {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentStrikes = await tx.booking.count({
        where: {
          playerId,
          status: "CANCELLED",
          cancelledAt: { gte: thirtyDaysAgo },
          slot: {
            startTime: {
              gt: new Date(now.getTime() - LATE_THRESHOLD_MS),
            },
          },
        },
      });

      // 3 strikes in 30 days → 7-day cooldown
      if (recentStrikes >= 2) {
        const cooldownUntil = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000,
        );
        await tx.user.update({
          where: { id: playerId },
          data: { cooldownUntil, cooldownReason: "LATE_CANCELLATION" },
        });
      }
    }
  });

  // Notify both sides (non-blocking)
  if (booking.playerId) {
    notif.notifyPlayerCancelled({
      ownerId: booking.slot.turf.owner.id,
      playerName: booking.player.name,
      turfName: booking.slot.turf.name,
      startTime: booking.slot.startTime,
      bookingId,
    }).catch(() => {});

    notif.notifyBookingCancelled({
      playerId: booking.playerId,
      turfName: booking.slot.turf.name,
      startTime: booking.slot.startTime,
      bookingId,
    }).catch(() => {});

    email.bookingCancelledByPlayer({
      ownerEmail: booking.slot.turf.owner.email,
      ownerName: booking.slot.turf.owner.name,
      playerName: booking.player.name,
      turfName: booking.slot.turf.name,
      startTime: booking.slot.startTime,
    }).catch(() => {});
  }

  // Notify waitlisted players that the slot is now free
  waitlistService.notifyWaitlist(booking.slotId).catch(() => {});

  return { message: "Booking cancelled successfully" };
};

const getOwnerBookings = async (ownerId, query) => {
  await releaseExpiredBookings();
  await releaseExpiredPendingBookings();

  const { page = 1, limit = 10, search = "", status = "ALL" } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    slot: {
      turf: {
        ownerId,
      },
    },
  };

  if (status !== "ALL") {
    if (status === "UPCOMING") {
      where.status = "CONFIRMED";
    } else {
      where.status = status;
    }
  }

  if (search.trim()) {
    where.OR = [
      {
        player: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        player: {
          phone: {
            contains: search,
          },
        },
      },
      {
        slot: {
          turf: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where,

      skip,

      take: Number(limit),

      orderBy: {
        createdAt: "desc",
      },

      include: {
        payment: true,

        player: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },

        slot: {
          include: {
            turf: {
              select: {
                id: true,
                name: true,
                location: true,
                sport: true,
                pricePerHour: true,
                owner: {
                  select: { createdAt: true },
                },
              },
            },
          },
        },
      },
    }),

    prisma.booking.count({
      where,
    }),
  ]);

  return {
    bookings,

    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

const ownerCancelBooking = async (bookingId, ownerId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slot: {
        include: {
          turf: { select: { ownerId: true, name: true } },
        },
      },
    },
  });

  if (!booking) throw new Error("Booking not found");
  if (!booking.slot) throw new Error("Booking slot not found");
  if (booking.slot.turf.ownerId !== ownerId)
    throw new Error("You are not authorized to cancel this booking");
  if (booking.status === "CANCELLED")
    throw new Error("Booking is already cancelled");
  if (booking.status === "COMPLETED")
    throw new Error("Completed bookings cannot be cancelled");

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", cancelledAt: now },
    });

    if (booking.slot.isWalkIn) {
      // Restore any slots that were blocked by this walk-in
      await tx.slot.updateMany({
        where: { walkInSlotId: booking.slotId },
        data: { status: "AVAILABLE", walkInSlotId: null },
      });
      // Delete the custom walk-in slot
      await tx.slot.delete({ where: { id: booking.slotId } });
    } else {
      const remainingCount = await tx.booking.count({
        where: {
          slotId: booking.slotId,
          id: { not: booking.id },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: "AVAILABLE" },
      });
    }
  });

  // Notify player if this was a platform booking
  if (booking.playerId) {
    notif.notifyOwnerCancelled({
      playerId: booking.playerId,
      turfName: booking.slot.turf.name,
      startTime: booking.slot.startTime,
      bookingId,
    }).catch(() => {});

    email.bookingCancelledByOwner({
      playerEmail: booking.player?.email,
      playerName: booking.player?.name,
      turfName: booking.slot.turf.name,
      startTime: booking.slot.startTime,
    }).catch(() => {});
  }

  return { message: "Booking cancelled by venue owner." };
};

const getExtendOptions = async (bookingId, playerId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slot: {
        include: {
          turf: { select: { id: true, name: true, pricePerHour: true } },
        },
      },
    },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.playerId !== playerId) throw new Error("Unauthorized");
  if (booking.status !== "CONFIRMED") throw new Error("Only confirmed bookings can be extended");

  const now = new Date();
  if (new Date(booking.slot.startTime) > now) throw new Error("Session has not started yet");
  if (new Date(booking.slot.endTime) < now) throw new Error("Session has already ended");

  const turfId = booking.slot.turfId;
  const capacity = booking.slot.turf.capacity;

  // Find up to 2 consecutive available slots starting from current slot's endTime
  const slots = [];
  let searchFrom = new Date(booking.slot.endTime);

  for (let i = 0; i < 2; i++) {
    const next = await prisma.slot.findFirst({
      where: {
        turfId,
        startTime: searchFrom,
        status: { in: ["AVAILABLE", "RESERVED"] },
      },
    });

    if (!next) break;

    // Check if not full
    const activeCount = await prisma.booking.count({
      where: { slotId: next.id, status: { in: ["PENDING", "CONFIRMED"] } },
    });

    if (activeCount >= capacity) break;

    // Check player hasn't already booked this slot
    const alreadyBooked = await prisma.booking.findFirst({
      where: { slotId: next.id, playerId, status: { in: ["PENDING", "CONFIRMED"] } },
    });

    if (alreadyBooked) break;

    slots.push({
      id: next.id,
      startTime: next.startTime,
      endTime: next.endTime,
      amount: Math.round(
        ((new Date(next.endTime) - new Date(next.startTime)) / 3600000) *
          Number(booking.slot.turf.pricePerHour),
      ),
    });

    searchFrom = new Date(next.endTime);
  }

  return {
    currentSlot: booking.slot,
    turf: booking.slot.turf,
    options: slots,
  };
};

const createManualBooking = async (ownerId, { turfId, walkInName, walkInPhone, startTime, endTime }) => {
  if (!walkInName?.trim()) throw new Error("Walk-in player name is required");
  if (!walkInPhone?.trim()) throw new Error("Walk-in player phone is required");
  if (!startTime || !endTime) throw new Error("Start time and end time are required");

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start) || isNaN(end)) throw new Error("Invalid time range");
  if (end <= start) throw new Error("End time must be after start time");

  const turf = await prisma.turf.findUnique({ where: { id: turfId } });
  if (!turf) throw new Error("Turf not found");
  if (turf.ownerId !== ownerId) throw new Error("Not authorized");

  // Find all existing slots that overlap the requested time range
  const overlapping = await prisma.slot.findMany({
    where: {
      turfId,
      startTime: { lt: end },
      endTime: { gt: start },
      isWalkIn: false,
    },
    include: {
      bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } }, select: { id: true } },
    },
  });

  // Reject if any overlapping slot already has active bookings
  const conflict = overlapping.find((s) => s.bookings.length > 0);
  if (conflict) {
    const t = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    throw new Error(
      `Slot ${t(conflict.startTime)}–${t(conflict.endTime)} already has an active booking. Cancel it first.`
    );
  }

  const amount = calculateSlotAmount(start, end, turf.pricePerHour);

  await prisma.$transaction(async (tx) => {
    // Create the custom walk-in slot
    const walkInSlot = await tx.slot.create({
      data: { turfId, startTime: start, endTime: end, status: "BOOKED", isWalkIn: true },
    });

    // Block each overlapping slot and tag it with the walk-in slot id so we can unblock later
    for (const s of overlapping) {
      await tx.slot.update({
        where: { id: s.id },
        data: { status: "BLOCKED", walkInSlotId: walkInSlot.id },
      });
    }

    // Create the booking against the walk-in slot
    await tx.booking.create({
      data: {
        slotId: walkInSlot.id,
        playerId: null,
        walkInName: walkInName.trim(),
        walkInPhone: walkInPhone.trim(),
        status: "CONFIRMED",
        source: "OWNER_MANUAL",
        amount,
      },
    });
  });

  return { message: "Walk-in booking created successfully" };
};

const rescheduleBooking = async (bookingId, newSlotId, playerId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slot: {
        include: {
          turf: {
            select: {
              id: true,
              name: true,
              cancellationWindowHours: true,
              owner: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.playerId !== playerId) throw new Error("Not authorized to reschedule this booking");
  if (booking.status !== "CONFIRMED") throw new Error("Only confirmed bookings can be rescheduled");

  const windowHours = booking.slot.turf.cancellationWindowHours;
  const now = new Date();
  const withinWindow =
    now.getTime() + windowHours * 3600000 > new Date(booking.slot.startTime).getTime();
  if (withinWindow) {
    throw new Error(
      windowHours === 0
        ? "This venue does not allow rescheduling"
        : `Cannot reschedule within ${windowHours}h of the slot start time`,
    );
  }

  const newSlot = await prisma.slot.findUnique({ where: { id: newSlotId } });
  if (!newSlot) throw new Error("New slot not found");
  if (newSlot.turfId !== booking.slot.turf.id) throw new Error("New slot must be at the same turf");
  if (newSlot.startTime <= now) throw new Error("New slot has already started");
  if (newSlot.status === "BLOCKED") throw new Error("That slot has been blocked by the venue");
  if (newSlot.status === "BOOKED") throw new Error("That slot is already booked");

  const taken = await prisma.booking.count({
    where: { slotId: newSlotId, status: { in: ["PENDING", "CONFIRMED"] } },
  });
  if (taken >= 1) throw new Error("That slot is already taken");

  const newAmount = calculateSlotAmount(newSlot.startTime, newSlot.endTime, booking.slot.turf.pricePerHour ?? 0);

  await prisma.$transaction(async (tx) => {
    // Release old slot
    await tx.slot.update({ where: { id: booking.slotId }, data: { status: "AVAILABLE" } });
    // Reserve new slot
    await tx.slot.update({ where: { id: newSlotId }, data: { status: "BOOKED" } });
    // Update booking
    await tx.booking.update({
      where: { id: bookingId },
      data: { slotId: newSlotId, amount: newAmount },
    });
  });

  notif.notifyBookingRescheduled({
    playerId,
    turfName: booking.slot.turf.name,
    startTime: newSlot.startTime,
    bookingId,
  }).catch(() => {});

  email.bookingRescheduled({
    playerEmail: booking.player?.email,
    playerName: booking.player?.name,
    turfName: booking.slot.turf.name,
    startTime: newSlot.startTime,
    endTime: newSlot.endTime,
  }).catch(() => {});

  return { message: "Booking rescheduled successfully" };
};

const markAttendance = async (bookingId, ownerId, status) => {
  if (!["ATTENDED", "NO_SHOW"].includes(status)) {
    throw new Error("Status must be ATTENDED or NO_SHOW.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slot: { include: { turf: { select: { ownerId: true, name: true } } } },
      player: { select: { id: true, name: true } },
    },
  });

  if (!booking) throw new Error("Booking not found.");
  if (booking.slot.turf.ownerId !== ownerId) throw new Error("Not your booking.");
  if (!["CONFIRMED", "COMPLETED"].includes(booking.status)) {
    throw new Error("Can only mark attendance on confirmed or completed bookings.");
  }
  if (new Date(booking.slot.startTime) > new Date()) {
    throw new Error("Slot hasn't started yet.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { attendanceStatus: status, attendanceMarkedAt: new Date() },
    });

    if (status === "NO_SHOW" && booking.playerId) {
      // Count no-shows in last 30 days for this player
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentNoShows = await tx.booking.count({
        where: {
          playerId: booking.playerId,
          attendanceStatus: "NO_SHOW",
          attendanceMarkedAt: { gt: since },
        },
      });

      // 2+ no-shows in 30 days → 7-day cooldown
      if (recentNoShows >= 2) {
        const cooldownUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await tx.user.update({
          where: { id: booking.playerId },
          data: { cooldownUntil, cooldownReason: "NO_SHOW" },
        });
      }
    }
  });

  return { message: `Marked as ${status}.` };
};

module.exports = {
  createBooking,
  createManualBooking,
  getMyBookings,
  cancelBooking,
  ownerCancelBooking,
  getOwnerBookings,
  getExtendOptions,
  rescheduleBooking,
  markAttendance,
  releaseExpiredPendingBookings,
  calculateSlotAmount,
};
