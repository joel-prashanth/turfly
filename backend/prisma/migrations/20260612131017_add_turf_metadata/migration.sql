/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Turf` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Turf` table. All the data in the column will be lost.
  - Added the required column `sport` to the `Turf` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Turf` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('FOOTBALL', 'CRICKET', 'BADMINTON', 'TENNIS', 'BASKETBALL', 'VOLLEYBALL');

-- AlterTable
ALTER TABLE "Turf" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sport" "Sport" NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
