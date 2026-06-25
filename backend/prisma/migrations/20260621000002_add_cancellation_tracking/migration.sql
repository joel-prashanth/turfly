-- AlterTable: capture when a booking was cancelled
ALTER TABLE "Booking" ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- AlterTable: cooldown block for repeat late cancellers
ALTER TABLE "User" ADD COLUMN "cooldownUntil" TIMESTAMP(3);
