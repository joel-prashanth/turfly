/*
  Warnings:

  - Made the column `imageUrl` on table `Turf` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Turf" ADD COLUMN     "imagePublicId" TEXT,
ALTER COLUMN "imageUrl" SET NOT NULL;
