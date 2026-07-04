const prisma = require("../../config/prisma");

const createReview = async (playerId, { bookingId, rating, comment }) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: { select: { turfId: true } } },
  });

  if (!booking) throw new Error("Booking not found.");
  if (booking.playerId !== playerId) throw new Error("Not your booking.");
  if (booking.status !== "COMPLETED") throw new Error("Can only review completed bookings.");
  if (booking.review) throw new Error("You have already reviewed this booking.");

  return prisma.review.create({
    data: {
      bookingId,
      turfId: booking.slot.turfId,
      playerId,
      rating,
      comment: comment?.trim() || null,
    },
    include: { player: { select: { name: true, avatarUrl: true } } },
  });
};

const getTurfReviews = async (turfId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: { turfId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { player: { select: { name: true, avatarUrl: true } } },
    }),
    prisma.review.count({ where: { turfId } }),
  ]);

  const agg = await prisma.review.aggregate({
    where: { turfId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
    totalRatings: agg._count.rating,
  };
};

const getOwnerReviews = async (ownerId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: { turf: { ownerId } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        player: { select: { name: true, avatarUrl: true } },
        turf: { select: { name: true } },
      },
    }),
    prisma.review.count({ where: { turf: { ownerId } } }),
  ]);

  return { reviews, total, page, totalPages: Math.ceil(total / limit) };
};

const replyToReview = async (reviewId, ownerId, reply) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { turf: { select: { ownerId: true } } },
  });
  if (!review) throw new Error("Review not found.");
  if (review.turf.ownerId !== ownerId) throw new Error("Not your turf.");

  return prisma.review.update({
    where: { id: reviewId },
    data: { ownerReply: reply.trim(), ownerRepliedAt: new Date() },
  });
};

module.exports = { createReview, getTurfReviews, getOwnerReviews, replyToReview };
