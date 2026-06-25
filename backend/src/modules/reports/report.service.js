const prisma = require("../../config/prisma");

const REASONS = [
  "Fake or stock photos",
  "Venue doesn't exist",
  "Wrong location",
  "Misleading description",
  "Other",
];

const submitReport = async (turfId, reporterId, { reason, description }) => {
  if (!reason || !REASONS.includes(reason)) {
    throw new Error("Select a valid report reason.");
  }

  const turf = await prisma.turf.findUnique({ where: { id: turfId } });
  if (!turf) throw new Error("Turf not found.");

  // One pending report per player per turf
  const existing = await prisma.turfReport.findFirst({
    where: { turfId, reporterId, status: "PENDING" },
  });
  if (existing) throw new Error("You've already reported this listing. Our team will review it.");

  await prisma.turfReport.create({
    data: { turfId, reporterId, reason, description: description?.trim() || null },
  });

  return { message: "Report submitted. Our team will review this listing." };
};

const listReports = async ({ status = "PENDING", page = 1, limit = 20 } = {}) => {
  const where = status !== "ALL" ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [reports, total] = await prisma.$transaction([
    prisma.turfReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
      include: {
        turf: {
          select: {
            id: true,
            name: true,
            location: true,
            imageUrl: true,
            owner: { select: { id: true, name: true, email: true, ownerStatus: true } },
          },
        },
        reporter: { select: { id: true, name: true, email: true, phone: true } },
      },
    }),
    prisma.turfReport.count({ where }),
  ]);

  return { reports, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } };
};

const dismissReport = async (reportId) => {
  const report = await prisma.turfReport.findUnique({ where: { id: reportId } });
  if (!report) throw new Error("Report not found.");
  if (report.status !== "PENDING") throw new Error("Report already reviewed.");

  return prisma.turfReport.update({
    where: { id: reportId },
    data: { status: "DISMISSED" },
  });
};

const getPendingCount = () => prisma.turfReport.count({ where: { status: "PENDING" } });

module.exports = { submitReport, listReports, dismissReport, getPendingCount };
