const prisma = require("../../config/prisma");

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateRevenue = (startTime, endTime, pricePerHour) => {
  const duration = (endTime.getTime() - startTime.getTime()) / MS_PER_HOUR;

  if (
    !Number.isFinite(duration) ||
    !Number.isFinite(pricePerHour) ||
    duration <= 0
  ) {
    return null;
  }

  return duration * pricePerHour;
};

const getRevenueAnalytics = async (ownerId, days = 7) => {
  // Allow between 1 and 365 days
  days = Number(days);

  if (!Number.isFinite(days)) {
    days = 7;
  }

  days = Math.max(1, Math.min(days, 365));

  const endDate = getEndOfDay(new Date());

  const startDate = getStartOfDay(
    new Date(endDate.getTime() - (days - 1) * MS_PER_DAY),
  );

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",

      slot: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },

        turf: {
          ownerId,
        },
      },
    },

    select: {
      slot: {
        select: {
          id: true,
          startTime: true,
          endTime: true,

          turf: {
            select: {
              pricePerHour: true,
            },
          },
        },
      },
    },
  });



  const revenueMap = {};

  // Initialize all dates with 0 revenue
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    revenueMap[getDateKey(currentDate)] = 0;
  }

  for (const booking of bookings) {
    const revenue = calculateRevenue(
      booking.slot.startTime,
      booking.slot.endTime,
      booking.slot.turf.pricePerHour,
    );

    if (revenue === null) {
      console.warn("Skipping invalid booking:", {
        slotId: booking.slot.id,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        pricePerHour: booking.slot.turf.pricePerHour,
      });

      continue;
    }

    const dateKey = getDateKey(booking.slot.startTime);

   

    if (!(dateKey in revenueMap)) {
      continue;
    }

    revenueMap[dateKey] += revenue;
  }



  return Object.entries(revenueMap).map(([date, amount]) => ({
    date,
    amount: Number(amount.toFixed(2)),
  }));
};

module.exports = {
  getRevenueAnalytics,
};
