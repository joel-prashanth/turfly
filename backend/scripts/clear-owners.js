/**
 * Turfly — Clear Owner Accounts
 *
 * Deletes all owner accounts and everything they own
 * (turfs, slots, bookings, payments, reports).
 *
 * Usage:
 *   npm run clear:owners
 */

const { PrismaClient } = require("@prisma/client");
const readline = require("readline");

const prisma = new PrismaClient();

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((r) => rl.question(q, (a) => { rl.close(); r(a.trim().toLowerCase()); }));
}

async function main() {
  const owners = await prisma.user.findMany({
    where: { role: "OWNER" },
    select: { id: true, name: true, email: true },
  });

  if (owners.length === 0) {
    console.log("\n  No owner accounts found.\n");
    return;
  }

  console.log("\n  Owner accounts found:\n");
  owners.forEach((o) => console.log(`    · ${o.name} <${o.email}>`));

  console.log("");
  const confirm = await ask("  Delete all of the above + their turfs, slots, bookings? (y/n): ");
  if (confirm !== "y" && confirm !== "yes") {
    console.log("\n  Cancelled.\n");
    return;
  }

  const ownerIds = owners.map((o) => o.id);

  // FK order: reviews → waitlist → payments → bookings → reports → slots → turfs → users
  const reviews = await prisma.review.deleteMany({
    where: { booking: { slot: { turf: { ownerId: { in: ownerIds } } } } },
  });

  const waitlist = await prisma.waitlist.deleteMany({
    where: { slot: { turf: { ownerId: { in: ownerIds } } } },
  });

  const payments = await prisma.payment.deleteMany({
    where: { booking: { slot: { turf: { ownerId: { in: ownerIds } } } } },
  });

  const bookings = await prisma.booking.deleteMany({
    where: { slot: { turf: { ownerId: { in: ownerIds } } } },
  });

  const reports = await prisma.turfReport.deleteMany({
    where: { turfId: { in: (await prisma.turf.findMany({ where: { ownerId: { in: ownerIds } }, select: { id: true } })).map((t) => t.id) } },
  });

  const slots = await prisma.slot.deleteMany({
    where: { turf: { ownerId: { in: ownerIds } } },
  });

  const turfs = await prisma.turf.deleteMany({
    where: { ownerId: { in: ownerIds } },
  });

  const users = await prisma.user.deleteMany({
    where: { id: { in: ownerIds } },
  });

  console.log("");
  console.log("  ✓ Reviews deleted    " + reviews.count);
  console.log("  ✓ Waitlist deleted   " + waitlist.count);
  console.log("  ✓ Payments deleted   " + payments.count);
  console.log("  ✓ Bookings deleted   " + bookings.count);
  console.log("  ✓ Reports deleted    " + reports.count);
  console.log("  ✓ Slots deleted      " + slots.count);
  console.log("  ✓ Turfs deleted      " + turfs.count);
  console.log("  ✓ Owners deleted     " + users.count);
  console.log("\n  Done.\n");
}

main()
  .catch((e) => { console.error("\n  Error:", e.message, "\n"); process.exit(1); })
  .finally(() => prisma.$disconnect());
