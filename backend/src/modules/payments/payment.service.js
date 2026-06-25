const crypto = require("crypto");

const prisma = require("../../config/prisma");
const razorpay = require("../../config/razorpay");

const createRazorpayOrder = async (bookingId, playerId) => {
  if (!bookingId) {
    throw new Error("Booking id is required");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      slot: {
        include: {
          turf: true,
        },
      },
      payment: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.playerId !== playerId) {
    throw new Error("You are not authorized to pay for this booking");
  }

  if (booking.status !== "PENDING") {
    throw new Error("Only pending bookings can be paid");
  }

  if (!booking.payment) {
    throw new Error("Payment record not found for this booking");
  }

  if (booking.payment.status !== "PENDING") {
    throw new Error("Payment is not pending");
  }

  if (booking.slot.status !== "RESERVED") {
    throw new Error("Slot is no longer reserved");
  }

  if (booking.payment.razorpayOrderId) {
    return {
      booking: {
        id: booking.id,
        status: booking.status,
        amount: booking.amount,
        turf: booking.slot.turf,
        slot: {
          id: booking.slot.id,
          startTime: booking.slot.startTime,
          endTime: booking.slot.endTime,
          status: booking.slot.status,
        },
      },
      payment: booking.payment,
      order: {
        id: booking.payment.razorpayOrderId,
        amount: booking.payment.amount,
        currency: booking.payment.currency,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  const order = await razorpay.orders.create({
    amount: booking.payment.amount,
    currency:
      booking.payment.currency || process.env.RAZORPAY_CURRENCY || "INR",
    receipt: `bk_${booking.id.slice(0, 20)}`,
    notes: {
      bookingId: booking.id,
      playerId: booking.playerId,
      slotId: booking.slotId,
      turfId: booking.slot.turfId,
    },
  });

  const updatedPayment = await prisma.payment.update({
    where: {
      id: booking.payment.id,
    },
    data: {
      razorpayOrderId: order.id,
    },
  });

  return {
    booking: {
      id: booking.id,
      status: booking.status,
      amount: booking.amount,
      turf: booking.slot.turf,
      slot: {
        id: booking.slot.id,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        status: booking.slot.status,
      },
    },
    payment: updatedPayment,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    },
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

const verifyRazorpayPayment = async ({
  bookingId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  playerId,
}) => {
  if (
    !bookingId ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    throw new Error("Payment verification details are required");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      slot: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.playerId !== playerId) {
    throw new Error("You are not authorized to verify this payment");
  }

  if (booking.status !== "PENDING") {
    throw new Error("Only pending bookings can be verified");
  }

  if (!booking.payment) {
    throw new Error("Payment record not found");
  }

  if (booking.payment.status !== "PENDING") {
    throw new Error("Payment is not pending");
  }

  if (booking.payment.razorpayOrderId !== razorpayOrderId) {
    throw new Error("Invalid Razorpay order id");
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const isValidSignature = generatedSignature === razorpaySignature;

  if (!isValidSignature) {
    await prisma.payment.update({
      where: {
        id: booking.payment.id,
      },
      data: {
        status: "FAILED",
        failureReason: "Invalid payment signature",
      },
    });

    throw new Error("Invalid payment signature");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: {
        id: booking.payment.id,
      },
      data: {
        status: "PAID",
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    const updatedBooking = await tx.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: "CONFIRMED",
      },
      include: {
        slot: {
          include: {
            turf: true,
          },
        },
        payment: true,
      },
    });

    await tx.slot.update({
      where: {
        id: booking.slotId,
      },
      data: {
        status: "BOOKED",
      },
    });

    return {
      booking: updatedBooking,
      payment: updatedPayment,
    };
  });

  return result;
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
