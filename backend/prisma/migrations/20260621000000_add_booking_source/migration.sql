-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('PLATFORM', 'OWNER_MANUAL');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "source" "BookingSource" NOT NULL DEFAULT 'PLATFORM';
