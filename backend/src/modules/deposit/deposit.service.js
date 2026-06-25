const crypto = require("crypto");
const prisma = require("../../config/prisma");
const razorpay = require("../../config/razorpay");

const DEPOSIT_FLAT = 99; // ₹99 flat deposit
const DEPOSIT_PERCENT = 0.1; // 10% of slot amount
const DEPOSIT_MAX = 200; // ₹200 cap

const calcDeposit = (slotAmount) => {
  const pct = Math.round(slotAmount * DEPOSIT_PERCENT);
  return Math.min(Math.max(pct, DEPOSIT_FLAT), DEPOSIT_MAX);
};

const createDepositOrder = async (bookingId, playerId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: { include: { turf: true } } },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.playerId !== playerId) throw new Error("Unauthorized");
  if (booking.status !== "CONFIRMED") throw new Error("Booking is not confirmed");
  if (booking.depositStatus === "PAID") throw new Error("Deposit already paid");

  const depositAmount = calcDeposit(booking.amount);

  // Reuse existing order if already created
  if (booking.depositOrderId) {
    return {
      bookingId: booking.id,
      depositAmount,
      order: { id: booking.depositOrderId, amount: depositAmount * 100, currency: "INR" },
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  const order = await razorpay.orders.create({
    amount: depositAmount * 100,
    currency: "INR",
    receipt: `dep_${booking.id.slice(0, 18)}`,
    notes: { bookingId: booking.id, type: "deposit" },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      depositAmount,
      depositOrderId: order.id,
      depositStatus: "PENDING",
    },
  });

  return {
    bookingId: booking.id,
    depositAmount,
    turf: booking.slot.turf,
    slot: { startTime: booking.slot.startTime, endTime: booking.slot.endTime },
    order: { id: order.id, amount: order.amount, currency: order.currency },
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

const verifyDepositPayment = async ({ bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature, playerId }) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) throw new Error("Booking not found");
  if (booking.playerId !== playerId) throw new Error("Unauthorized");
  if (booking.depositOrderId !== razorpayOrderId) throw new Error("Order ID mismatch");

  const generated = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generated !== razorpaySignature) throw new Error("Invalid payment signature");

  await prisma.booking.update({
    where: { id: bookingId },
    data: { depositPaymentId: razorpayPaymentId, depositStatus: "PAID" },
  });

  return { success: true };
};

// Owner marks attendance after slot time
const markAttendance = async (bookingId, ownerId, attended) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: { include: { turf: true } } },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.slot.turf.ownerId !== ownerId) throw new Error("Unauthorized");
  if (booking.status !== "CONFIRMED") throw new Error("Booking is not confirmed");
  if (booking.attendanceStatus) throw new Error("Attendance already marked");

  const now = new Date();
  if (new Date(booking.slot.endTime) > now) throw new Error("Slot has not ended yet");

  const status = attended ? "ATTENDED" : "NO_SHOW";
  let depositStatus = booking.depositStatus;

  if (booking.depositStatus === "PAID") {
    if (attended) {
      // Refund deposit — player pays rest at venue
      try {
        await razorpay.payments.refund(booking.depositPaymentId, {
          amount: Math.round(booking.depositAmount * 100),
          notes: { reason: "Player attended — deposit refunded" },
        });
        depositStatus = "REFUNDED";
      } catch (e) {
        // Log but don't block — manual refund fallback
        console.error("[deposit refund failed]", e.message);
      }
    } else {
      depositStatus = "FORFEITED";
    }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      attendanceStatus: status,
      attendanceMarkedAt: now,
      depositStatus,
      ...(status === "NO_SHOW" ? { status: "COMPLETED" } : {}),
    },
  });

  // No-show cooldown: 2 forfeits in 30 days → 7-day cooldown
  if (status === "NO_SHOW") {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentNoShows = await prisma.booking.count({
      where: {
        playerId: booking.playerId,
        attendanceStatus: "NO_SHOW",
        attendanceMarkedAt: { gte: thirtyDaysAgo },
      },
    });
    if (recentNoShows >= 2) {
      const cooldownUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: booking.playerId },
        data: { cooldownUntil, cooldownReason: "NO_SHOW" },
      });
    }
  }

  return { attended, depositStatus };
};

module.exports = { createDepositOrder, verifyDepositPayment, markAttendance, calcDeposit };
