/**
 * Turfly — Demo Reset
 *
 * Wipes test data before a client demo, keeping owner accounts intact.
 *
 * Usage:
 *   npm run demo:reset
 *
 * Modes (prompted interactively):
 *   full  — deletes payments, bookings, reports, slots, turfs, player accounts
 *   soft  — deletes payments, bookings, resets slot statuses; keeps turfs & slots
 */

const { PrismaClient } = require("@prisma/client");
const readline = require("readline");

const prisma = new PrismaClient();

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function line() {
  console.log("  " + "─".repeat(44));
}

async function fullReset() {
  const payments   = await prisma.payment.deleteMany();
  const bookings   = await prisma.booking.deleteMany();
  const reports    = await prisma.turfReport.deleteMany();
  const slots      = await prisma.slot.deleteMany();
  const turfs      = await prisma.turf.deleteMany();
  const players    = await prisma.user.deleteMany({ where: { role: "PLAYER" } });

  const owners = await prisma.user.findMany({
    where: { role: "OWNER" },
    select: { name: true, email: true },
  });

  console.log("");
  console.log("  ✓ Payments deleted          " + payments.count);
  console.log("  ✓ Bookings deleted          " + bookings.count);
  console.log("  ✓ Reports deleted           " + reports.count);
  console.log("  ✓ Slots deleted             " + slots.count);
  console.log("  ✓ Turfs deleted             " + turfs.count);
  console.log("  ✓ Player accounts deleted   " + players.count);
  console.log("");
  console.log("  Owner accounts kept:");
  owners.forEach((o) => console.log(`    · ${o.name} <${o.email}>`));
}

async function softReset() {
  const payments = await prisma.payment.deleteMany();
  const bookings = await prisma.booking.deleteMany();
  const slots    = await prisma.slot.updateMany({
    data: { status: "AVAILABLE" },
  });
  const players  = await prisma.user.deleteMany({ where: { role: "PLAYER" } });

  console.log("");
  console.log("  ✓ Payments deleted          " + payments.count);
  console.log("  ✓ Bookings deleted          " + bookings.count);
  console.log("  ✓ Slots reset → AVAILABLE   " + slots.count);
  console.log("  ✓ Player accounts deleted   " + players.count);
  console.log("");
  console.log("  Turfs and slots are intact and ready to demo.");
}

async function main() {
  console.log("");
  line();
  console.log("  Turfly — Demo Reset");
  line();
  console.log("");
  console.log("  [1] Full reset   delete turfs, slots, bookings, players");
  console.log("      Use when: starting completely from scratch");
  console.log("");
  console.log("  [2] Soft reset   clear bookings only, keep turfs & slots");
  console.log("      Use when: you've set up demo turfs and just want to");
  console.log("      clear test bookings before showing a client");
  console.log("");

  const mode = await ask("  Choose mode (1 or 2): ");

  if (mode !== "1" && mode !== "2") {
    console.log("\n  Invalid choice. Exiting.\n");
    process.exit(0);
  }

  const label = mode === "1" ? "FULL RESET (all data)" : "SOFT RESET (bookings only)";
  console.log("");
  const confirm = await ask(`  Confirm ${label}? This cannot be undone. (y/n): `);

  if (confirm !== "y" && confirm !== "yes") {
    console.log("\n  Cancelled — nothing was deleted.\n");
    process.exit(0);
  }

  console.log("");
  line();

  if (mode === "1") {
    await fullReset();
  } else {
    await softReset();
  }

  line();
  console.log("  Database is clean. Ready for your demo.\n");
}

main()
  .catch((e) => {
    console.error("\n  Error:", e.message, "\n");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
