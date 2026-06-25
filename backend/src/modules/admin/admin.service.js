const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
// const email = require("../email/email.service");

const OWNER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  avatarUrl: true,
  businessName: true,
  gstNumber: true,
  upiId: true,
  paymentQrUrl: true,
  ownerStatus: true,
  ownerStatusReason: true,
  verificationDocUrl: true,
  verificationDocPublicId: true,
  verificationDocType: true,
  createdAt: true,
};

const listOwners = async ({ status = "ALL", search = "", page = 1, limit = 20 } = {}) => {
  const where = { role: "OWNER" };

  if (status !== "ALL") {
    where.ownerStatus = status;
  }

  if (search.trim()) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { businessName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [owners, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        ...OWNER_SELECT,
        _count: {
          select: {
            turfs: true,
            bookings: false,
          },
        },
        turfs: {
          select: { id: true, isActive: true },
        },
      },
      orderBy: [
        { ownerStatus: "asc" }, // PENDING_REVIEW first alphabetically
        { createdAt: "desc" },
      ],
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);

  const enriched = owners.map((o) => ({
    ...o,
    turfCount: o.turfs.length,
    activeTurfCount: o.turfs.filter((t) => t.isActive).length,
    turfs: undefined,
    _count: undefined,
  }));

  return {
    owners: enriched,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

const getOwnerDetail = async (ownerId) => {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: {
      ...OWNER_SELECT,
      turfs: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          sport: true,
          location: true,
          pricePerHour: true,
          isActive: true,
          imageUrl: true,
          createdAt: true,
          _count: {
            select: { slots: true },
          },
          slots: {
            select: {
              _count: {
                select: {
                  bookings: { where: { status: "CONFIRMED" } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!owner || owner.role !== "OWNER") {
    throw new Error("Owner not found");
  }

  // Recent bookings across all their turfs
  const recentBookings = await prisma.booking.findMany({
    where: {
      slot: { turf: { ownerId } },
      status: { in: ["CONFIRMED", "CANCELLED", "COMPLETED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      status: true,
      amount: true,
      createdAt: true,
      walkInName: true,
      walkInPhone: true,
      player: { select: { id: true, name: true, phone: true } },
      slot: {
        select: {
          startTime: true,
          endTime: true,
          turf: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Platform stats for this owner
  const [totalBookings, confirmedBookings] = await prisma.$transaction([
    prisma.booking.count({ where: { slot: { turf: { ownerId } } } }),
    prisma.booking.count({
      where: { slot: { turf: { ownerId } }, status: "CONFIRMED" },
    }),
  ]);

  return {
    ...owner,
    turfs: owner.turfs.map((t) => ({
      ...t,
      slotCount: t._count.slots,
      confirmedBookings: t.slots.reduce((sum, s) => sum + s._count.bookings, 0),
      slots: undefined,
      _count: undefined,
    })),
    recentBookings,
    stats: { totalBookings, confirmedBookings },
  };
};

const approveOwner = async (ownerId) => {
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner || owner.role !== "OWNER") throw new Error("Owner not found");
  if (owner.ownerStatus === "ACTIVE") throw new Error("Owner is already active");

  const updated = await prisma.user.update({
    where: { id: ownerId },
    data: { ownerStatus: "ACTIVE", ownerStatusReason: null },
    select: OWNER_SELECT,
  });
  return updated;
};

const rejectOwner = async (ownerId, reason) => {
  if (!reason?.trim()) throw new Error("Rejection reason is required");
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner || owner.role !== "OWNER") throw new Error("Owner not found");

  const updated = await prisma.user.update({
    where: { id: ownerId },
    data: { ownerStatus: "SUSPENDED", ownerStatusReason: reason.trim() },
    select: OWNER_SELECT,
  });
  return updated;
};

const suspendOwner = async (ownerId, reason) => {
  if (!reason?.trim()) throw new Error("Suspension reason is required");
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner || owner.role !== "OWNER") throw new Error("Owner not found");
  if (owner.ownerStatus === "SUSPENDED") throw new Error("Owner is already suspended");

  const updated = await prisma.user.update({
    where: { id: ownerId },
    data: { ownerStatus: "SUSPENDED", ownerStatusReason: reason.trim() },
    select: OWNER_SELECT,
  });
  return updated;
};

const reactivateOwner = async (ownerId) => {
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner || owner.role !== "OWNER") throw new Error("Owner not found");
  if (owner.ownerStatus === "ACTIVE") throw new Error("Owner is already active");

  return prisma.user.update({
    where: { id: ownerId },
    data: { ownerStatus: "ACTIVE", ownerStatusReason: null },
    select: OWNER_SELECT,
  });
};

const getPlatformStats = async () => {
  const [
    totalOwners,
    pendingOwners,
    activeOwners,
    suspendedOwners,
    totalPlayers,
    totalTurfs,
    activeTurfs,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    pendingReports,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { role: "OWNER" } }),
    prisma.user.count({ where: { role: "OWNER", ownerStatus: "PENDING_REVIEW" } }),
    prisma.user.count({ where: { role: "OWNER", ownerStatus: "ACTIVE" } }),
    prisma.user.count({ where: { role: "OWNER", ownerStatus: "SUSPENDED" } }),
    prisma.user.count({ where: { role: "PLAYER" } }),
    prisma.turf.count(),
    prisma.turf.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.turfReport.count({ where: { status: "PENDING" } }),
  ]);

  return {
    owners: { total: totalOwners, pending: pendingOwners, active: activeOwners, suspended: suspendedOwners },
    players: { total: totalPlayers },
    turfs: { total: totalTurfs, active: activeTurfs },
    bookings: { total: totalBookings, confirmed: confirmedBookings, cancelled: cancelledBookings },
    reports: { pending: pendingReports },
  };
};

const setupAdmin = async ({ name, email, phone, password, setupKey }) => {
  if (!name || !email || !phone || !password || !setupKey) {
    throw new Error("All fields are required.");
  }

  const expectedKey = process.env.ADMIN_SETUP_SECRET;
  if (!expectedKey) {
    throw new Error("Admin setup is not configured on this server.");
  }
  if (setupKey !== expectedKey) {
    throw new Error("Invalid setup key.");
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existingAdmin) {
    throw new Error("Admin account already exists. Setup is locked.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use.");

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) throw new Error("Enter a valid 10-digit mobile number.");

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "ADMIN" },
  });

  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
};

module.exports = {
  setupAdmin,
  listOwners,
  getOwnerDetail,
  approveOwner,
  rejectOwner,
  suspendOwner,
  reactivateOwner,
  getPlatformStats,
};
